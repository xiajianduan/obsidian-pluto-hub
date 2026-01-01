import { Plugin } from 'obsidian';
import { PlutoView, PLUTO_VIEW_TYPE } from './view';
import { ModStorage } from './storage';
import { DEFAULT_SETTINGS, MiniModule, ModuleBundle, PlutoSettings, PlutoSettingTab } from 'settings';
import { t } from 'utils/translation';

export default class PlutoHubPlugin extends Plugin {

    settings: PlutoSettings;

    async onload() {
        await this.loadSettings();
        await this.initializePlugin();

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
        this.addCustomRibbonIcon();

        // 挂载全局 Pluto 对象
        (window as any).pluto = {
            dv: null, // TODO: 挂载 Dataview
            rc: null, // TODO: 挂载 React Components
            qa: null,
            modules: {}
        };
        this.bindPlugin("qa", () => { return window.quickAddApi });

        this.registerView(PLUTO_VIEW_TYPE, (leaf) => new PlutoView(leaf, this));
        this.app.workspace.onLayoutReady(() => this.runAllEnabled());
    }

    bindPlugin(prop: string, script: Function) {
        // 尝试绑定的函数
        const tryBind = () => {
            const api = script();
            if (api) {
                (window as any).pluto[prop] = api;
                console.log(`[Pluto Hub] ${prop} API successfully bound to pluto.${prop}`);
                return true;
            }
            return false;
        };

        // 如果已经加载了，直接绑定
        if (tryBind()) return;

        // 如果没加载，利用 Obsidian 的事件钩子轮询
        const timer = setInterval(() => {
            if (tryBind()) {
                clearInterval(timer); // 绑定成功后停止轮询
            }
        }, 1000);

        // 设置一个超时保护，防止无限轮询（可选，比如 30 秒后停止）
        setTimeout(() => clearInterval(timer), 30000);
    }

    addCustomRibbonIcon() {
        this.addRibbonIcon('layout-grid', t("pluto.hub"), () => {
            this.activateView();
        });
    }

    injectStyle(id: string, code: string) {
        let el = document.getElementById(`pluto-css-${id}`);
        if (!el) {
            el = document.createElement('style');
            el.id = `pluto-css-${id}`;
            document.head.appendChild(el);
        }
        el.textContent = code;
    }

    runBundle(bundle: ModuleBundle) {
        // 1. 注入所有 CSS 文件
        bundle.files.filter(f => f.type === 'css').forEach(cssFile => {
            let el = document.getElementById(`pluto-css-${bundle.id}-${cssFile.name}`);
            if (!el) {
                el = document.createElement('style');
                el.id = `pluto-css-${bundle.id}-${cssFile.name}`;
                document.head.appendChild(el);
            }
            el.textContent = cssFile.content;
        });

        // 2. 执行所有 JS 文件 (或只执行入口 main.js)
        const jsFiles = bundle.files.filter(f => f.type === 'js');
        const jsonFiles = bundle.files.filter(f => f.type === 'json');

        jsFiles.forEach(jsFile => {
            try {
                const context = {
                    app: this.app,
                    pluto: (window as any).pluto,
                    // 允许 JS 访问同模块下的其他 JSON
                    getFile: (name: string) => bundle.files.find(f => f.name === name)?.content
                };
                const runner = new Function('ctx', `with(ctx) { ${jsFile.content} }`);
                runner(context);
            } catch (e) {
                console.error(`Error in ${jsFile.name}:`, e);
            }
        });
    }

    async runAllEnabled() {
        // 清理所有 Pluto 注入的旧样式，防止重复累积
        document.querySelectorAll('[id^="pluto-css-"]').forEach(el => el.remove());

        for (const mod of this.settings.modules) {
            if (mod.enabled) {
                try {
                    // 读取整个二进制包
                    const bundle = await ModStorage.loadBundle(this, mod.id);
                    this.runBundle(bundle);
                } catch (e) {
                    console.error(`[Pluto Hub] Failed to load module ${mod.name}:`, e);
                }
            }
        }
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