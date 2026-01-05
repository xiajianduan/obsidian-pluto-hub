import { ModFile, ModParams } from "types/pluto";
import { SimpleThirdComponent } from "./SimpleThirdComponent";

export class ReactComponent extends SimpleThirdComponent {

    load(params: ModParams): void {
        const { module, file, yaml, started } = params;
        const modelName = module.name;
        const suppressComponentRefresh = yaml['suppress-component-refresh'] || true;
        const prefix = `const name = "${modelName}";\n`;
        const matches = /^\s*?```jsx:component:(.*)\n((.|\n)*?)\n^\s*?```$/gm.exec(file.content)
        if (matches && matches.length === 4) {
            const namespace = yaml['react-components-namespace'] || 'Global';
            const name = matches[1] || modelName;
            const block = {
                code: prefix + matches[2],
                name: name,
                namespace: namespace,
                suppressRefresh: suppressComponentRefresh
            };
            this.register(name, block);
            // 运行代码
            if (started) this.execute(block);
        }
    }

    execute(block: any): void {
        this.op.registerComponent(block.code, block.name, block.namespace, block.suppressRefresh);
    }
}