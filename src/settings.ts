import {App, PluginSettingTab, Setting} from "obsidian";
import PlutoHubPlugin from "./main";

// 定义模块的元数据接口
export interface MiniModule {
    id: string;
    name: string;
    enabled: boolean;
    bgColor?: string; // 用于存储随机渐变色或图片 URL
}
export interface ModFile {
    name: string;
    type: string;
    content: string;
}

export interface ModuleBundle {
    id: string;
    files: ModFile[];
}

// 定义插件设置接口
export interface PlutoSettings {
    moduleStoragePath: string;
	backupFolderName: string
    usePako: boolean;
    columns: number;
    modules: MiniModule[];
}
// 默认设置：动态获取 configDir
export const DEFAULT_SETTINGS: PlutoSettings  = {
    moduleStoragePath: `.obsidian/modules`,
	backupFolderName: 'pluto-backups',
    usePako: true,
    columns: 3,
    modules: []
};

export class PlutoSettingTab extends PluginSettingTab {
    plugin: PlutoHubPlugin;

    constructor(app: App, plugin: PlutoHubPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
		new Setting(containerEl)
            .setName("模块存储与显示")
            .setHeading();

        new Setting(containerEl)
            .setName('存储路径')
            .setDesc('模块文件存储在中的位置(建议保留在.obsidian目录下以隐藏)')
            .addText(text => text
                .setPlaceholder('.obsidian/modules')
                .setValue(this.plugin.settings.moduleStoragePath)
                .onChange(async (value) => {
                    this.plugin.settings.moduleStoragePath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('启用 Pako 压缩')
            .setDesc('开启后，代码将以二进制压缩格式存储，节省空间并防止直接误删')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.usePako)
                .onChange(async (value) => {
                    this.plugin.settings.usePako = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('商店列数')
            .setDesc('Dashboard 界面每行显示的模块个数')
            .addSlider(slider => slider
                .setLimits(1, 6, 1)
                .setValue(this.plugin.settings.columns)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.columns = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName('备份路径 (TODO)')
            .setDesc('手动备份或自动导出模块的文件夹路径')
            .addText(text => text
                .setPlaceholder('backups/pluto')
                .setValue(this.plugin.settings.backupFolderName)
                .onChange(async (value) => {
                    this.plugin.settings.backupFolderName = value;
                    await this.plugin.saveSettings();
                }));
    }
}