
// 创建一个简单的CoreExecutor实现，用于其他插件
export class SimpleCoreExecutor implements CoreExecutor {

    codes: Map<string, any> = new Map();
    configPath: string;

    constructor(configPath: string) {
        this.configPath = configPath;
    }

    excutable(type: string): boolean {
        return false;
    }

    execute(block: any, started: boolean): void { }

    executeAll(): void {
        for (const block of this.codes.values()) {
            this.execute(block, false);
        }
    }
}