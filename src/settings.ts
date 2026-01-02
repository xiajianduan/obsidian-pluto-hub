import {App, PluginSettingTab, Setting} from "obsidian";
import PlutoHubPlugin from "./main";
import { t } from './utils/translation';

// 定义模块的元数据接口
export interface MiniModule {
    id: string;
    name: string;
    enabled: boolean;
    bgColor?: string; // 用于存储随机渐变色
    bgUrl?: string; // 用于存储图片 URL
    files: ModFile[]; // 直接在MiniModule中包含文件数组
}
export interface ModFile {
    name: string;
    type: string;
    content: string;
}

// 定义插件设置接口
export interface PlutoSettings {
    moduleStoragePath: string;
	backupFolderName: string
    usePako: boolean;
    columns: number;
    modules: string[];
}
// 默认设置：动态获取 configDir
export const DEFAULT_SETTINGS: PlutoSettings  = {
    moduleStoragePath: `.obsidian/cache/modules`,
	backupFolderName: 'backups',
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
            .setName(t('pluto.hub.settings.module-storage'))
            .setHeading();

        new Setting(containerEl)
            .setName(t('pluto.hub.settings.storage-path'))
            .setDesc(t('pluto.hub.settings.storage-path-desc'))
            .addText(text => text
                .setPlaceholder('.obsidian/cache/modules')
                .setValue(this.plugin.settings.moduleStoragePath)
                .onChange(async (value) => {
                    this.plugin.settings.moduleStoragePath = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('pluto.hub.settings.enable-pako'))
            .setDesc(t('pluto.hub.settings.enable-pako-desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.usePako)
                .onChange(async (value) => {
                    this.plugin.settings.usePako = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t('pluto.hub.settings.columns'))
            .setDesc(t('pluto.hub.settings.columns-desc'))
            .addSlider(slider => slider
                .setLimits(1, 6, 1)
                .setValue(this.plugin.settings.columns)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.columns = value;
                    await this.plugin.saveSettings();
                }));
		
        new Setting(containerEl)
            .setName(t('pluto.hub.settings.backup-path'))
            .setDesc(t('pluto.hub.settings.backup-path-desc'))
            .addText(text => text
                .setPlaceholder('backups')
                .setValue(this.plugin.settings.backupFolderName)
                .onChange(async (value) => {
                    this.plugin.settings.backupFolderName = value;
                    await this.plugin.saveSettings();
                }));
    }
}