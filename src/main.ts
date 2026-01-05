import { getFrontMatterInfo, parseYaml, Plugin } from 'obsidian';
import { PlutoView, PLUTO_VIEW_TYPE } from './view';
import { ModStorage } from './storage';
import { DEFAULT_SETTINGS, PlutoSettingTab } from 'settings';
import { t } from 'utils/translation';
import { ThirdFactory } from './third/ThirdFactory';
import { base64ToBlobUrl, isImageFile } from 'utils/helper';
import { MiniModule, PlutoSettings } from 'types/pluto';
import { Pluto } from 'pluto';
import { CoreManager } from 'exec/CoreManager';

export default class PlutoHubPlugin extends Plugin {

    settings: PlutoSettings;

    async onload() {
        await this.loadSettings();
        // 从存储路径加载所有模块
        await ModStorage.loadAllModulesFromStorage(this);
        await this.initializePlugin();
        // 初始化 i18n 翻译函数
        this.i18n();
        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new PlutoSettingTab(this.app, this));
    }

    i18n() {
        const t = (key: string, vars?: Record<string, unknown>): string => {
            // @ts-ignore - Obsidian's i18n isn't in the official types
            return this.app.i18n.t(key, vars);
        };
    }

    async initializePlugin() {
        // 添加自定义 Ribbon 图标
        this.addCustomRibbonIcon();
        // 初始化并挂载全局 Pluto 对象
        window.pluto = new Pluto(this, this.settings);
        // 注册 PlutoView 视图
        this.registerView(PLUTO_VIEW_TYPE, (leaf) => new PlutoView(leaf, this));
        // 在布局准备就绪时加载所有模块
        this.app.workspace.onLayoutReady(async () => {
            await CoreManager.runAllEnabled(this);
            // 动态检测并绑定第三方插件依赖
            this.bindPluginDependencies();
        });
    }

    // 绑定第三方插件依赖
    bindPluginDependencies() {
        // 确保pluto对象存在
        if (!(window as any).pluto) {
            (window as any).pluto = {};
        }

        const pluginMappings: { [key: string]: { prop: string, getter: () => any } } = {

            'dataview': { prop: 'dva', getter: () => (this.app as any).plugins.plugins['dataview']?.api },
            'react-components': { prop: 'react', getter: () => (this.app as any).plugins.plugins['obsidian-react-components'] },
            'quickadd': { prop: 'qa', getter: () => (window as any).quickAddApi || null },
            'templater-obsidian': { prop: 'templater', getter: () => (this.app as any).plugins.plugins['templater-obsidian'] }
        };

        for (const [pluginId, mapping] of Object.entries(pluginMappings)) {
            this.bindPlugin(mapping.prop as PlutoProps, mapping.getter);
        }
    }

    // 绑定单个插件依赖
    async bindPlugin(prop: PlutoProps, getter: () => any) {
        // 尝试绑定的函数
        const tryBind = async () => {
            const op = getter();
            if (op) {
                await sleep(1000); // 等待 1 秒，确保插件完全加载
                const third = window.pluto.third[prop];
                await third.bind(op, prop).executeAll();
                return true;
            }
            return false;
        };

        // 如果已经加载了，直接绑定
        if (await tryBind()) return;

        // 如果没加载，利用 Obsidian 的事件钩子轮询
        const timer = setInterval(async () => {
            if (await tryBind()) {
                clearInterval(timer); // 绑定成功后停止轮询
            }
        }, 1000);

        // 设置一个超时保护，防止无限轮询（30 秒后停止）
        setTimeout(() => clearInterval(timer), 30000);
    }

    addCustomRibbonIcon() {
        this.addRibbonIcon('layout-grid', t("pluto.hub"), () => {
            this.activateView();
        });
    }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(PLUTO_VIEW_TYPE)[0];
        if (!leaf) {
            leaf = workspace.getLeaf('tab');
            await leaf.setViewState({ type: PLUTO_VIEW_TYPE, active: true });
        }
        void workspace.revealLeaf(leaf);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}