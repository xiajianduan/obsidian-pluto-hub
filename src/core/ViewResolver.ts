import PlutoHubPlugin from "main";
import { BoardRenderer } from "./BoardRenderer";
import { EditorRenderer } from "./EditorRenderer";
import { ModuleAction } from "./ModuleAction";

export class ViewResolver {

    plugin: PlutoHubPlugin;
    moduleAction: ModuleAction;
    boardRenderer: BoardRenderer;
    editorRenderer: EditorRenderer;
    containerEl: HTMLElement;
    
    constructor(plugin: PlutoHubPlugin, containerEl: HTMLElement) {
        this.plugin = plugin;
        this.containerEl = containerEl;
        this.moduleAction = new ModuleAction(plugin);
        this.editorRenderer = new EditorRenderer(this);
        this.boardRenderer = new BoardRenderer(this);
    }
    private render() {
        const container = this.containerEl;
        container.empty();
        container.addClass('pluto-main-container');
    }

    edit(id: string) {
        this.editorRenderer.currentModId = id;
        this.editorRenderer.currentFileIndex = 0;
        this.render();
        this.editorRenderer.render();
    }
    borad() {
        this.render();
        this.boardRenderer.render();
    }
}