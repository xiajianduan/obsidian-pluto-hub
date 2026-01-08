import { SimpleComponent } from "./SimpleComponent";

export class ReactComponent extends SimpleComponent {

    get pluginId(): string {
        return 'obsidian-react-components';
    }

    async load(params: ModParams): Promise<void> {
        const { module, file, yaml, started } = params;
        const modelName = module.name;
        const suppressComponentRefresh = yaml['suppress-component-refresh'] || true;
        const prefix = `const name = "${modelName}";\n`;
        const matches = this.getMatches(/^\s*?```jsx:component:(.*)\n((.|\n)*?)\n^\s*?```$/gm, file.content);
        for (const match of matches) {
            if (match && match.length === 4) {
                const namespace = yaml['react-components-namespace'] || 'Global';
                const name = match[1] || modelName;
                const block = {
                    code: prefix + match[2],
                    name: name,
                    namespace: namespace,
                    suppressRefresh: suppressComponentRefresh
                };
                this.register(name, block);
                // 运行代码
                if (started) await this.execute(block);
            }
        }
    }
    
    getMatches(regex: RegExp, str: string): RegExpExecArray[] {
        let result: RegExpExecArray | null;
        const list: RegExpExecArray[] = [];
        while ((result = regex.exec(str)) !== null) {
            if (result.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            list.push(result);
        }
        return list;
    }

    async execute(block: any): Promise<void> {
        this.check();
        this.op.registerComponent(block.code, block.name, block.namespace, block.suppressRefresh);
    }
}