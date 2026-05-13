import { Notice } from "obsidian";

// 创建一个简单的ThirdComponent实现，用于其他插件
export class SimpleComponent implements ThirdComponent {
    
    self: any;
    configPath: string;
    codes: Map<string, any[]> = new Map();

    constructor(configPath: string) {
        this.configPath = configPath;
    }
    get prop(): PlutoProps {
        throw new Error("Method not implemented.");
    }

    get pluginId(): string {
        return pluto.self.manifest.id;
    }

    patch(): void {

    }

    check(): void {
        if (!pluto.third.react) throw new Error('Please install plugin ' + this.pluginId);
    }
    
    bind(op: any, prop: PlutoProps): ThirdComponent {
        this.self = op;
        pluto.third[prop] = this;
        this.patch();
        console.log(`[Pluto Hub] ${prop} successfully bound to pluto.third.${prop}`);
        return this;
    }

    register(name: string, block: any) {
        const current = this.codes.get(name);
        if(current) {
            current.push(block);
        } else {
            this.codes.set(name, [block]);
        }
    }

    async load(params: ModParams): Promise<void> { }

    async execute(block: any): Promise<void> {
        this.check();
    }

    async executeAll(): Promise<void> {
        for (const blocks of this.codes.values()) {
            for (const block of blocks) {
                await this.execute(block);
            }
        }
    }
}