import PlutoHubPlugin from "main";
import { generateKeyBetween } from "fractional-indexing";
import { Notice } from "obsidian";
import { ModStorage } from "storage";
import { downloadImageToBase64 } from "utils/helper";
import { t } from "utils/translation";

export class ModuleAction {

    plugin: PlutoHubPlugin;

    constructor(plugin: PlutoHubPlugin) {
        this.plugin = plugin;
    }

    /**
     * 加载所有模块的辅助方法，避免重复调用ModStorage.loadAllModulesFromStorage
     */
    async loadAll(): Promise<MiniModule[]> {
        return await ModStorage.loadAllFromStorage();
    }

    async create(name: string) {
        // 检查模块名是否已存在
        const allModules = await this.loadAll();
        if (allModules.some(mod => mod.name.toLowerCase() === name.trim().toLowerCase())) {
            new Notice(t('pluto.hub.validation.duplicate-module-name'));
            return;
        }

        const newId = Date.now().toString();
        let bgColor = ModStorage.generateRandomGradient();
        let moduleFiles: { name: string; type: string; content: string }[] = [{ name: 'main.js', type: 'js', content: 'new Notice(params.name);' }];

        // 检查pluto.skin.path是否存在
        if (this.plugin.settings.enableIcon && pluto.skin?.path) {
            const skinPath = pluto.skin.path;
            // 下载图片并转换为base64
            const imageBase64 = await downloadImageToBase64(skinPath, this.plugin.settings.quality);
            if (imageBase64) {
                const base64Parts = imageBase64.split(',');
                moduleFiles = [{ name: 'logo.webp', type: 'webp', content: base64Parts[1]! }];
            }
        }

        const newMod: MiniModule = {
            id: newId,
            name: name,
            type: 'G',
            position: "Z",
            order: generateKeyBetween(allModules.at(-1)?.order ?? null, null),
            enabled: true,
            bgColor: bgColor,
            files: moduleFiles,
        };

        // 保存到磁盘
        await ModStorage.saveModule(newMod);
    }

    async delete(id: string) {
        // 1. 从存储中加载所有模块，查找要删除的模块
        const allModules = await this.loadAll();
        const mod = allModules.find(m => m.id === id);

        if (mod) {
            // 2. 从磁盘移除文件
            const path = ModStorage.getModulePath(mod.name);
            if (await this.plugin.app.vault.adapter.exists(path)) {
                await this.plugin.app.vault.adapter.remove(path);
            }
            ModStorage.removeFromCache(mod.id);
        }
    }

    /**
     * 保存当前模块的所有文件内容到存储中
     * @param bundle 要保存的模块包
     */
    async save(module: MiniModule) {
        // 更新模块的enabled状态
        const allModules = await this.loadAll();
        const currentModule = allModules.find(mod => mod.id === module.id);
        if (currentModule) {
            module.enabled = currentModule.enabled;
            module.bgColor = currentModule.bgColor;
        }

        // 保存到磁盘
        await ModStorage.saveModule(module);

        // 重新加载模块
        // this.plugin.runAllEnabled();
    }

    async export(moduleKey: string) {
        // 从存储中加载所有模块，查找当前模块
        const allModules = await this.loadAll();
        const mod = allModules.find(m => m.name === moduleKey);
        if (!mod) return;
        try {
            await ModStorage.exportModule(moduleKey, `${mod.name}.ops`);
            new Notice(t('pluto.hub.export.module-success'));
        } catch (e) {
            console.error("Failed to export module:", e);
            new Notice(t('pluto.hub.export.module-failure'));
        }
    }
}