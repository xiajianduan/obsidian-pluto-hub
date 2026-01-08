import { App, Modal } from "obsidian";
import { FormModalContent } from "./FormModal";
import { FormModalConfig, FormValues } from "../types/form";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

export class PlutoFormModal extends Modal {
    private config: FormModalConfig;
    private defaultValues: FormValues;
    private onSubmit: (values: FormValues) => void;
    private onCancel: (values: FormValues) => void;
    private root: any;

    constructor(app: App,
        config: FormModalConfig,
        defaultValues: FormValues = {},
        onSubmit: (values: FormValues) => void,
        onCancel: (values: FormValues) => void) {
        super(app);
        this.config = config;
        this.defaultValues = defaultValues;
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
    }

    onOpen() {
        this.root = createRoot(this.containerEl.children[1] as HTMLElement);
        this.root.render(
            <StrictMode>
                <FormModalContent
                    config={this.config}
                    defaultValues={this.defaultValues}
                    onSubmit={this.onSubmit}
                    onClose={() => this.close()}
                />
            </StrictMode>
        );
    }

    onClose() {
        this.onCancel(this.defaultValues);
        // 卸载 React 组件，避免内存泄漏
        this.root?.unmount();
        this.contentEl.empty();
    }
}