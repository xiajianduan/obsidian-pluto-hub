import { Plugin } from 'obsidian';
import { PLUTO_VIEW_TYPE } from './view';
import { ModStorage } from './storage';
import { DEFAULT_SETTINGS, PlutoSettingTab } from 'settings';
import { t } from 'utils/translation';
import { PlutoSettings } from 'types/pluto';
import { Pluto } from 'pluto';

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
        new Pluto(this).boot();
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