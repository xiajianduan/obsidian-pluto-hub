import { Notice } from "obsidian";

// 创建一个简单的ThirdComponent实现，用于其他插件
export class SimpleThirdComponent implements ThirdComponent {

    op: any;
    api: any;
    codes: Map<string, any> = new Map();
    configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    get pluginId(): string {
        return 'obsidian-pluto-hub';
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

    load(params: ModParams): void { }

    execute(block: any): void {
        this.check();
    }

    executeAll(): void {
        for (const block of this.codes.values()) {
            this.execute(block);
        }
    }
}