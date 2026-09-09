import { CoreManager } from "manager/CoreManager";
import { App, parseYaml } from "obsidian";
import { ThirdFactory } from "third/ThirdFactory";
import * as obsidian from "obsidian";
import { ImageConverter } from "core/ImageConverter";
import { VIEW_TYPE_BOARD } from "view/PlutoBoardView";
import { bufferToBlobUrl, find_tfile, getAvailablePlugins } from "utils/helper";
import { ViewManager } from "manager/ViewManager";
import { FormManager } from "manager/FormManager";
import ThemeManager from "manager/ThemeManager";
import { ConfigManager } from "manager/ConfigManager";
import { PluginContext } from "core/PluginContext";

const PLUGIN_BIND_TIMEOUT = 30000;

export class Pluto implements IPluto {
    app: App;
    web: any;
    images: any;
    third: Third;
    self: obsidian.PlutoPlugin;
    helper: any;
    skin: any;
    themeManager: ThemeManager;
    viewManager: ViewManager;
    coreManager: CoreManager;
    formManager: FormManager;
    configManager: ConfigManager;
    private bindingPromises = new Map<PlutoProps, Promise<boolean>>();
    private boundPlugins = new Set<PlutoProps>();

    constructor() {
        this.app = PluginContext.plugin.app;
        this.self = PluginContext.plugin;
        window.pluto = this;
        this.viewManager = new ViewManager();
        this.formManager = new FormManager();
        this.themeManager = new ThemeManager();
        this.coreManager = new CoreManager();
        this.configManager = new ConfigManager();
    }

    boot() {
        const settings = this.self.settings;
        this.images = new ImageConverter(this.app);
        this.helper = {
            find_tfile: find_tfile.bind(this, this.app),
            stringifyYaml: obsidian.stringifyYaml.bind(obsidian),
            parseYaml: parseYaml.bind(obsidian),
            getAvailablePlugins,
            bufferToBlobUrl,
            obsidian,
        };
        this.third = ThirdFactory.createThirdComponent(settings.configPath);
        const plugin = this.self;
        // 注册视图
        this.viewManager.build();
        // 在布局准备就绪时加载所有模块
        plugin.app.workspace.onLayoutReady(async () => {
            await this.coreManager.runAllEnabled();
            // 动态检测并绑定第三方插件依赖
            ThirdFactory.loop((prop: PlutoProps) => this.bindPlugin(prop));
        });
    }

    // 绑定单个插件依赖
    async bindPlugin(prop: PlutoProps) {
        if (this.boundPlugins.has(prop)) return;

        const existingBinding = this.bindingPromises.get(prop);
        if (existingBinding) {
            await existingBinding;
            return;
        }

        const binding = this.bindPluginWhenAvailable(prop);
        this.bindingPromises.set(prop, binding);
        try {
            if (await binding) this.boundPlugins.add(prop);
        } finally {
            if (this.bindingPromises.get(prop) === binding) {
                this.bindingPromises.delete(prop);
            }
        }
    }

    private async bindPluginWhenAvailable(prop: PlutoProps): Promise<boolean> {
        // 尝试绑定的函数
        const tryBind = async () => {
            const component: ThirdComponent = this.third[prop];
            const op = this.app.plugins.plugins[component.pluginId];
            if (op) {
                await component.bind(op, prop).executeAll();
                return true;
            }
            return false;
        };

        // 如果已经加载了，直接绑定
        if (await tryBind()) return true;

        // 如果没加载，等待依赖插件发出的 loaded 事件
        return await new Promise<boolean>((resolve) => {
            let settled = false;
            let inFlight = false;
            const component = this.third[prop];
            const eventName = `${component.pluginId}-loaded`;
            const finish = (bound: boolean) => {
                if (settled) return;
                settled = true;
                clearTimeout(timeout);
                window.removeEventListener(eventName, onLoaded, false);
                resolve(bound);
            };
            const onLoaded = () => {
                if (inFlight) return;
                inFlight = true;
                void tryBind().then((bound) => {
                    if (bound) finish(true);
                }).finally(() => {
                    inFlight = false;
                });
            };
            window.addEventListener(eventName, onLoaded, false);
            const timeout = setTimeout(() => finish(false), PLUGIN_BIND_TIMEOUT);
        });
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