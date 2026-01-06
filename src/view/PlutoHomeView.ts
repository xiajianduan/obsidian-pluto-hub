import { MarkdownView, WorkspaceLeaf, ViewStateResult } from "obsidian";

export const VIEW_TYPE_HOME = "pluto-home-view";

export class PlutoHomeView extends MarkdownView {

    state: Record<string, any>;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.headerEl.remove();
        this.inlineTitleEl.remove();
        this.canDropAnywhere = true;
        // this.allowNoFile = true;
    }

    getIcon(): string {
        return this.state && this.state.icon || 'house';
    }

    getViewType() {
        return VIEW_TYPE_HOME;
    }

    getDisplayText() {
        return this.state && this.state.title || 'home';
    }

    getState() {
        return this.state;
    }

    async setState(state: any, result: ViewStateResult): Promise<void> {
        super.setState(state, result);
        if (result.layout) {
            this.state = state;
        }
    }

    async loadFileInternal(e: any, t: any) {
        super.loadFileInternal(e, t);
        this.previewMode.renderer.previewEl.addClass(VIEW_TYPE_HOME);
    }
} 