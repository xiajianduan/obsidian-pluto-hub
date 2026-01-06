import {App, PluginSettingTab, Setting} from "obsidian";
import PlutoHubPlugin from "./main";
import { t } from './utils/translation';
import { PlutoSettings } from "types/pluto";

// 默认设置：动态获取 configDir
export const DEFAULT_SETTINGS: PlutoSettings  = {
    moduleStoragePath: `.obsidian/cache/modules`,
	backupFolderName: 'backups',
    configPath: '99系统/app',
    usePako: true,
    columns: 3,
    enableIcon: true,
    quality: 90,
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
        new Setting(containerEl)
            .setName(t('pluto.hub.settings.config-path'))
            .setDesc(t('pluto.hub.settings.config-path-desc'))
            .addText(text => text
                .setPlaceholder('99系统/app')
                .setValue(this.plugin.settings.configPath)
                .onChange(async (value) => {
                    this.plugin.settings.configPath = value;
                    await this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName(t('pluto.hub.settings.enable-icon'))
            .setDesc(t('pluto.hub.settings.enable-icon-desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableIcon)
                .onChange(async (value) => {
                    this.plugin.settings.enableIcon = value;
                    await this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName(t('pluto.hub.settings.quality'))
            .setDesc(t('pluto.hub.settings.quality-desc'))
            .addSlider(slider => slider
                .setLimits(30, 100, 10)
                .setValue(this.plugin.settings.quality)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.quality = value;
                    await this.plugin.saveSettings();
                }));
    }
}