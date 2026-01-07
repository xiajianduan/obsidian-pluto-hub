import { Plugin } from 'obsidian';

declare module 'obsidian' {
    interface App {
        plugins: Plugin;
    }
    interface Plugin {
        plugins: Record<string, any>;
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