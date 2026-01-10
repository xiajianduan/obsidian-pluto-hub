import { CoreManager } from "manager/CoreManager";
import { App, parseYaml } from "obsidian";
import { ThirdFactory } from "third/ThirdFactory";
import * as obsidian from "obsidian";
import { ImageConverter } from "core/ImageConverter";
import PlutoHubPlugin from "main";
import { VIEW_TYPE_BOARD } from "view/PlutoBoardView";
import { find_tfile, getAvailablePlugins } from "utils/helper";
import { ViewManager } from "manager/ViewManager";
import { FormManager } from "manager/FormManager";
import ThemeManager from "manager/ThemeManager";

export class Pluto implements IPluto {
    app: App;
    config: any;
    web: any;
    images: any;
    third: Third;
    self: PlutoHubPlugin;
    helper: any;
    skin: any;
    themeManager: ThemeManager;
    viewManager: ViewManager;
    coreManager: CoreManager;
    formManager: FormManager;



    constructor(plugin: PlutoHubPlugin) {
        this.app = plugin.app;
        this.config = {};
        this.self = plugin;
        window.pluto = this;
        this.viewManager = new ViewManager();
        this.formManager = new FormManager();
        this.themeManager = new ThemeManager();
        this.coreManager = new CoreManager();
    }

    boot() {
        const settings = this.self.settings;
        this.images = new ImageConverter(this.app);
        this.helper = {
            find_tfile: find_tfile.bind(this, this.app),
            stringifyYaml: obsidian.stringifyYaml.bind(obsidian),
            parseYaml: parseYaml.bind(obsidian),
            getAvailablePlugins: getAvailablePlugins.bind(this),
            flushComponents: this.third?.react?.op?.requestComponentUpdate.bind(this.third.react.op),
            obsidian,
        };
        this.third = ThirdFactory.createThirdComponent(settings.configPath);
        const plugin = this.self;
        // 注册视图
        this.viewManager.build(plugin);
        // 在布局准备就绪时加载所有模块
        plugin.app.workspace.onLayoutReady(async () => {
            await this.coreManager.runAllEnabled(plugin);
            // 动态检测并绑定第三方插件依赖
            this.bindPluginDependencies();
        });
    }

    // 绑定第三方插件依赖
    bindPluginDependencies() {
        Object.keys(ThirdFactory.componentMap).forEach((prop: PlutoProps) => {
            this.bindPlugin(prop);
        });
    }

    // 绑定单个插件依赖
    async bindPlugin(prop: PlutoProps) {
        // 尝试绑定的函数
        const tryBind = async () => {
            const component: ThirdComponent = this.third[prop];
            const op = this.app.plugins.plugins[component.pluginId];
            if (op) {
                await sleep(1000); // 等待 1 秒，确保插件完全加载
                component.bind(op, prop).executeAll();
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
        }, 3000);

        // 设置一个超时保护，防止无限轮询（30 秒后停止）
        setTimeout(() => clearInterval(timer), 30000);
    }

    async importJs(path: string) {
        let resourcePath = this.app.vault.adapter.getResourcePath(path);
        const file = resourcePath.split("?")[0]!;
        return import(file);
    }

    getConfig(name: string) {
        const config = this.third.assets[name].yaml.get(name);
        if(config) return config;
        return this.third.assets[name].json.get("data.json");
    }

    async getConfigLive(name: string) {
        const content = await app.vault.adapter.read(`${pluto.self.settings.configPath}/${name}.yaml`);
        const config = parseYaml(content);
        this.third.assets[name].yaml.set(name, config);
        if(config) return config;
        
    }

    getModule(name: string) {
        return this.third.modules[name];
    }
    registerModule(name: string, exports: any): void {
        this.third.modules[name] = exports;
    }

    static async activateView(app: App) {
        const { workspace } = app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_BOARD)[0];
        if (!leaf) {
            leaf = workspace.getLeaf('tab');
            await leaf.setViewState({ type: VIEW_TYPE_BOARD, active: true });
        }
        void workspace.revealLeaf(leaf);
    }
}