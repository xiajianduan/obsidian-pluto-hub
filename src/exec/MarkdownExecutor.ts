import { MiniModule } from "types/pluto";
import { SimpleCoreExecutor } from "./SimpleCoreExecutor";
import { getFrontMatterInfo, parseYaml } from "obsidian";

export class MarkdownExecutor extends SimpleCoreExecutor {

    excutable(type: string): boolean {
        return type === 'md';
    }

    execute(module: MiniModule, started: boolean): void {
        module.files.filter(f => this.excutable(f.type)).forEach(file => {
            try {
                const info = getFrontMatterInfo(file.content);
                const frontmatter = info.frontmatter;
                if (!frontmatter) return;
                const yaml = parseYaml(frontmatter);
                const plutoLanguage = yaml['pluto-language'];
                if (plutoLanguage) {
                    const prop = plutoLanguage as PlutoProps;
                    window.pluto.third[prop].load({ module, file, yaml, started });
                }
            } catch (e) {
                console.error(`Error parsing YAML file ${file.name}:`, e);
            }
        });
    }
}
