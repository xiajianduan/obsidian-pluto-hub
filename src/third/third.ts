import { ModFile } from "types/pluto";

// 创建一个简单的ThirdComponent实现，用于其他插件
export class SimpleThirdComponent implements ThirdComponent {

    op: any;
    api: any;
    codes: Map<string, any> = new Map();
    configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    register(key: string, code: any) {
        this.codes.set(key, code);
    }

    bind(op: any, prop: PlutoProps): ThirdComponent {
        this.op = op;
        this.api = op.api;
        window.pluto.third[prop] = this;
        console.log(`[Pluto Hub] ${prop} successfully bound to pluto.third.${prop}`);
        return this;
    }

    load(name: string, file: ModFile, yaml: any, started: boolean): void { }

    async execute(block: any): Promise<void> { }

    async executeAll(): Promise<void> {
        for (const block of this.codes.values()) {
            await this.execute(block);
        }
    }
}

export class ReactComponent extends SimpleThirdComponent {

    load(modelName: string, file: ModFile, yaml: any, started: boolean): void {
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

    async execute(block: any): Promise<void> {
        this.op.registerComponent(block.code, block.name, block.namespace, block.suppressRefresh);
    }
}
export class DvaComponent extends SimpleThirdComponent { }
export class TemplaterComponent extends SimpleThirdComponent {

    load(name: string, file: ModFile, yaml: any, started: boolean): void {
        const block = {
            code: file.content,
            name: name
        };
        this.register(`${name}-${file.name}`, block);
        // 运行代码
        if (started) this.execute(block);
    }
    async execute(block: any) {
        const current = this.op.templater.current_functions_object;
        current.mod = {
            name: block.name,
            configPath: this.configPath,
            configFile: `${this.configPath}/${block.name}.json`
        };
        await this.op.templater.parser.parse_commands(block.code, current);
    }
}
export class QaComponent extends SimpleThirdComponent { }

// ThirdComponent工厂类，用于根据prop创建相应的组件实例
export class ThirdFactory {
    // 使用映射对象替代switch case，根据prop创建相应的组件实例
    private static componentMap: Record<string, any> = {
        'react': ReactComponent,
        'dva': DvaComponent,
        'templater': TemplaterComponent,
        'qa': QaComponent
    };

    static create(prop: string, configPath: string): ThirdComponent {
        // 从映射对象中获取对应的组件类，如果不存在则使用SimpleThirdComponent
        const ComponentClass = this.componentMap[prop] || SimpleThirdComponent;
        return new ComponentClass(configPath);
    }
}