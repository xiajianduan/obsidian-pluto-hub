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
        headerEl: any;
        inlineTitleEl: any;
        canDropAnywhere: boolean;
        loadFileInternal(e: any, t: any): Promise<void>;
    }
    interface MarkdownPreviewView {
        renderer: any;
    }
}