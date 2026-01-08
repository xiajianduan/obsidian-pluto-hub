import { Notice } from "obsidian";

// 创建一个简单的ThirdComponent实现，用于其他插件
export class SimpleComponent implements ThirdComponent {

    op: any;
    api: any;
    codes: Map<string, any> = new Map();
    configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    get pluginId(): string {
        return pluto.self.manifest.id;
    }

    patch(): void {

    }

    check(): void {
        if (!this.op) throw new Error('Please install plugin ' + this.pluginId);
    }
    
    bind(op: any, prop: PlutoProps): ThirdComponent {
        this.op = op;
        this.api = op.api;
        this.patch();
        pluto.third[prop] = this;
        console.log(`[Pluto Hub] ${prop} successfully bound to pluto.third.${prop}`);
        return this;
    }

    register(key: string, code: any) {
        this.codes.set(key, code);
    }

    async load(params: ModParams): Promise<void> { }

    async execute(block: any): Promise<void> {
        this.check();
    }

    async executeAll(): Promise<void> {
        for (const block of this.codes.values()) {
            await this.execute(block);
        }
    }
}