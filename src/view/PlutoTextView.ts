import { WorkspaceLeaf, ViewStateResult, ItemView, MarkdownRenderer } from "obsidian";

export const VIEW_TYPE_TEXT = "pluto-text-view";

export class PlutoTextView extends ItemView {

    state: Record<string, any>;
    content: Element;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.headerEl.remove();
    }

    getIcon(): string {
        return this.state && this.state.icon || 'house';
    }

    getViewType() {
        return VIEW_TYPE_TEXT;
    }

    getDisplayText() {
        return this.state && this.state.title || 'text';
    }

    getState() {
        return this.state;
    }

    async setState(state: any, result: ViewStateResult): Promise<void> {
        super.setState(state, result);
        if (result.layout) {
            this.state = state;
        }
        this.render();
    }

    async render() {
        const { text } = this.state;
        this.content = this.containerEl.querySelector(".view-content")!;
        const contentEl = this.content.createEl("div", { cls: "markdown-preview-view markdown-rendered node-insert-event is-readable-line-width allow-fold-headings allow-fold-lists show-indentation-guide" });
        let render = MarkdownRenderer.render(
            this.app,
            text,
            contentEl,
            this.state.file, //文件路径，可选
            this //组件上下文
        );
        // window.pluto.third.dva.api.renderValue(text, contentEl);
    }
} 