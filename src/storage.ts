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

    // 生成随机渐变色背景
    static generateRandomGradient(): string {
        const colors = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140'],
            ['#30cfd0', '#330867'],
            ['#a8edea', '#fed6e3'],
            ['#ff9a9e', '#fad0c4']
        ];
        
        // 确保 randomPair 不为 undefined (类型安全)
        const randomPair = colors[Math.floor(Math.random() * colors.length)] ?? ['#667eea', '#764ba2'];
        return `linear-gradient(135deg, ${randomPair[0]} 0%, ${randomPair[1]} 100%)`;
    }

    // 保存单个模块
    static async saveBundle(plugin: PlutoHubPlugin, bundle: ModuleBundle, moduleName: string, enabled: boolean = true, bgColor?: string): Promise<void> {
        const path = this.getModulePath(plugin, moduleName);
        const adapter = plugin.app.vault.adapter;
        const dir = path.substring(0, path.lastIndexOf('/'));

        if (!(await adapter.exists(dir))) await adapter.mkdir(dir);

        // 将MiniModule信息与ModuleBundle一起保存
        const moduleData = {
            module: {
                id: bundle.id,
                name: moduleName,
                enabled: enabled,
                bgColor: bgColor
            },
            bundle: bundle
        };

        const jsonStr = JSON.stringify(moduleData);
        const binary = plugin.settings.usePako 
            ? pako.deflate(jsonStr) 
            : new TextEncoder().encode(jsonStr);
        await adapter.writeBinary(path, binary.buffer);
        
        // 更新settings中的modules字段（只存储模块名称字符串数组）
        if (enabled) {
            // 如果模块被启用，确保它的名称在modules数组中
            if (!plugin.settings.modules.includes(moduleName)) {
                plugin.settings.modules.push(moduleName);
            }
        } else {
            // 如果模块被禁用，确保它的名称从modules数组中移除
            plugin.settings.modules = plugin.settings.modules.filter(mod => mod !== moduleName);
        }
        
        await plugin.saveSettings();
    }

    // 加载单个模块
    static async loadBundle(plugin: PlutoHubPlugin, moduleId: string): Promise<ModuleBundle> {
        const modulesDir = this.getModulesDir(plugin);
        const adapter = plugin.app.vault.adapter;
        
        // 检查存储目录是否存在
        if (!(await adapter.exists(modulesDir))) {
            return { id: moduleId, files: [{ name: 'main.js', type: 'js', content: '' }] };
        }
        
        // 获取目录下的所有文件
        const files = await adapter.list(modulesDir);
        const moduleFiles = files.files.filter(file => file.endsWith('.ops'));
        
        // 查找对应ID的模块文件
        for (const fileName of moduleFiles) {
            // 检查fileName是否已经是完整路径
            const filePath = fileName.startsWith('/') || fileName.startsWith('.obsidian') 
                ? fileName 
                : `${modulesDir}/${fileName}`;
            try {
                const buffer = await adapter.readBinary(filePath);
                const uint8 = new Uint8Array(buffer);
                const jsonStr = plugin.settings.usePako 
                    ? pako.inflate(uint8, { to: 'string' }) 
                    : new TextDecoder().decode(uint8);
                
                const data = JSON.parse(jsonStr);
                
                // 检查模块ID是否匹配
                if ((data.module && data.module.id === moduleId) || data.id === moduleId) {
                    // 如果数据包含module和bundle字段（新格式）
                    if (data.module && data.bundle) {
                        return data.bundle;
                    }
                    
                    // 兼容旧格式
                    return data;
                }
            } catch (e) {
                console.error(`Failed to check module file ${filePath}:`, e);
                // 继续检查下一个文件
                continue;
            }
        }
        
        // 如果没有找到对应ID的模块
        console.error(`Module with id ${moduleId} not found in storage directory`);
        return { id: moduleId, files: [{ name: 'main.js', type: 'js', content: '' }] };
    }

    // 全量备份：将所有模块（包括MiniModule和ModuleBundle）压缩为一个pako文件
    static async backupAllModules(plugin: PlutoHubPlugin, targetPath: string): Promise<void> {
        // 从存储中加载所有模块
        const modules = await this.loadAllModulesFromStorage(plugin);
        
        const backupData = {
            modules: modules, // 包含所有MiniModule元数据
            bundles: {} as { [key: string]: ModuleBundle } // 包含所有ModuleBundle代码
        };
        
        // 加载所有模块的代码
        for (const mod of modules) {
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

    // 从存储路径读取所有模块
    static async loadAllModulesFromStorage(plugin: PlutoHubPlugin): Promise<MiniModule[]> {
        const modulesDir = this.getModulesDir(plugin);
        const adapter = plugin.app.vault.adapter;
        
        // 检查存储目录是否存在
        if (!(await adapter.exists(modulesDir))) {
            await adapter.mkdir(modulesDir);
            // 更新settings中的modules字段
            plugin.settings.modules = [];
            await plugin.saveSettings();
            return [];
        }
        
        // 获取目录下的所有文件
        const files = await adapter.list(modulesDir);
        const moduleFiles = files.files.filter(file => file.endsWith('.ops'));
        
        // 加载每个模块文件
        const loadedModules: MiniModule[] = [];
        
        for (const fileName of moduleFiles) {
            // 检查fileName是否已经是完整路径
            const filePath = fileName.startsWith('/') || fileName.startsWith('.obsidian') 
                ? fileName 
                : `${modulesDir}/${fileName}`;
            try {
                const buffer = await adapter.readBinary(filePath);
                const uint8 = new Uint8Array(buffer);
                const jsonStr = plugin.settings.usePako 
                    ? pako.inflate(uint8, { to: 'string' }) 
                    : new TextDecoder().decode(uint8);
                
                const data = JSON.parse(jsonStr);
                
                if (data.module && data.module.id) {
                    // 新格式：包含module和bundle
                    // 根据settings.modules中的名称列表更新enabled状态
                    const mod = data.module;
                    mod.enabled = plugin.settings.modules.includes(mod.name);
                    loadedModules.push(mod);
                } else if (data.id) {
                    // 旧格式：只有bundle
                    // 从文件名提取模块名称（去掉.ops后缀）
                    const moduleName = fileName.replace(/\.ops$/, '');
                    loadedModules.push({
                        id: data.id,
                        name: moduleName,
                        enabled: plugin.settings.modules.includes(moduleName),
                        bgColor: this.generateRandomGradient()
                    });
                }
            } catch (e) {
                console.error(`Failed to load module from file ${filePath}:`, e);
            }
        }
        
        // 不要在加载模块时保存modules属性，modules属性只在用户更改模块启用状态时更新
        return loadedModules;
    }

    // 导入功能：支持单个模块或全量备份
    static async importModule(plugin: PlutoHubPlugin, sourcePath: string): Promise<void> {
        if (!(await plugin.app.vault.adapter.exists(sourcePath))) {
            throw new Error(`File not found: ${sourcePath}`);
        }

        const buffer = await plugin.app.vault.adapter.readBinary(sourcePath);
        const uint8 = new Uint8Array(buffer);
        const jsonStr = pako.inflate(uint8, { to: 'string' });
        let data = JSON.parse(jsonStr);

        // 检查是否是嵌套格式 {module: {...}}，如果是则提取内部模块对象
        if (data.module && (data.module.id || data.module.name) && data.module.files) {
            data = data.module;
        }

        // 检查是单个模块还是全量备份
        if ((data.id || data.name) && data.files) {
            // 单个模块导入
            const bundle = data as ModuleBundle;
            
            // 生成随机背景色（仅当原始模块没有颜色时使用）
            const bgColor = this.generateRandomGradient();
            
            // 使用文件中包含的模块名称，不再需要用户输入
            const moduleName = data.name || `模块${Date.now()}`;
            
            // 保存ModuleBundle到磁盘，保留原始模块的背景颜色（如果有）
            await this.saveBundle(plugin, bundle, moduleName, true, data.bgColor || bgColor);
        } else if (data.modules && data.bundles) {
            // 全量备份导入
            const importedModules = data.modules as MiniModule[];
            const importedBundles = data.bundles as { [key: string]: ModuleBundle };
            
            // 保存所有ModuleBundle
            for (const importedModule of importedModules) {
                const bundle = importedBundles[importedModule.id];
                if (bundle) {
                    await this.saveBundle(plugin, bundle, importedModule.name, importedModule.enabled, importedModule.bgColor);
                }
            }
        } else {
            throw new Error(`Invalid import file format. Expected id+files, name+files, modules array, or {module: {...}} format.`);
        }
    }
}