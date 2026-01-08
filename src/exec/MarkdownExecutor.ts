import { SimpleExecutor } from "./SimpleExecutor";
import { getFrontMatterInfo, parseYaml } from "obsidian";

export class MarkdownExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'md';
    }

    async execute(module: MiniModule, started: boolean): Promise<void> {
        for (const file of module.tmpFiles!) {
            const info = getFrontMatterInfo(file.content);
            const frontmatter = info.frontmatter;
            if (!frontmatter) return;
            const yaml = parseYaml(frontmatter);
            const plutoLanguage = yaml['pluto-language'];
            if (plutoLanguage) {
                const prop = plutoLanguage as PlutoProps;
                await pluto.third[prop].load({ module, file, yaml, started });
            }
        };
    }
}
