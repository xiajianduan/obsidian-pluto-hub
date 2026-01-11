import { SandboxExecutor } from "../exec/SandboxExecutor";
import { CssExecutor } from "../exec/CssExecutor";
import { ImageExecutor } from "../exec/ImageExecutor";
import { JsonExecutor } from "../exec/JsonExecutor";
import { MarkdownExecutor } from "../exec/MarkdownExecutor";
import { ModStorage } from "storage";
import PlutoHubPlugin from "main";
import { Notice } from "obsidian";
import { YamlExecutor } from "../exec/YamlExecutor";
import { PageExecutor } from "exec/PageExecutor";


// CoreComponent工厂类，用于根据prop创建相应的组件实例
export class CoreManager {
    static core: Core;
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private componentMap: Record<string, any> = {
        'css': CssExecutor,
        'yaml': YamlExecutor,
        'json': JsonExecutor,
        'jpg': ImageExecutor,
        'md': MarkdownExecutor,
        'js': SandboxExecutor,
        'page': PageExecutor,
    };

    create(prop: string): CoreExecutor {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop];
        return new ComponentClass();
    }
    
    async runBundle(module: MiniModule, started: boolean): Promise<void> {
        const entry = {
            json: new Map(),
            images: new Map(),
            yaml: new Map(),
            css: new Map(),
            page: new Map(),
        };
        pluto.third.assets[module.name] = entry;
        try {
            const filesByType = module.files.groupBy(file => file.type);
            for (const key of Object.keys(this.componentMap)) {
                const files = filesByType[key];
                if (files && files.length > 0) {
                    const executor = this.create(key);
                    module.tmpFiles = files;
                    await executor.execute(module, started);
                    delete module.tmpFiles;
                }
            }
        } catch (e: any) {
            new Notice(e.message);
            navigator.clipboard.writeText(e.stack);
            console.info(`%c[Pluto Hub] ${e}`, 'color: red');
        }

    }

    async runModules(modules: MiniModule[], started: boolean) {
        const sorted = modules.filter(mod => mod.enabled).sort((a, b) => a.order - b.order);
        for (const mod of sorted) {
            if (mod.type === 'I') {
                await this.runBundle(mod, started);
            } else {
                this.runBundle(mod, started);
            }
        }
    }

    // 运行所有启用的模块
    async runAllEnabled(plugin: PlutoHubPlugin) {
        // 清理所有 Pluto 注入的旧样式，防止重复累积
        document.querySelectorAll('[id^="pluto-css-"]').forEach(el => el.remove());

        // 从存储中加载所有模块
        const modules = await ModStorage.loadAllFromStorage(plugin);
        this.runModules(modules, false);
    }
}
