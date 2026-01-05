import { MiniModule } from "types/pluto";
import { SimpleCoreExecutor } from "./SimpleCoreExecutor";

export class CssExecutor extends SimpleCoreExecutor {

    excutable(type: string): boolean {
        return type === 'css';
    }
        
    execute(module: MiniModule, started: boolean): void {
        module.files.filter(f => this.excutable(f.type)).forEach(file => {  
            this.injectStyle(`${module.id}-${file.name}`, file.content);
        });
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
