import { SimpleExecutor } from "./SimpleExecutor";

export class CssExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'css';
    }
        
    async execute(module: MiniModule, started: boolean): Promise<void> {
        for (const file of module.tmpFiles!) {  
            this.injectStyle(`${module.id}-${file.name}`, file.content);
        };
    }

    // 注入 CSS 样式到文档头部
    injectStyle(id: string, code: string) {
        let el = document.getElementById(`pluto-css-${id}`);
        if (!el) {
            el = document.createElement('style');
            el.id = `pluto-css-${id}`;
            document.head.appendChild(el);
        }
        el.textContent = code;
    }
}
