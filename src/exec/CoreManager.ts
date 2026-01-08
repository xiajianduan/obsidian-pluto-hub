import { SandboxExecutor } from "./SandboxExecutor";
import { CssExecutor } from "./CssExecutor";
import { ImageExecutor } from "./ImageExecutor";
import { JsonExecutor } from "./JsonExecutor";
import { MarkdownExecutor } from "./MarkdownExecutor";
import { ModStorage } from "storage";
import PlutoHubPlugin from "main";
import { Notice } from "obsidian";
import { YamlExecutor } from "./YamlExecutor";


// CoreComponent工厂类，用于根据prop创建相应的组件实例
export class CoreManager {
    static core: Core;
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private static componentMap: Record<string, any> = {
        'yaml': YamlExecutor,
        'css': CssExecutor,
        'json': JsonExecutor,
        'image': ImageExecutor,
        'markdown': MarkdownExecutor,
        'sandbox': SandboxExecutor,
    };

    static create(prop: string, configPath: string): CoreExecutor {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop];
        return new ComponentClass(configPath);
    }

    static createCoreExecutor(configPath: string): Core {
        return CoreManager.core = {
            yaml: CoreManager.create('yaml', configPath),
            css: CoreManager.create('css', configPath),
            json: CoreManager.create('json', configPath),
            image: CoreManager.create('image', configPath),
            markdown: CoreManager.create('markdown', configPath),
            sandbox: CoreManager.create('sandbox', configPath),
        }
    }
    static async runBundle(module: MiniModule, started: boolean): Promise<void> {
        const entry = {
            json: new Map(),
            images: new Map(),
            yaml: new Map(),
        };
        pluto.third.assets[module.name] = entry;
        try {
            const filesByType = module.files.groupBy(file => file.type);
            for (const type of Object.keys(filesByType)) {
                const files = filesByType[type];
                // const component = CoreManager.core[type as keyof Core];
                for (const component of Object.values(CoreManager.core)) {
                    if (component.excutable(type)) {
                        module.tmpFiles = files;
                        await component.execute(module, started);
                        delete module.tmpFiles;
                    }
                };
            }
        } catch (e: any) {
            new Notice(e.message);
            console.info(`%c[Pluto Hub] ${e.message}`, 'color: red');
        }

    }

    static async runModules(modules: MiniModule[], started: boolean) {
        const sorted = modules.filter(mod => mod.enabled).sort((a, b) => a.order - b.order);
        for (const mod of sorted) {
            if (mod.type === 'I') {
                await CoreManager.runBundle(mod, started);
            } else {
                CoreManager.runBundle(mod, started);
            }
        }
    }

    // 运行所有启用的模块
    static async runAllEnabled(plugin: PlutoHubPlugin) {
        // 清理所有 Pluto 注入的旧样式，防止重复累积
        document.querySelectorAll('[id^="pluto-css-"]').forEach(el => el.remove());

        // 从存储中加载所有模块
        const modules = await ModStorage.loadAllFromStorage(plugin);
        CoreManager.runModules(modules, false);
    }
}
