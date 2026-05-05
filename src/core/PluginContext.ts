import PlutoHubPlugin from "main";
import { ModStorage } from "storage";

export class PluginContext {

    private static instance: PlutoHubPlugin | null = null;

    static async init(plugin: PlutoHubPlugin) {
        this.instance = plugin;
        await ModStorage.loadAllFromStorage();
    }

    static get plugin() {
        if (!this.instance) throw new Error('Plugin not initialized');
        return this.instance;
    }

    static get settings(): PlutoSettings {
        return this.plugin.settings;
    }
}