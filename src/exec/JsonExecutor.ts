import { MiniModule } from "types/pluto";
import { SimpleCoreExecutor } from "./SimpleCoreExecutor";

export class JsonExecutor extends SimpleCoreExecutor {

    excutable(type: string): boolean {
        return type === 'json';
    }
        
    execute(module: MiniModule, started: boolean): void {
        module.files.filter(f => this.excutable(f.type)).forEach(file => {
            try {
                const config = JSON.parse(file.content);
                // 将配置挂载到 pluto.assets[模块名]
                window.pluto.third.assets[module.name].json.set(file.name, config);
            } catch (e) {
                console.error(`Error parsing JSON file ${file.name}:`, e);
            }
        });
    }
}
