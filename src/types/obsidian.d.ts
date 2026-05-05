import { PluginManifest } from "obsidian";

declare module 'obsidian' {
    interface App {
        plugins: Plugins;
    }
    interface Plugins {
        plugins: Record<string, PlutoPlugin>;
        manifests: Record<string, PluginManifest>;
    }
    export interface PlutoPlugin {
        settings: PlutoSettings;
        manifest: PluginManifest;
        app: App;
    }
    interface ViewStateResult {
        layout: any;
    }

    interface MarkdownView {
        inlineTitleEl: any;
        loadFileInternal(e: any, t: any): Promise<void>;
    }
    interface ItemView {
        headerEl: any;
        canDropAnywhere: boolean;
    }
    interface MarkdownPreviewView {
        renderer: any;
    }
}