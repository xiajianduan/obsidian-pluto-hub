import { Plugin } from 'obsidian';

declare module 'obsidian' {
    interface App {
        plugins: Plugin;
    }
    interface Plugin {
        plugins: Record<string, any>;
    }
}