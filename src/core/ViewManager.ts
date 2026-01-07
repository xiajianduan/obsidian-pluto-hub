import PlutoHubPlugin from "main";
import { VIEW_TYPE_BOARD, PlutoBoardView } from "view/PlutoBoardView";
import { PlutoFileView, VIEW_TYPE_FILE } from "view/PlutoFileView";
import { VIEW_TYPE_TEXT, PlutoTextView } from "view/PlutoTextView";

export class ViewManager {

    plugin: PlutoHubPlugin;

    async build(plugin: PlutoHubPlugin) {
        this.plugin = plugin;
        // 注册 PlutoBoardView 视图
        plugin.registerView(VIEW_TYPE_BOARD, (leaf) => new PlutoBoardView(leaf, plugin));
        plugin.registerView(VIEW_TYPE_FILE, leaf=> new PlutoFileView(leaf));
        plugin.registerView(VIEW_TYPE_TEXT, leaf=> new PlutoTextView(leaf));
    }

    preview(props: any) {
        const file = window.pluto.helper.find_tfile(props.click);
        const leaf = this.plugin.app.workspace.getLeaf("tab");
        leaf.setViewState({
            type: VIEW_TYPE_FILE,
            state: {
                title: props.name,
                icon: props.id,
                file: file.path,
                mode: "preview"
            },
        });
    }
        
    textview(props: any) {
        const leaf = this.plugin.app.workspace.getLeaf("tab");
        leaf.setViewState({
            type: VIEW_TYPE_TEXT,
            state: {
                title: props.name,
                icon: props.id,
                text: props.text,
                file: props.path,
                mode: "preview"
            },
        });
    }
}