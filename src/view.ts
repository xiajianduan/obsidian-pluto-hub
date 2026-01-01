import { ItemView, WorkspaceLeaf, ButtonComponent, Notice, TextComponent, MarkdownEditView, MarkdownRenderer } from 'obsidian';
import { ModStorage } from './storage';
import PlutoHubPlugin from './main';
import { MiniModule, ModuleBundle } from 'settings';

export const PLUTO_VIEW_TYPE = "pluto-dashboard-view";

export class PlutoView extends ItemView {
    plugin: PlutoHubPlugin;
    isEditing: boolean = false;
    currentModId: string | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: PlutoHubPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return PLUTO_VIEW_TYPE; }
    getDisplayText() { return "Pluto hub"; }
    getIcon() { return "layout-grid"; }

    async onOpen() { this.render(); }

    render() {
        const container = this.contentEl;
        container.empty();
        container.addClass('pluto-main-container');
        // 使用 CSS 变量控制商店列数
        container.style.setProperty('--pluto-cols', String(this.plugin.settings.columns));

        if (this.isEditing) {
            this.renderEditor(container);
        } else {
            this.renderDashboard(container);
        }
    }

    // --- 1. 商店界面 (基于 MiniModule 索引) ---
    renderDashboard(el: HTMLElement) {
        const header = el.createDiv({ cls: 'pluto-header' });
        header.createEl('h2', { text: 'Pluto modules' });

        new ButtonComponent(header)
            .setButtonText("Add module")
            .setCta()
            .onClick(() => this.addNewModule());

        const grid = el.createDiv({ cls: 'pluto-grid' });

        this.plugin.settings.modules.forEach((mod: MiniModule) => {
            const card = grid.createDiv({ cls: 'pluto-card' });
            card.style.background = mod.bgColor || 'var(--background-secondary-alt)';

            const cardHeader = card.createDiv({ cls: 'card-header' });
            // 显示状态标签
            cardHeader.createEl('span', { text: mod.enabled ? 'Active' : 'Disabled', cls: 'badge' });

            const toggle = cardHeader.createEl('input', { type: 'checkbox', cls: 'mod-toggle' });
            toggle.checked = mod.enabled;
            toggle.onclick = async (e) => {
                e.stopPropagation(); // 防止点击开关时触发进入编辑器
                mod.enabled = toggle.checked;
                await this.plugin.saveSettings();
                this.plugin.runAllEnabled(); // 刷新运行状态
            };

            card.createDiv({ text: mod.name, cls: 'card-title' });

            // 点击卡片：切换到编辑状态，并指定 ID
            card.onClickEvent(() => {
                this.isEditing = true;
                this.currentModId = mod.id;
                this.render();
            });
        });
    }

    // --- 2. 编辑器界面 (基于 ModuleBundle 内容) ---
    async renderEditor(el: HTMLElement) {
        const mod = this.plugin.settings.modules.find(m => m.id === this.currentModId);
        if (!mod) return;

        // 1. 同步创建导航栏布局（防止标题显示 Promise）
        const nav = el.createDiv({ cls: 'pluto-editor-nav' });
        new ButtonComponent(nav).setIcon("arrow-left").onClick(() => {
            this.isEditing = false;
            this.render();
        });
        // 直接使用 mod.name，这是 settings 里的同步数据，不会报错
        nav.createEl('h3', { text: mod.name });

        // 2. 异步加载二进制包内容
        const bundle: ModuleBundle = await ModStorage.loadBundle(this.plugin, mod.id);

        // 3. 渲染后续的代码编辑区域
        this.renderBundleEditor(el, bundle, mod);
    }

    // 拆分出一个处理具体包内容的函数，避免主 render 函数太臃肿
    renderBundleEditor(el: HTMLElement, bundle: ModuleBundle, mod: MiniModule) {
        if (bundle.files.length === 0) {
            bundle.files.push({ name: 'main.js', type: 'js', content: '' });
        }

        let activeFileIndex = 0;
        const editorLayout = el.createDiv({ cls: 'pluto-editor-layout' });
        const fileSidebar = editorLayout.createDiv({ cls: 'pluto-file-sidebar' });

        // 创建一个空的容器，用来挂载 CodeMirror 编辑器
        const editorContainer = editorLayout.createDiv({ cls: 'pluto-cm-editor' });

        // 初始化编辑器（这是一个简化的用法，利用 TextComponent 快速创建）
        const textComponent = new TextComponent(editorContainer);
        const inputEl = textComponent.inputEl;
        inputEl.addClass('pluto-textarea-hidden'); // 隐藏原始输入框

        // 如果想实现真正的彩色高亮，我们需要调用 Obsidian 内置的 Markdown 代码块样式
        // 这里我们采用最稳妥的方法：模拟一个 Markdown 代码编辑器环境
        const refreshSidebar = () => {
            fileSidebar.empty();
            bundle.files.forEach((file, index) => {
                const item = fileSidebar.createDiv({
                    text: file.name,
                    cls: `file-item ${index === activeFileIndex ? 'is-active' : ''}`
                });
                item.onclick = () => {
                    const prevFile = bundle.files[activeFileIndex];
                    if (prevFile) prevFile.content = inputEl.value;

                    activeFileIndex = index;
                    refreshSidebar();

                    const nextFile = bundle.files[index];
                    if (nextFile) {
                        inputEl.value = "```" + nextFile.type + "\n" + nextFile.content + "\n```";
                    }
                };
            });
            new ButtonComponent(fileSidebar)
                .setButtonText("+ File")
                .onClick(async () => {
                    const name = await window.pluto.qa.inputPrompt("File name (e.g. config.json):");
                    if (name) {
                        const type = name.split('.').pop() || 'txt';
                        bundle.files.push({ name, type, content: "" });
                        refreshSidebar();
                    }
                });
        };

        refreshSidebar();
        inputEl.value = bundle.files[activeFileIndex]?.content || "";

        const footer = el.createDiv({ cls: 'pluto-editor-footer' });
        // 保存按钮
        new ButtonComponent(footer).setButtonText("Save all changes").setCta().onClick(async () => {
            bundle.files[activeFileIndex]!.content = inputEl.value;
            await ModStorage.saveBundle(this.plugin, bundle);
            this.plugin.runAllEnabled(); // 重新加载运行
            new Notice("Module bundle saved");
        });

        // 删除按钮
        new ButtonComponent(footer).setButtonText("Delete module").setWarning().onClick(async () => {
            if (confirm(`Delete ${mod.name}? This cannot be undone.`)) {
                await this.deleteModule(mod.id);
                this.isEditing = false;
                this.render();
            }
        });
    }

    // --- 3. 辅助逻辑 ---
    async addNewModule() {
        const name = await window.pluto.qa.inputPrompt("Module name:");
        if (!name) return;

        const newId = Date.now().toString();
        const newMod: MiniModule = {
            id: newId,
            name: name,
            enabled: true,
            bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };

        // 1. 保存索引
        this.plugin.settings.modules.push(newMod);
        await this.plugin.saveSettings();

        // 2. 初始化一个空的二进制包
        const initialBundle: ModuleBundle = {
            id: newId,
            files: [{ name: 'main.js', type: 'js', content: '// Happy coding!' }]
        };
        await ModStorage.saveBundle(this.plugin, initialBundle);

        this.render();
    }

    async deleteModule(id: string) {
        // 1. 从设置中移除索引
        this.plugin.settings.modules = this.plugin.settings.modules.filter(m => m.id !== id);
        await this.plugin.saveSettings();

        // 2. 从磁盘移除二进制文件
        const path = ModStorage.getPath(this.plugin, id);
        if (await this.app.vault.adapter.exists(path)) {
            await this.app.vault.adapter.remove(path);
        }
    }
}