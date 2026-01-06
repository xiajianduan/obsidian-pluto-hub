import { ModFile, ModParams } from "types/pluto";
import { SimpleThirdComponent } from "./SimpleThirdComponent";

export class TemplaterComponent extends SimpleThirdComponent {
    
    get pluginId(): string {
        return 'templater-obsidian';
    }
    
    patch(): void {
        this.op.templater.functions_generator.internal_functions.generate_params = function(params: any) {
            let t: any = {};
            for (let r of this.modules_array) {
                t[r.getName()] = r.static_object;
            }
            return {...t, params};
        };
    }
    load(params: ModParams): void {
        const { module, file, started } = params;
        const name = module.name;
        const block = {
            code: file.content,
            name: name
        };
        this.register(`${name}-${file.name}`, block);
        // 运行代码
        if (started) this.execute(block);
    }
    execute(block: any): void {
        const mod = {
            name: block.name,
            configPath: this.configPath,
            configFile: `${this.configPath}/${block.name}.json`
        };
        const current = this.op.templater.functions_generator.internal_functions.generate_params(mod);
        this.op.templater.parser.parse_commands(block.code, current);
    }
}