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
import { GlbExecutor } from "exec/GlbExecutor";
import { t } from "utils/translation";


// CoreComponent工厂类，用于根据prop创建相应的组件实例
export class CoreManager {

    static core: Core;
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private componentMap: Record<string, any> = {
        'css': CssExecutor,
        'yaml': YamlExecutor,
        'json': JsonExecutor,
        'jpg': ImageExecutor,
        'gif': ImageExecutor,
        'md': MarkdownExecutor,
        'js': SandboxExecutor,
        'page': PageExecutor,
        'glb': GlbExecutor,
    };

    create(prop: string): CoreExecutor {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop];
        return new ComponentClass();
    }

    async runBundle(module: MiniModule, started: boolean): Promise<void> {
        pluto.third.assets[module.name] = {};
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

    async importFile(bundle: MiniModule, files: File[], callback: Function) {
        let importedCount = 0;
        let failedCount = 0;

        // 遍历所有选中的文件
        for (const file of files) {
            try {
                // 确定文件类型
                let type: string;
                const lastDotIndex = file.name.lastIndexOf('.');
                if (lastDotIndex > 0) {
                    type = file.name.substring(lastDotIndex + 1).toLowerCase();
                } else {
                    // 如果没有扩展名，使用默认类型
                    type = 'text';
                }

                // 根据文件类型选择读取方式
                const executor = this.create(type);
                let content = await executor.read(file);

                // 检查文件名是否已存在
                if (bundle.files.some(f => f.name === file.name)) {
                    failedCount++;
                    continue; // 跳过已存在的文件
                }

                // 创建新文件并添加到bundle
                const newFile: ModFile = {
                    name: file.name,
                    type: type,
                    content: content
                };
                bundle.files.push(newFile);
                importedCount++;
            } catch (error) {
                failedCount++;
                console.error('File import failed:', error);
            }
        }
        callback(importedCount, failedCount);
    }

    exportModule(folder: string, module: MiniModule) {
        for (const file of module.files) {
            const filePath = `${folder}/${file.name}`;
            const executor = this.create(file.type);
            try {
                executor.write(filePath, file.content, file.type);
            } catch (e) {
                console.error(`Failed to export file ${file.name}:`, e);
                new Notice(t('pluto.hub.export.file-failure').replace('{filename}', file.name));
            }
        }
        new Notice(t('pluto.hub.export.all-files-success').replace('{modname}', module.name));
    }
}
