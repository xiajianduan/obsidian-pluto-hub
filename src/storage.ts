import PlutoHubPlugin from 'main';
import * as pako from 'pako';
import { MiniModule } from 'settings';
import { base64ToBlobUrl } from 'utils/helper';

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
    static async saveBundle(plugin: PlutoHubPlugin, module: MiniModule): Promise<void> {
        const path = this.getModulePath(plugin, module.name);
        const adapter = plugin.app.vault.adapter;
        const dir = path.substring(0, path.lastIndexOf('/'));

        if (!(await adapter.exists(dir))) await adapter.mkdir(dir);
        // 移除bgUrl字段，因为它不应该被序列化
        delete module.bgUrl;
        const jsonStr = JSON.stringify(module);
        const binary = plugin.settings.usePako 
            ? pako.deflate(jsonStr) 
            : new TextEncoder().encode(jsonStr);
        await adapter.writeBinary(path, binary.buffer);
        
        // 更新settings中的modules字段（只存储模块名称字符串数组）
        if (module.enabled) {
            // 如果模块被启用，确保它的名称在modules数组中
            if (!plugin.settings.modules.includes(module.name)) {
                plugin.settings.modules.push(module.name);
            }
        } else {
            // 如果模块被禁用，确保它的名称从modules数组中移除
            plugin.settings.modules = plugin.settings.modules.filter(mod => mod !== module.name);
        }
        
        await plugin.saveSettings();
    }

    // 加载单个模块
    static async loadModule(plugin: PlutoHubPlugin, fileName: string): Promise<MiniModule> {
        const modulesDir = this.getModulesDir(plugin);
        const adapter = plugin.app.vault.adapter;
        // 检查fileName是否已经是完整路径
        const filePath = fileName.startsWith('/') || fileName.startsWith('.obsidian') 
                ? fileName
                : `${modulesDir}/${fileName}.ops`;
        try {
            const buffer = await adapter.readBinary(filePath);
            const uint8 = new Uint8Array(buffer);
            const jsonStr = plugin.settings.usePako 
                ? pako.inflate(uint8, { to: 'string' }) 
                : new TextDecoder().decode(uint8);
            
            const module = JSON.parse(jsonStr);
            
            // 检查模块中是否有logo.webp文件，如果有则将其转换为blob URL并设置到bgColor属性
            const logoFile = module.files.find((file: any) => file.name === 'logo.webp' && file.type === 'webp');
            if (logoFile && logoFile.content) {
                module.bgUrl = base64ToBlobUrl(logoFile.content, 'webp');
            }
            
            return module;
        } catch (e) {
            console.error(`Failed to check module file ${filePath}:`, e);
        }
        // 如果没有找到对应ID的模块
        console.error(`Module with id ${fileName} not found in storage directory`);
        return {
            id: fileName,
            name: fileName,
            enabled: false,
            files: [{ name: 'main.js', type: 'js', content: '' }]
        };
    }

    // 全量备份：将所有模块（包括MiniModule和ModuleBundle）压缩为一个pako文件
    static async backupAllModules(plugin: PlutoHubPlugin, targetPath: string): Promise<void> {
        // 从存储中加载所有模块
        const modules = await this.loadAllModulesFromStorage(plugin);
        // 压缩并导出
        const jsonStr = JSON.stringify(modules);
        const binary = pako.deflate(jsonStr);
        await plugin.app.vault.adapter.writeBinary(targetPath, binary.buffer);
    }

    // 单模块导出
    static async exportModule(plugin: PlutoHubPlugin, moduleKey: string, targetPath: string): Promise<void> {
        const bundle = await this.loadModule(plugin, moduleKey);
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
            const module = await this.loadModule(plugin, fileName);
            module.enabled = plugin.settings.modules.includes(module.name);
            loadedModules.push(module);
        }
        
        // 不要在加载模块时保存modules属性，modules属性只在用户更改模块启用状态时更新
        return loadedModules;
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
            const module = data as MiniModule;
            
            // 优先使用 QuickAdd 的 inputPrompt 方法获取模块名称
            const moduleName = await new Promise<string | null>((resolve) => {
                if ((window as any).pluto?.qa?.inputPrompt) {
                    (window as any).pluto.qa.inputPrompt("请输入模块名称:", module.id).then(resolve);
                } else {
                    // 如果 QuickAdd 不可用，回退到原生的 prompt 方法
                    const input = prompt("请输入模块名称:", module.id);
                    resolve(input);
                }
            });
            
            // 如果用户取消了输入，直接返回
            if (!moduleName) return;
            
            // 保存ModuleBundle到磁盘
            await this.saveBundle(plugin, module);
        } else if (data.modules && data.bundles) {
            // 全量备份导入
            const importedModules = data.modules as MiniModule[];
            
            // 保存所有MiniModule
            for (const importedModule of importedModules) {
                await this.saveBundle(plugin, importedModule);
            }
        } else {
            throw new Error("Invalid import file format");
        }
    }
}