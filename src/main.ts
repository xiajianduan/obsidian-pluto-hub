import { getFrontMatterInfo, parseYaml, Plugin } from 'obsidian';
import { PlutoView, PLUTO_VIEW_TYPE } from './view';
import { ModStorage } from './storage';
import { DEFAULT_SETTINGS, MiniModule, PlutoSettings, PlutoSettingTab } from 'settings';
import { t } from 'utils/translation';
import { ThirdFactory } from './third/third';
import { isImageFile } from 'utils/helper';

export default class PlutoHubPlugin extends Plugin {

    settings: PlutoSettings;

    async onload() {
        await this.loadSettings();
        
        // 从存储路径加载所有模块
        await ModStorage.loadAllModulesFromStorage(this);
        
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

        // 初始化并挂载全局 Pluto 对象
        this.initPlutoObject();

        this.registerView(PLUTO_VIEW_TYPE, (leaf) => new PlutoView(leaf, this));
        
        // 在布局准备就绪时加载所有模块
        this.app.workspace.onLayoutReady(() => this.runAllEnabled());
    }

    // 初始化全局 Pluto 对象
    initPlutoObject() {
        // 创建或重置 pluto 对象
        (window as any).pluto = {
            app: this.app,
            config: {}, // 用于存储 JSON 配置
            modules: {}, // 用于存储模块输出
            // 依赖映射
            dva: ThirdFactory.create('dva'), // Dataview
            react: ThirdFactory.create('react'), // React Components
            qa: ThirdFactory.create('qa'), // QuickAdd
            templater: ThirdFactory.create('templater'), // Templater
            // 提供模块管理 API
            getModule: (name: string) => (window as any).pluto.modules[name],
            registerModule: (name: string, exports: any) => {
                (window as any).pluto.modules[name] = exports;
            }
        };

        // 动态检测并绑定第三方插件依赖
        this.bindPluginDependencies();
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
            this.bindPlugin(mapping.prop, mapping.getter);
        }
    }

    // 绑定单个插件依赖
    bindPlugin(prop: string, getter: () => any) {
        // 尝试绑定的函数
        const tryBind = () => {
            const op = getter();
            if (op) {
                const third = window.pluto[prop];
                third.bind(op, prop).execute();
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

        // 设置一个超时保护，防止无限轮询（30 秒后停止）
        setTimeout(() => clearInterval(timer), 30000);
    }

    addCustomRibbonIcon() {
        this.addRibbonIcon('layout-grid', t("pluto.hub"), () => {
            this.activateView();
        });
    }

    // 注入 CSS 样式到文档头部
    injectStyle(id: string, code: string) {
        let el = document.getElementById(`pluto-css-${id}`);
        if (!el) {
            el = document.createElement('style');
            el.id = `pluto-css-${id}`;
            document.head.appendChild(el);
        }
        el.textContent = code;
    }

    // 运行单个模块包
    runBundle(module: MiniModule) {
        const pluto = window.pluto;
        
        // 1. 注入所有 CSS 文件
        module.files.filter(f => f.type === 'css').forEach(file => {
            this.injectStyle(`${module.id}-${file.name}`, file.content);
        });

        // 2. 解析并挂载所有 JSON 配置文件
        module.files.filter(f => f.type === 'json').forEach(file => {
            try {
                const config = JSON.parse(file.content);
                // 将配置挂载到 pluto.config[模块名]
                pluto.config[module.name] = config;
            } catch (e) {
                console.error(`Error parsing JSON file ${file.name}:`, e);
            }
        });
        // 2. 解析并挂载所有 图片 配置文件
        module.files.filter(f => isImageFile(f.type)).forEach(file => {
            try {
                // 将配置挂载到 pluto.config[模块名]
                pluto.config[module.name] = null;
            } catch (e) {
                console.error(`Error parsing image file ${file.name}:`, e);
            }
        });
        // 3. 解析并挂载所有 Markdown 文件
        module.files.filter(f => f.type === 'md').forEach(file => {
            try {
                const info = getFrontMatterInfo(file.content);
                const yaml = parseYaml(info.frontmatter);
                const definesReactComponents = yaml['defines-react-components'] || false;
                if(definesReactComponents) {
                    const matches = /^\s*?```jsx:component:(.*)\n((.|\n)*?)\n^\s*?```$/gm.exec(file.content)
                    if(matches && matches.length === 4) {
                        const namespace = yaml['react-components-namespace'] || 'Global';
                        pluto.react.register({
                            code: matches[2],
                            name: matches[1],
                            namespace: namespace,
                            suppressRefresh: true
                        });
                    }
                }
            } catch (e) {
                console.error(`Error parsing YAML file ${file.name}:`, e);
            }
        });
        // 4. 执行所有 JS 文件
        const jsFiles = module.files.filter(f => f.type === 'js');
        jsFiles.forEach(file => {
            try {
                // 创建模块导出对象
                const moduleExports: Record<string, any> = {};
                const exports = moduleExports;
                
                const context = {
                    app: this.app,
                    pluto: pluto,
                    mod: module, // 将模块信息暴露给脚本
                    // 允许 JS 访问同模块下的其他文件
                    getFile: (name: string) => module.files.find(f => f.name === name)?.content,
                    // 添加 CommonJS 模块导出支持
                    module: { exports: moduleExports },
                    exports: exports,
                    // 添加 ES 模块导出支持
                    export: function(name: string, value: any) {
                        moduleExports[name] = value;
                    }
                };
                
                // 使用 new Function 执行代码，提供安全的执行上下文
                const runner = new Function('ctx', `with(ctx) { ${file.content} }`);
                const result = runner(context);
                
                // 处理模块导出
                let moduleResult;
                if (result) {
                    // 优先使用 return 的结果
                    moduleResult = result;
                } else if (Object.keys(moduleExports).length > 0) {
                    // 其次使用 module.exports 或 exports
                    moduleResult = moduleExports;
                }
                
                // 如果有模块导出结果，将其挂载到 pluto.modules
                if (moduleResult) {
                    pluto.modules[module.name] = moduleResult;
                }
            } catch (e) {
                console.error(`Error in ${file.name}:`, e);
            }
        });
    }

    // 运行所有启用的模块
    async runAllEnabled() {
        // 清理所有 Pluto 注入的旧样式，防止重复累积
        document.querySelectorAll('[id^="pluto-css-"]').forEach(el => el.remove());

        // 从存储中加载所有模块
        const modules = await ModStorage.loadAllModulesFromStorage(this);
        
        for (const mod of modules) {
            if (mod.enabled) {
                try {
                    this.runBundle(mod);
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