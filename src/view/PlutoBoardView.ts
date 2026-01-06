import { ItemView, WorkspaceLeaf } from 'obsidian';
import PlutoHubPlugin from '../main';
import { t } from '../utils/translation';

import { ViewResolver } from 'core/ViewResolver';

export const VIEW_TYPE_BOARD = "pluto-board-view";

export class PlutoBoardView extends ItemView {
    plugin: PlutoHubPlugin;
    headerEl: HTMLElement;
    resolver: ViewResolver;

    constructor(leaf: WorkspaceLeaf, plugin: PlutoHubPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.headerEl.remove();
        this.resolver = new ViewResolver(plugin, this.contentEl);
    }

    getViewType() { return VIEW_TYPE_BOARD; }
    getDisplayText() { return t('pluto.hub.display-text'); }
    getIcon() { return "layout-grid"; }

    async onOpen() { this.resolver.render(); }


}