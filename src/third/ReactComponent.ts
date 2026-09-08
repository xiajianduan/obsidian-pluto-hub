import { around } from "monkey-around";
import { SimpleComponent } from "./SimpleComponent";

export class ReactComponent extends SimpleComponent {

    get pluginId(): string {
        return 'obsidian-react-components';
    }
    get prop(): PlutoProps {
        return 'react';
    }
    
    patch(): void {
        around(this.self, {
            getPropertyValue(oldMethod) {
                return (propertyName: string, file: string) => {
                    if (propertyName === 'react-components-namespace' && !file) {
                        return 'Global';
                    }
                    return oldMethod.apply(this, [propertyName, file]);
                }
            }
        });
    }

    async load(params: ModParams): Promise<void> {
        const { name, file, yaml } = params;
        const suppressComponentRefresh = yaml['suppress-component-refresh'] ?? true;
        const prefix = `const name = "${name}";\n`;
        const matches = this.getMatches(/^\s*?```jsx:component:(.*)\n((.|\n)*?)\n^\s*?```$/gm, file.content);
        for (const match of matches) {
            if (match && match.length === 4) {
                const namespace = yaml['react-components-namespace'] || 'Global';
                const blockName = match[1] || name;
                const block = {
                    code: prefix + match[2],
                    name: blockName,
                    namespace: namespace,
                    suppressRefresh: suppressComponentRefresh
                };
                this.register(name, block);
                // 运行代码
                // if (started) await this.execute(block);
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
        await this.self.registerComponent(block.code, block.name, block.namespace, block.suppressRefresh);
        await pluto.third.react.self.requestComponentUpdate();
    }
}