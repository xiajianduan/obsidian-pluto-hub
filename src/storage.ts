import PlutoHubPlugin from 'main';
import * as pako from 'pako';
import { ModuleBundle, MiniModule } from 'settings';

export class ModStorage {
    // 获取模块存储目录路径
    static getModulesDir(plugin: PlutoHubPlugin): string {
        const configDir = plugin.app.vault.configDir;
        return plugin.settings.moduleStoragePath || `${configDir}/cache/modules`;
    }

    // 获取单个模块的存储路径（使用模块名称作为文件名）
    static getModulePath(plugin: PlutoHubPlugin, moduleName: string): string {
        const dir = this.getModulesDir(plugin);
        // 清理文件名，移除可能导致问题的字符，但允许中文字符
        const safeName = moduleName.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5-]/g, '_');
        return `${dir}/${safeName}.ops`;
    }

    // 保存单个模块
    static async saveBundle(plugin: PlutoHubPlugin, bundle: ModuleBundle): Promise<void> {
        // 查找模块名称
        const mod = plugin.settings.modules.find((m: MiniModule) => m.id === bundle.id);
        if (!mod) {
            throw new Error(`Module with id ${bundle.id} not found`);
        }

        const path = this.getModulePath(plugin, mod.name);
        const adapter = plugin.app.vault.adapter;
        const dir = path.substring(0, path.lastIndexOf('/'));

        if (!(await adapter.exists(dir))) await adapter.mkdir(dir);

        const jsonStr = JSON.stringify(bundle);
        const binary = plugin.settings.usePako 
            ? pako.deflate(jsonStr) 
            : new TextEncoder().encode(jsonStr);
        await adapter.writeBinary(path, binary.buffer);
    }

    // 加载单个模块
    static async loadBundle(plugin: PlutoHubPlugin, moduleId: string): Promise<ModuleBundle> {
        // 查找模块名称
        const mod = plugin.settings.modules.find((m: MiniModule) => m.id === moduleId);
        if (!mod) {
            throw new Error(`Module with id ${moduleId} not found`);
        }

        const path = this.getModulePath(plugin, mod.name);
        if (!(await plugin.app.vault.adapter.exists(path))) {
            return { id: moduleId, files: [{ name: 'main.js', type: 'js', content: '' }] };
        }

        const buffer = await plugin.app.vault.adapter.readBinary(path);
        const uint8 = new Uint8Array(buffer);
        const jsonStr = plugin.settings.usePako 
            ? pako.inflate(uint8, { to: 'string' }) 
            : new TextDecoder().decode(uint8);
        return JSON.parse(jsonStr);
    }

    // 全量备份：将所有模块（包括MiniModule和ModuleBundle）压缩为一个pako文件
    static async backupAllModules(plugin: PlutoHubPlugin, targetPath: string): Promise<void> {
        const backupData = {
            modules: plugin.settings.modules, // 包含所有MiniModule元数据
            bundles: {} as { [key: string]: ModuleBundle } // 包含所有ModuleBundle代码
        };
        
        // 加载所有模块的代码
        for (const mod of plugin.settings.modules) {
            try {
                const bundle = await this.loadBundle(plugin, mod.id);
                backupData.bundles[mod.id] = bundle;
            } catch (e) {
                console.error(`Failed to load module ${mod.name} for backup:`, e);
            }
        }

        // 压缩并导出
        const jsonStr = JSON.stringify(backupData);
        const binary = pako.deflate(jsonStr);
        await plugin.app.vault.adapter.writeBinary(targetPath, binary.buffer);
    }

    // 单模块导出
    static async exportModule(plugin: PlutoHubPlugin, moduleId: string, targetPath: string): Promise<void> {
        const bundle = await this.loadBundle(plugin, moduleId);
        const jsonStr = JSON.stringify(bundle);
        const binary = pako.deflate(jsonStr);
        await plugin.app.vault.adapter.writeBinary(targetPath, binary.buffer);
    }

    // 导入功能：支持单个模块或全量导入
    static async importModule(plugin: PlutoHubPlugin, sourcePath: string): Promise<void> {
        if (!(await plugin.app.vault.adapter.exists(sourcePath))) {
            throw new Error(`File not found: ${sourcePath}`);
        }

        const buffer = await plugin.app.vault.adapter.readBinary(sourcePath);
        const uint8 = new Uint8Array(buffer);
        const jsonStr = pako.inflate(uint8, { to: 'string' });
        const data = JSON.parse(jsonStr);

        // 检查是单个模块还是全量备份
        if (data.id && data.files) {
            // 单个模块导入
            const bundle = data as ModuleBundle;
            
            // 使用window.pluto.qa.inputPrompt获取模块名称
            const moduleName = await window.pluto.qa.inputPrompt("请输入模块名称:", bundle.id);
            
            // 创建或更新MiniModule
            const existingModuleIndex = plugin.settings.modules.findIndex(mod => mod.id === bundle.id);
            const newModule: MiniModule = {
                id: bundle.id,
                name: moduleName,
                enabled: true
            };
            
            if (existingModuleIndex >= 0) {
                // 替换现有模块
                plugin.settings.modules[existingModuleIndex] = newModule;
            } else {
                // 添加新模块
                plugin.settings.modules.push(newModule);
            }
            
            // 保存MiniModule到设置
            await plugin.saveSettings();
            
            // 保存ModuleBundle
            await this.saveBundle(plugin, bundle);
        } else if (data.modules && data.bundles) {
            // 全量备份导入
            const importedModules = data.modules as MiniModule[];
            const importedBundles = data.bundles as { [key: string]: ModuleBundle };
            
            // 创建一个映射来快速查找现有模块
            const existingModulesMap = new Map<string, number>();
            plugin.settings.modules.forEach((mod, index) => {
                existingModulesMap.set(mod.id, index);
            });
            
            // 处理导入的模块
            for (const importedModule of importedModules) {
                if (existingModulesMap.has(importedModule.id)) {
                    // 替换现有模块
                    const index = existingModulesMap.get(importedModule.id)!;
                    plugin.settings.modules[index] = importedModule;
                } else {
                    // 添加新模块
                    plugin.settings.modules.push(importedModule);
                }
            }
            
            // 保存MiniModule到设置
            await plugin.saveSettings();
            
            // 保存所有ModuleBundle
            for (const moduleId in importedBundles) {
                if (importedBundles.hasOwnProperty(moduleId)) {
                    const bundle = importedBundles[moduleId];
                    if (bundle) {
                        await this.saveBundle(plugin, bundle);
                    }
                }
            }
        } else {
            // 旧格式的全量备份
            console.warn("Importing from old backup format");
            for (const moduleId in data) {
                if (data.hasOwnProperty(moduleId)) {
                    await this.saveBundle(plugin, data[moduleId] as ModuleBundle);
                }
            }
        }
    }
}