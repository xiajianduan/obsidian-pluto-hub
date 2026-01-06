import PlutoHubPlugin from "main";
import { BoardRenderer } from "./BoardRenderer";
import { EditorRenderer } from "./EditorRenderer";
import { ModuleAction } from "./ModuleAction";

export class ViewResolver {

    plugin: PlutoHubPlugin;
    moduleAction: ModuleAction;
    boardRenderer: BoardRenderer;
    editorRenderer: EditorRenderer;
    contentEl: HTMLElement;
    isEditing: boolean = false;
    currentModId: string | null = null;
    currentFileIndex: number = 0;
    
    constructor(plugin: PlutoHubPlugin, contentEl: HTMLElement) {
        this.plugin = plugin;
        this.contentEl = contentEl;
        this.moduleAction = new ModuleAction(plugin);
        this.editorRenderer = new EditorRenderer(this);
        this.boardRenderer = new BoardRenderer(this);
    }

    render() {
        const container = this.contentEl;
        container.empty();
        container.addClass('pluto-main-container');
        // 使用 CSS 变量控制商店列数
        container.style.setProperty('--pluto-cols', String(this.plugin.settings.columns));
        if (this.isEditing) {
            this.editorRenderer.render(this.contentEl);
        } else {
            this.boardRenderer.render(this.contentEl);
        }
    }
}