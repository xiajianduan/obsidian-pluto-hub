import { CoreManager } from "exec/CoreManager";
import { App, normalizePath, TFile } from "obsidian";
import { ThirdFactory } from "third/ThirdFactory";
import { PlutoSettings } from "types/pluto";
import * as obsidian from "obsidian";
import { ImageConverter } from "core/ImageConverter";
import PlutoHubPlugin from "main";
import { PLUTO_VIEW_TYPE, PlutoView } from "view";

export class Pluto implements IPluto {
    app: App;
    config: any;
    web: any;
    images: any;
    core: any;
    third: Third;
    self: PlutoHubPlugin;
    helper: any;

    constructor(plugin: PlutoHubPlugin) {
        this.app = plugin.app;
        this.config = {};
        this.self = plugin;
        window.pluto = this;
    }

    boot() {
        const settings = this.self.settings;
        this.images = new ImageConverter(this.app);
        this.helper = {
            find_tfile: this.find_tfile.bind(this, this.app),
            obsidian,
        };
        this.core = CoreManager.createCoreExecutor(settings.configPath);
        this.third = ThirdFactory.createThirdComponent(settings.configPath);
        const plugin = this.self;
        // 注册 PlutoView 视图
        plugin.registerView(PLUTO_VIEW_TYPE, (leaf) => new PlutoView(leaf, plugin));
        // 在布局准备就绪时加载所有模块
        plugin.app.workspace.onLayoutReady(async () => {
            await CoreManager.runAllEnabled(plugin);
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
            const component : ThirdComponent = this.third[prop];
            const op = this.app.plugins.plugins[component.pluginId];
            if (op) {
                await sleep(1000); // 等待 1 秒，确保插件完全加载
                await component.bind(op, prop).executeAll();
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


    find_tfile(app: App, name: string): TFile | null {
        const normalizedName = normalizePath(name);
        return app.metadataCache.getFirstLinkpathDest(normalizedName, "");
    }

    async importJs(path: string) {
        let resourcePath = this.app.vault.adapter.getResourcePath(path);
        const file = resourcePath.split("?")[0]!;
        return import(file);
    }

    getModule(name: string) {
        return (window as any).pluto.third.modules[name];
    }
    registerModule(name: string, exports: any): void {
        (window as any).pluto.third.modules[name] = exports;
    }
}