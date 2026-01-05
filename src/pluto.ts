import { CoreManager } from "exec/CoreManager";
import { App, normalizePath, TFile } from "obsidian";
import { ThirdFactory } from "third/ThirdFactory";
import { PlutoSettings } from "types/pluto";
import * as obsidian from "obsidian";
import { ImageConverter } from "core/ImageConverter";
import PlutoHubPlugin from "main";

export class Pluto implements IPluto {
    config: any;
    web: any;
    images: any;
    core: any;
    third: Third;
    self: PlutoHubPlugin;
    helper: any;

    constructor(plugin: PlutoHubPlugin, settings: PlutoSettings) {
        const app = plugin.app;
        this.config = {};
        this.self = plugin;
        this.images = new ImageConverter(app);
        this.helper = {
            find_tfile: this.find_tfile.bind(this, app),
            obsidian,
        };
        this.core = CoreManager.createCoreExecutor(settings.configPath);
        this.third = ThirdFactory.createThirdComponent(settings.configPath);
    }

    find_tfile(app: App, name: string): TFile | null {
        const normalizedName = normalizePath(name);
        return app.metadataCache.getFirstLinkpathDest(normalizedName, "");
    }

    getModule(name: string) {
        return (window as any).pluto.third.modules[name];
    }
    registerModule(name: string, exports: any): void {
        (window as any).pluto.third.modules[name] = exports;
    }
}