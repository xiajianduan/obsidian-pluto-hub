import { Plugin, PlutoPlugin } from 'obsidian';
import { ModStorage } from './storage';
import { DEFAULT_SETTINGS, PlutoSettingTab } from 'settings';
import { t } from 'utils/translation';
import { Pluto } from './pluto';
import { Arrays } from 'utils/array';

export default class PlutoHubPlugin extends Plugin implements PlutoPlugin {

    settings: PlutoSettings;

    async onload() {
        await this.loadSettings();
        // 从存储路径加载所有模块
        await this.checkAndCreatePath();
        await ModStorage.loadAllFromStorage(this);
        await this.initializePlugin();
        // 初始化 i18n 翻译函数
        this.i18n();
        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new PlutoSettingTab(this.app, this));
    }

    async checkAndCreatePath(): Promise<void> {
        const storagePath = this.settings.moduleStoragePath;
        if (!(await this.app.vault.adapter.exists(storagePath))) {
            await this.app.vault.adapter.mkdir(storagePath);
        }
        const backupPath = this.settings.backupFolderName;
        if (!(await this.app.vault.adapter.exists(backupPath))) {
            await this.app.vault.adapter.mkdir(backupPath);
        }
        const configPath = this.settings.configPath;
        if (!(await this.app.vault.adapter.exists(configPath))) {
            await this.app.vault.adapter.mkdir(configPath);
        }
    }

    i18n() {
        const t = (key: string, vars?: Record<string, unknown>): string => {
            // @ts-ignore - Obsidian's i18n isn't in the official types
            return this.app.i18n.t(key, vars);
        };
    }

    async initializePlugin() {
        // 添加自定义 Ribbon 图标
        this.addCustomRibbonIcon();
        // 加载数组扩展函数
        Arrays.loadFunctions();
        // 初始化并挂载全局 Pluto 对象
        new Pluto(this).boot();
    }

    addCustomRibbonIcon() {
        this.addRibbonIcon('layout-grid', t("pluto.hub"), () => {
            Pluto.activateView(this.app);
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}