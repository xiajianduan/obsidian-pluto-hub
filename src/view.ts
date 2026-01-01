import { ItemView, WorkspaceLeaf, ButtonComponent, Notice, MarkdownEditView } from 'obsidian';
import { ModStorage } from './storage';
import PlutoHubPlugin from './main';
import { MiniModule, ModuleBundle, ModFile } from 'settings';
import { t } from './utils/translation';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
// 由于 @codemirror/lang-

export const PLUTO_VIEW_TYPE = "pluto-dashboard-view";

export class PlutoView extends ItemView {
    plugin: PlutoHubPlugin;
    isEditing: boolean = false;
    currentModId: string | null = null;
    currentEditor: EditorView | null = null;
    currentFileIndex: number = 0;

    constructor(leaf: WorkspaceLeaf, plugin: PlutoHubPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() { return PLUTO_VIEW_TYPE; }
    getDisplayText() { return t('pluto.hub.display-text'); }
    getIcon() { return "layout-grid"; }

    /**
     * 获取当前选中的文件，如果不存在则返回null
     */
    getCurrentFile(bundle: ModuleBundle): ModFile | null {
        if (this.currentFileIndex < 0 || this.currentFileIndex >= bundle.files.length) {
            return null;
        }
        return bundle.files[this.currentFileIndex] || null;
    }

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
        header.createEl('h2', { text: t('pluto.hub.dashboard.title'), cls: 'pluto-title' });

        // 添加模块按钮
        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.add-module'))
            .setClass('grad_button')
            .onClick(() => this.addNewModule());

        // 导入导出按钮
        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.import'))
            .setClass('grad_button')
            .onClick(() => this.showImportDialog());

        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.export-all'))
            .setClass('grad_button')
            .onClick(() => this.showExportAllDialog());

        const grid = el.createDiv({ cls: 'pluto-grid' });

        this.plugin.settings.modules.forEach((mod: MiniModule) => {
            const card = grid.createDiv({ cls: 'pluto-card' });
            card.style.background = mod.bgColor || 'var(--background-secondary-alt)';

            const cardHeader = card.createDiv({ cls: 'card-header' });
            // 显示状态标签
            cardHeader.createEl('span', { 
                text: mod.enabled ? t('pluto.hub.dashboard.active') : t('pluto.hub.dashboard.disabled'), 
                cls: 'badge',
                attr: { style: mod.enabled ? 'background-color: var(--interactive-success)' : 'background-color: var(--text-muted)' }
            });

            // 启用/禁用开关
            const toggle = cardHeader.createEl('input', { type: 'checkbox', cls: 'mod-toggle' });
            toggle.checked = mod.enabled;
            toggle.onclick = async (e) => {
                e.stopPropagation(); // 防止点击开关时触发进入编辑器
                mod.enabled = toggle.checked;
                await this.plugin.saveSettings();
                this.plugin.runAllEnabled(); // 刷新运行状态
            };

            // 模块名称
            card.createDiv({ text: mod.name, cls: 'card-title' });

            // 模块操作按钮
            const cardActions = card.createDiv({ cls: 'card-actions' });
            
            // 导出按钮
            new ButtonComponent(cardActions)
                .setIcon('download')
                .setTooltip(t('pluto.hub.dashboard.export-tooltip'))
                .setClass('mod-export-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    await this.exportModule(mod.id);
                });

            // 点击卡片：切换到编辑状态
            card.onClickEvent(() => {
                this.isEditing = true;
                this.currentModId = mod.id;
                this.currentFileIndex = 0;
                this.render();
            });
        });
    }

    // --- 2. 编辑器界面 (基于 ModuleBundle 内容) ---
    async renderEditor(el: HTMLElement) {
        const mod = this.plugin.settings.modules.find(m => m.id === this.currentModId);
        if (!mod) return;

        // 1. 创建导航栏
        const nav = el.createDiv({ cls: 'pluto-editor-nav' });
        
        // 返回按钮
        new ButtonComponent(nav)
            .setIcon("arrow-left")
            .setTooltip(t('pluto.hub.editor.back-to-dashboard'))
            .onClick(() => {
                this.isEditing = false;
                this.currentEditor?.destroy();
                this.currentEditor = null;
                this.render();
            });
            
        // 模块名称
        nav.createEl('h3', { text: mod.name, cls: 'editor-title' });

        // 2. 异步加载模块内容
        const bundle: ModuleBundle = await ModStorage.loadBundle(this.plugin, mod.id);

        // 如果没有文件，创建一个默认的 main.js
        if (bundle.files.length === 0) {
            bundle.files.push({ name: 'main.js', type: 'js', content: 'new Notice(mod.name);' });
        }

        // 3. 渲染编辑器布局
        const editorLayout = el.createDiv({ cls: 'pluto-editor-layout' });
        
        // 文件侧边栏
        const fileSidebar = editorLayout.createDiv({ cls: 'pluto-file-sidebar' });
        
        // CodeMirror 编辑器容器
        const editorContainer = editorLayout.createDiv({ cls: 'pluto-cm-editor' });

        // 4. 渲染文件侧边栏
        this.renderFileSidebar(fileSidebar, bundle, editorContainer);

        // 5. 渲染编辑器 - 确保currentFileIndex有效
        this.currentFileIndex = Math.min(this.currentFileIndex, bundle.files.length - 1);
        const currentFile = this.getCurrentFile(bundle);
        if (currentFile) {
            this.renderCodeMirror(editorContainer, currentFile);
        }

        // 6. 渲染底部操作栏
        const footer = el.createDiv({ cls: 'pluto-editor-footer' });
        
        // 保存按钮
        new ButtonComponent(footer)
            .setButtonText(t('pluto.hub.editor.save-changes'))
            .setCta()
            .onClick(async () => {
                await this.saveCurrentBundle(bundle);
            });

        // 删除按钮
        new ButtonComponent(footer)
            .setButtonText(t('pluto.hub.editor.delete-module'))
            .setWarning()
            .onClick(async () => {
                if (confirm(`Delete ${mod.name}? This cannot be undone.`)) {
                    await this.deleteModule(mod.id);
                    this.isEditing = false;
                    this.currentEditor?.destroy();
                    this.currentEditor = null;
                    this.render();
                }
            });
    }

    // 渲染文件侧边栏
    renderFileSidebar(sidebarEl: HTMLElement, bundle: ModuleBundle, editorContainer: HTMLElement) {
        sidebarEl.empty();
        
        bundle.files.forEach((file, index) => {
            const item = sidebarEl.createDiv({
                cls: `file-item ${index === this.currentFileIndex ? 'is-active' : ''}`
            });
            
            // 文件名称
            const fileName = item.createSpan({
                text: file.name,
                cls: 'file-name'
            });
            
            // 删除按钮
            const deleteBtn = item.createSpan({
                text: '×',
                cls: 'delete-file-btn'
            });
            
            // 文件点击事件
            fileName.onclick = async () => {
                // 保存当前文件内容
                const currentFile = this.getCurrentFile(bundle);
                if (this.currentEditor && currentFile) {
                    currentFile.content = this.currentEditor.state.doc.toString();
                }
                
                // 切换文件
                this.currentFileIndex = index;
                this.renderFileSidebar(sidebarEl, bundle, editorContainer);
                
                // 重新渲染编辑器
                this.currentEditor?.destroy();
                this.renderCodeMirror(editorContainer, file);
            };
            
            // 删除按钮点击事件
            deleteBtn.onclick = async (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                
                // 如果只有一个文件，不允许删除
                if (bundle.files.length <= 1) {
                    alert(t('pluto.hub.editor.cannot-delete-last-file'));
                    return;
                }
                
                // 确认删除
                if (!confirm(t('pluto.hub.editor.confirm-delete-file').replace('{filename}', file.name))) {
                    return;
                }
                
                // 保存当前文件内容
                const currentFile = this.getCurrentFile(bundle);
                if (this.currentEditor && currentFile) {
                    currentFile.content = this.currentEditor.state.doc.toString();
                }
                
                // 删除文件
                bundle.files.splice(index, 1);
                
                // 更新当前文件索引
                if (this.currentFileIndex >= index && this.currentFileIndex > 0) {
                    this.currentFileIndex--;
                }
                
                // 重新渲染文件列表
                this.renderFileSidebar(sidebarEl, bundle, editorContainer);
                
                // 重新渲染编辑器
                this.currentEditor?.destroy();
                const fileToRender = bundle.files[this.currentFileIndex];
                if (fileToRender) {
                    this.renderCodeMirror(editorContainer, fileToRender);
                } else if (bundle.files.length > 0) {
                    // 确保至少渲染一个文件
                    const firstFile = bundle.files[0];
                    if (firstFile) {
                        this.renderCodeMirror(editorContainer, firstFile);
                    }
                }
            };
        });
        
        // 添加新文件按钮
        new ButtonComponent(sidebarEl)
            .setButtonText(t('pluto.hub.add-file'))
            .setClass('add-file-btn')
            .onClick(async () => {
                const name = await this.promptUser(t('pluto.hub.file-name-prompt'));
                if (name) {
                    const type = name.split('.').pop() || 'txt';
                    bundle.files.push({ name, type, content: "" });
                    this.renderFileSidebar(sidebarEl, bundle, editorContainer);
                }
            });
    }

    // 渲染 CodeMirror 6 编辑器
    renderCodeMirror(containerEl: HTMLElement, file: ModFile) {
        containerEl.empty();
        
        // 根据文件类型选择语言支持
        let languageExtension;
        switch (file.type) {
            case 'js':
            case 'javascript':
                languageExtension = javascript();
                break;
            case 'css':
                languageExtension = css();
                break;
            case 'json':
                languageExtension = javascript(); // JSON 语法高亮暂时用 js 扩展替代
                break;
            default:
                languageExtension = [];
        }
        
        // 创建编辑器状态
        const startState = EditorState.create({
            doc: file.content,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentUnit.of('    '),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                bracketMatching(),
                indentOnInput(),
                closeBrackets(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                history(),
                keymap.of([...(defaultKeymap as any), ...(historyKeymap as any)]), // 类型转换以解决版本兼容问题
                languageExtension,
                EditorView.updateListener.of(update => {
                    if (update.docChanged) {
                        // 可以在这里添加自动保存逻辑
                    }
                }),
                EditorView.theme({
                    "&": {
                        height: "100%",
                        overflow: "hidden"
                    },
                    ".cm-scroller": {
                        overflow: "auto",
                        height: "100%"
                    },
                    ".cm-content": {
                        padding: "16px"
                    },
                    ".cm-line": {
                        padding: "0 4px"
                    },
                    ".cm-gutters": {
                        backgroundColor: "var(--background-secondary-alt)",
                        color: "var(--text-muted)",
                        border: "none"
                    },
                    ".cm-activeLineGutter": {
                        backgroundColor: "var(--background-hover)"
                    },
                    ".cm-activeLine": {
                        backgroundColor: "var(--background-hover)"
                    },
                    ".cm-selectionMatch": {
                        backgroundColor: "var(--background-secondary)"
                    }
                })
            ]
        });
        
        // 创建编辑器视图
        this.currentEditor = new EditorView({
            state: startState,
            parent: containerEl
        });
    }

    // 保存当前模块
    async saveCurrentBundle(bundle: ModuleBundle) {
        // 保存当前文件内容
        const currentFile = this.getCurrentFile(bundle);
        if (this.currentEditor && currentFile) {
            currentFile.content = this.currentEditor.state.doc.toString();
        }
        
        // 保存到磁盘
        await ModStorage.saveBundle(this.plugin, bundle);
        
        // 重新加载模块
        // this.plugin.runAllEnabled();
        
        // 显示保存成功通知
        new Notice(t('pluto.hub.editor.module-saved'));
    }

    // --- 3. 导入导出功能 ---
    showImportDialog() {
        // 简单的文件选择对话框
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.ops';
        
        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                if (file) {
                    try {
                        // 读取文件内容
                        const buffer = await this.readFileAsArrayBuffer(file);
                        
                        // 保存到临时位置
                        const tempPath = `${this.app.vault.configDir}/temp-import.pluto`;
                        await this.app.vault.adapter.writeBinary(tempPath, buffer);
                        
                        // 导入模块
                        await ModStorage.importModule(this.plugin, tempPath);
                        
                        // 删除临时文件
                        await this.app.vault.adapter.remove(tempPath);
                        
                        new Notice(t('pluto.hub.import-success'));
                        this.render();
                    } catch (e) {
                        console.error("Failed to import module:", e);
                        new Notice(t('pluto.hub.import-failure'));
                    }
                }
            }
        };
        
        input.click();
    }

    async showExportAllDialog() {
        // 使用 window.pluto.qa.inputPrompt 获取保存路径
        const result = await window.pluto.qa.inputPrompt(
            t('pluto.hub.export.all-title'), t('pluto.hub.export.all-default-filename'));
        
        if (result) {
            try {
                await ModStorage.backupAllModules(this.plugin, result);
                new Notice(t('pluto.hub.export.all-success'));
            } catch (e) {
                console.error("Failed to export modules:", e);
                new Notice(t('pluto.hub.export.all-failure'));
            }
        }
    }

    async exportModule(moduleId: string) {
        const mod = this.plugin.settings.modules.find(m => m.id === moduleId);
        if (!mod) return;
        
        // 使用 window.pluto.qa.inputPrompt 获取保存路径
        const result = await window.pluto.qa.inputPrompt(
            t('pluto.hub.export.module-title'), `${mod.name}.ops`);
        
        if (result) {
            try {
                await ModStorage.exportModule(this.plugin, moduleId, result);
                new Notice(t('pluto.hub.export.module-success'));
            } catch (e) {
                console.error("Failed to export module:", e);
                new Notice(t('pluto.hub.export.module-failure'));
            }
        }
    }

    // --- 4. 辅助逻辑 ---
    async addNewModule() {
        const name = await this.promptUser(t('pluto.hub.module-name-prompt'));
        if (!name) return;

        const newId = Date.now().toString();
        const newMod: MiniModule = {
            id: newId,
            name: name,
            enabled: true,
            bgColor: this.generateRandomGradient()
        };

        // 1. 保存索引
        this.plugin.settings.modules.push(newMod);
        await this.plugin.saveSettings();

        // 2. 初始化一个空的二进制包
        const initialBundle: ModuleBundle = {
            id: newId,
            files: [{ name: 'main.js', type: 'js', content: 'new Notice(mod.name);' }]
        };
        await ModStorage.saveBundle(this.plugin, initialBundle);

        this.render();
    }

    async deleteModule(id: string) {
        // 1. 从设置中移除索引
        const mod = this.plugin.settings.modules.find(m => m.id === id);
        if (mod) {
            this.plugin.settings.modules = this.plugin.settings.modules.filter(m => m.id !== id);
            await this.plugin.saveSettings();

            // 2. 从磁盘移除文件
            const path = ModStorage.getModulePath(this.plugin, mod.name);
            if (await this.app.vault.adapter.exists(path)) {
                await this.app.vault.adapter.remove(path);
            }
        }
    }

    // 生成随机渐变色
    generateRandomGradient(): string {
        const colors = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7'],
            ['#fa709a', '#fee140'],
            ['#30cfd0', '#330867'],
            ['#a8edea', '#fed6e3'],
            ['#ff9a9e', '#fad0c4']
        ];
        
        // 确保 randomPair 不为 undefined (类型安全)
        const randomPair = colors[Math.floor(Math.random() * colors.length)] ?? ['#667eea', '#764ba2'];
        return `linear-gradient(135deg, ${randomPair[0]} 0%, ${randomPair[1]} 100%)`;
    }

    // 用户输入提示
    async promptUser(message: string): Promise<string | null> {
        return new Promise((resolve) => {
            const input = window.pluto.qa.inputPrompt(message);
            resolve(input);
        });
    }

    // 读取文件为 ArrayBuffer
    async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}