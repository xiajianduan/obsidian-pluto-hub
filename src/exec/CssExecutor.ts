import { parseYaml } from "obsidian";
import { SimpleExecutor } from "./SimpleExecutor";

export class CssExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'css';
    }
        
    async execute(context: BatchContext): Promise<void> {
        for (const file of context.files) {  
            this.injectStyle(`${context.id}-${file.name}`, file.content);
            this.setSettings(context.name, file.content);
        };
    }

    // 注入 CSS 样式到文档头部
    injectStyle(id: string, code: string) {
        let el = activeDocument.getElementById(`pluto-css-${id}`);
        if (!el) {
            el = activeDocument.createElement('style');
            el.id = `pluto-css-${id}`;
            activeDocument.head.appendChild(el);
        }
        el.textContent = code;
    }

    // 设置 CSS 变量
    setSettings(name: string, code: string) {
        const matches = code.match(/\/\* @settings([\s\S]+?)\*\//);
        if (!matches) return;
        const settings = parseYaml(matches[1]!);
        pluto.third.assets[name][settings.id] = settings;
    }

    async install(context: BatchContext): Promise<void> {
        await this.uninstall(context);
        await this.execute(context);
    }

    async uninstall(context: BatchContext): Promise<void> {
        activeDocument.querySelectorAll(`[id^="pluto-css-${context.id}-"]`).forEach(el => el.remove());
    }
}
