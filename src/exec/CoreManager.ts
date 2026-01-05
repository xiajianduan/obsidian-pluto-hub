import { SimpleThirdComponent } from "third/SimpleThirdComponent";
import { SandboxExecutor } from "./SandboxExecutor";
import { CssExecutor } from "./CssExecutor";
import { MiniModule } from "types/pluto";
import { ImageExecutor } from "./ImageExecutor";
import { JsonExecutor } from "./JsonExecutor";
import { MarkdownExecutor } from "./MarkdownExecutor";
import { ModStorage } from "storage";
import PlutoHubPlugin from "main";


// CoreComponent工厂类，用于根据prop创建相应的组件实例
export class CoreManager {
    static core: Core;
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private static componentMap: Record<string, any> = {
        'css': CssExecutor,
        'json': JsonExecutor,
        'image': ImageExecutor,
        'markdown': MarkdownExecutor,
        'sandbox': SandboxExecutor,
    };

    static create(prop: string, configPath: string): CoreExecutor {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop] || SimpleThirdComponent;
        return new ComponentClass(configPath);
    }

    static createCoreExecutor(configPath: string): Core {
        return CoreManager.core = {
            css: CoreManager.create('css', configPath),
            json: CoreManager.create('json', configPath),
            image: CoreManager.create('image', configPath),
            markdown: CoreManager.create('markdown', configPath),
            sandbox: CoreManager.create('sandbox', configPath),
        }
    }
    static runBundle(module: MiniModule, started: boolean): void {
        const entry = {
            json: new Map(),
            images: new Map(),
        };
        window.pluto.third.assets[module.name] = entry;
        // 1. 执行所有 CoreComponent
        Object.values(CoreManager.core).forEach(component => {
            component.execute(module, started);
        });
    }

    // 运行所有启用的模块
    static async runAllEnabled(plugin: PlutoHubPlugin) {
        // 清理所有 Pluto 注入的旧样式，防止重复累积
        document.querySelectorAll('[id^="pluto-css-"]').forEach(el => el.remove());

        // 从存储中加载所有模块
        const modules = await ModStorage.loadAllModulesFromStorage(plugin);

        for (const mod of modules) {
            if (mod.enabled) {
                try {
                    CoreManager.runBundle(mod, false);
                } catch (e) {
                    console.error(`[Pluto Hub] Failed to load module ${mod.name}:`, e);
                }
            }
        }
    }
}
