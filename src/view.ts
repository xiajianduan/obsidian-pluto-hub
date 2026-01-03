import { ItemView, WorkspaceLeaf, ButtonComponent, Notice, MarkdownEditView } from 'obsidian';
import { ModStorage } from './storage';
import PlutoHubPlugin from './main';
import { MiniModule, ModFile } from 'settings';
import { t } from './utils/translation';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { base64ToBlob, base64ToBlobUrl, downloadImageToBase64, isImageFile } from 'utils/helper';

export const PLUTO_VIEW_TYPE = "pluto-dashboard-view";

export class PlutoView extends ItemView {
    plugin: PlutoHubPlugin;
    isEditing: boolean = false;
    currentModId: string | null = null;
    currentEditor: EditorView | null = null;
    currentFileIndex: number = 0;
    headerEl: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: PlutoHubPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.headerEl.remove();
    }

    getViewType() { return PLUTO_VIEW_TYPE; }
    getDisplayText() { return t('pluto.hub.display-text'); }
    getIcon() { return "layout-grid"; }

    /**
     * 获取当前选中的文件
     * @param bundle MiniModule对象
     * @returns 当前选中的文件或null
     */
    getCurrentFile(bundle: MiniModule): ModFile | null {
        if (this.currentFileIndex < 0 || this.currentFileIndex >= bundle.files.length) {
            return null;
        }
        return bundle.files[this.currentFileIndex] || null;
    }

    /**
     * 加载所有模块的辅助方法，避免重复调用ModStorage.loadAllModulesFromStorage
     */
    async loadAllModules(): Promise<MiniModule[]> {
        return await ModStorage.loadAllModulesFromStorage(this.plugin);
    }

    /**
     * 保存当前编辑器中的内容到文件
     */
    saveCurrentEditorContent(bundle: MiniModule): void {
        const currentFile = this.getCurrentFile(bundle);
        if (this.currentEditor && currentFile) {
            currentFile.content = this.currentEditor.state.doc.toString();
        }
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



    /**
     * 渲染模块列表
     */
    async renderModules(grid: HTMLElement, filter?: string): Promise<void> {
        grid.empty();
        
        // 从存储中加载所有模块
        const allModules = await this.loadAllModules();
        let filteredModules = allModules;
        
        if (filter) {
            const lowerFilter = filter.toLowerCase();
            filteredModules = allModules.filter((mod: MiniModule) => 
                mod.name.toLowerCase().includes(lowerFilter)
            );
        }
        
        filteredModules.forEach((mod: MiniModule) => {
            const card = grid.createDiv({ cls: 'pluto-card' });
            
            // 检查bgUrl是否存在
            if (mod.bgUrl) {
                // 对于图片，使用背景图片样式
                const bgLayer = card.createDiv({ cls: 'card-bg' });
                bgLayer.style.backgroundImage = `url(${mod.bgUrl})`;
                card.style.backgroundColor = 'transparent';
            } else {
                // 对于渐变或纯色，使用普通背景
                card.style.background = mod.bgColor || 'var(--background-secondary-alt)';
            }

            const cardHeader = card.createDiv({ cls: 'card-header' });
            // 根据启用状态添加灰度滤镜样式
            if (!mod.enabled) {
                card.style.filter = 'grayscale(1)';
            }

            // 启用/禁用开关
            const toggle = cardHeader.createEl('input', { type: 'checkbox', cls: 'mod-toggle' });
            toggle.checked = mod.enabled;
            toggle.onclick = async (e) => {
                e.stopPropagation(); // 防止点击开关时触发进入编辑器
                mod.enabled = toggle.checked;
                await ModStorage.saveBundle(this.plugin, mod);
                if (mod.enabled) {
                    this.plugin.runBundle(mod);
                } else {
                    // 如果模块被禁用，移除该模块的所有样式
                    document.querySelectorAll(`[id^="pluto-css-${mod.id}-"]`).forEach(el => el.remove());
                    // 从pluto.modules中移除该模块的导出
                    if ((window as any).pluto && (window as any).pluto.modules) {
                        delete (window as any).pluto.modules[mod.name];
                    }
                }
                
                this.render(); // 重新渲染界面，更新状态标签
            };

            // 导出按钮
            new ButtonComponent(cardHeader)
                .setIcon('download')
                .setTooltip(t('pluto.hub.dashboard.export-tooltip'))
                .setClass('mod-export-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    await this.exportModule(mod.name);
                });

            // 模块名称
            card.createDiv({ text: mod.name, cls: 'card-title' });

            // 模块操作按钮
            const cardActions = card.createDiv({ cls: 'card-actions' });
            
            // 编辑按钮
            new ButtonComponent(cardActions)
                .setIcon('pencil')
                .setTooltip(t('pluto.hub.dashboard.edit-tooltip'))
                .setClass('mod-export-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    this.isEditing = true;
                    this.currentModId = mod.id;
                    this.currentFileIndex = 0;
                    this.render();
                });
            
            // 删除按钮
            new ButtonComponent(cardActions)
                .setIcon('trash')
                .setTooltip(t('pluto.hub.dashboard.delete-tooltip'))
                .setClass('mod-export-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    await this.deleteModule(mod.id);
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

    // --- 1. 商店界面 (基于 MiniModule 索引) ---
/**
     * 渲染仪表盘界面，显示所有模块列表和搜索功能
     * @param el 渲染仪表盘的容器元素
     */
    renderDashboard(el: HTMLElement) {
        const header = el.createDiv({ cls: 'pluto-header' });
        
        // 标题
        header.createEl('h2', { text: t('pluto.hub.dashboard.title'), cls: 'pluto-title' });

        // 添加模块按钮
        const addModuleBtn = new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.add-module'))
            .setClass('btn_nob')
            .onClick(async () => {
                try {
                    await this.addNewModule();
                } finally {
                    // 确保按钮状态重置，无论用户取消还是完成操作
                    (addModuleBtn.buttonEl as any).isLoading = false;
                }
            });

        // 导入导出按钮
        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.import'))
            .setClass('btn_nob')
            .onClick(() => this.showImportDialog());

        // 导出所有按钮
        const exportAllBtn = new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.export-all'))
            .setClass('btn_nob')
            .onClick(async () => {
                try {
                    await this.showExportAllDialog();
                } finally {
                    // 确保按钮状态重置
                    (exportAllBtn.buttonEl as any).isLoading = false;
                }
            });
        
        // 搜索框 - 放在最右侧
        const searchContainer = header.createDiv({ cls: 'pluto-search-container' });
        const searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: t('pluto.hub.dashboard.search-placeholder'),
            cls: 'pluto-search-input'
        });

        const grid = el.createDiv({ cls: 'pluto-grid' });
        
        // 初始渲染所有模块
        this.renderModules(grid);
        
        // 搜索框事件监听器
        searchInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.renderModules(grid, target.value.trim());
        });
    }

    // --- 2. 编辑器界面 (基于 ModuleBundle 内容) ---
/**
     * 渲染编辑器界面，包括文件侧边栏和代码编辑器
     * @param el 渲染编辑器的容器元素
     */
    async renderEditor(el: HTMLElement) {
        if (!this.currentModId) return;
        
        // 从存储中加载所有模块，查找当前模块
        const allModules = await this.loadAllModules();
        const module = allModules.find(m => m.id === this.currentModId);
        if (!module) return;

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
            
        // 模块名称（居中）
        nav.createEl('h3', { text: module.name, cls: 'editor-title centered-title' });

        // 如果没有文件，创建一个默认的 main.js
        if (module.files.length === 0) {
            module.files.push({ name: 'main.js', type: 'js', content: 'new Notice(mod.name);' });
        }

        // 3. 渲染编辑器布局
        const editorLayout = el.createDiv({ cls: 'pluto-editor-layout' });
        
        // 文件侧边栏
        const fileSidebar = editorLayout.createDiv({ cls: 'pluto-file-sidebar' });
        
        // CodeMirror 编辑器容器
        const editorContainer = editorLayout.createDiv({ cls: 'pluto-cm-editor' });
        
        // 新建文件按钮（移到导航栏）
        const addFileBtn = new ButtonComponent(nav)
            .setButtonText(t('pluto.hub.editor.add-file'))
            .setClass("btn_nob")
            .onClick(async () => {
                try {
                    const name = await this.promptUser(t('pluto.hub.file-name-prompt'));
                    if (name) {
                        const trimmedName = name.trim();
                        if (trimmedName === '') {
                            new Notice(t('pluto.hub.validation.empty-file-name'));
                            return;
                        }
                        
                        // 检查文件名是否已存在
                        if (module.files.some(file => file.name.toLowerCase() === trimmedName.toLowerCase())) {
                            new Notice(t('pluto.hub.validation.duplicate-file-name'));
                            return;
                        }
                        
                        // 检查文件名是否包含无效字符（根据不同操作系统的文件命名规则）
                        if (/[<>:"/\\|?*]/.test(trimmedName)) {
                            new Notice(t('pluto.hub.validation.invalid-file-name'));
                            return;
                        }
                        
                        const type = trimmedName.split('.').pop() || 'txt';
                        module.files.push({ name: trimmedName, type, content: "" });
                        this.renderFileSidebar(fileSidebar, module, editorContainer);
                    }
                } finally {
                    // 确保按钮状态重置，无论用户取消还是完成操作
                    (addFileBtn.buttonEl as any).isLoading = false;
                }
            });
        
        // 导入文件按钮（移到导航栏）
        new ButtonComponent(nav)
            .setButtonText(t('pluto.hub.editor.import-file'))
            .setClass("btn_nob")
            .onClick(() => this.importFileToModule(module, editorContainer));
            
        // 导出文件按钮（移到导航栏）
        new ButtonComponent(nav)
            .setButtonText(t('pluto.hub.editor.export-files'))
            .setClass("btn_nob")
            .onClick(() => this.exportFilesToFolder(module));
            
        // 保存按钮（移到导航栏）
        const saveBtn = new ButtonComponent(nav)
            .setButtonText(t('pluto.hub.editor.save-changes'))
            .setClass("btn_nob")
            .setCta()
            .onClick(async () => {
                try {
                    await this.saveCurrentBundle(module);
                } finally {
                    // 确保按钮状态重置
                    (saveBtn.buttonEl as any).isLoading = false;
                }
            });

        // 删除按钮（移到导航栏）
        new ButtonComponent(nav)
            .setButtonText(t('pluto.hub.editor.delete-module'))
            .setClass("btn_nob")
            .setWarning()
            .onClick(async () => {
                if (confirm(`Delete ${module.name}? This cannot be undone.`)) {
                    await this.deleteModule(module.id);
                    this.isEditing = false;
                    this.currentEditor?.destroy();
                    this.currentEditor = null;
                    this.render();
                }
            });

        // 4. 渲染文件侧边栏
        this.renderFileSidebar(fileSidebar, module, editorContainer);

        // 5. 渲染编辑器 - 确保currentFileIndex有效
        this.currentFileIndex = Math.min(this.currentFileIndex, module.files.length - 1);
        const currentFile = this.getCurrentFile(module);
        if (currentFile) {
            this.renderCodeMirror(editorContainer, currentFile);
        }


    }

    // 渲染文件侧边栏
    renderFileSidebar(sidebarEl: HTMLElement, bundle: MiniModule, editorContainer: HTMLElement) {
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
            
            // 文件点击事件（绑定到整个item元素）
            item.onclick = async () => {
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
                this.currentEditor = null; // 清除当前编辑器引用，避免影响图片预览
                this.renderCodeMirror(editorContainer, file);
            };
            
            // 删除按钮点击事件
            deleteBtn.onclick = async (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                
                // 如果只有一个文件，不允许删除
                if (bundle.files.length <= 1) {
                    new Notice(t('pluto.hub.editor.cannot-delete-last-file'));
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
    }

    // 渲染 CodeMirror 6 编辑器或图片预览
    renderCodeMirror(containerEl: HTMLElement, file: ModFile) {
        containerEl.empty();
        
        // 检查是否为图片文件，添加预览功能
        if (isImageFile(file.type)) {
            // 使用 Blob URL 替代 base64 显示图片，避免 URL 格式错误
            try {debugger
                // 使用公共方法将base64转换为Blob URL
                const blobUrl = base64ToBlobUrl(file.content, file.type);
                // 显示图片预览
                const imgEl = containerEl.createEl('img', {
                    attr: {
                        src: blobUrl,
                        alt: file.name
                    },
                    cls: 'pluto-image-preview'
                });
                imgEl.style.maxWidth = '100%';
                imgEl.style.maxHeight = '100%';
                imgEl.style.objectFit = 'contain';
                
                // 当组件销毁时释放 Blob URL
                imgEl.onload = () => {
                    URL.revokeObjectURL(blobUrl);
                };
                
                // 错误处理
                imgEl.onerror = () => {
                    console.error('Failed to load image from blob URL');
                    URL.revokeObjectURL(blobUrl);
                };
                
                // 当成功显示图片预览时，将 currentEditor 设置为 null
                // 这样切换文件时就不会错误地保存内容到图片的base64字段中
                this.currentEditor = null;
                
                return;
            } catch (e) {
                console.error('Failed to create blob URL for image:', e);
                // 输出实际的 file.content 以便诊断问题
                console.log('Actual file content:', file.content);
                // 如果无法显示图片，使用文本编辑器显示base64内容
                // 这是一个 fallback 机制，确保用户仍然可以访问文件内容
            }
        }
        
        // 根据文件类型选择语言支持，使用更简洁的对象映射替代switch语句
        const languageMap: Record<string, any> = {
            'js': javascript(),
            'javascript': javascript(),
            'css': css(),
            'json': javascript(), // JSON 语法高亮暂时用 js 扩展替代
            'md': markdown(),     // 使用 markdown 扩展支持 Markdown
            'markdown': markdown()
        };
        
        const languageExtension = languageMap[file.type] || [];
        
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

    /**
     * 保存当前模块的所有文件内容到存储中
     * @param bundle 要保存的模块包
     */
    async saveCurrentBundle(module: MiniModule) {
        // 保存当前文件内容
        this.saveCurrentEditorContent(module);
        
        // 更新模块的enabled状态
        const allModules = await this.loadAllModules();
        const currentModule = allModules.find(mod => mod.id === module.id);
        if (currentModule) {
            module.enabled = currentModule.enabled;
            module.bgColor = currentModule.bgColor;
        }
        
        // 保存到磁盘
        await ModStorage.saveBundle(this.plugin, module);
        
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
        try {
            // 优先使用 QuickAdd 的 inputPrompt 方法获取保存路径
            let result: string | null;
            if ((window as any).pluto?.qa?.inputPrompt) {
                result = await (window as any).pluto.qa.inputPrompt(t('pluto.hub.export.all-title'), t('pluto.hub.export.all-default-filename'));
            } else {
                // 如果 QuickAdd 不可用，回退到原生的 prompt 方法
                result = prompt(t('pluto.hub.export.all-title'), t('pluto.hub.export.all-default-filename'));
            }
            
            if (result) {
                // 使用配置中的备份目录
                const backupFolder = this.plugin.settings.backupFolderName;
                const configDir = this.plugin.app.vault.configDir;
                const backupFile = `${configDir}/${backupFolder}/${result}.ops`;
                await ModStorage.backupAllModules(this.plugin, backupFile);
                new Notice(t('pluto.hub.export.all-success'));
            }
        } catch (e) {
            console.error("Failed to export modules:", e);
            new Notice(t('pluto.hub.export.all-failure'));
        }
    }

    async exportModule(moduleKey: string) {
        // 从存储中加载所有模块，查找当前模块
        const allModules = await this.loadAllModules();
        const mod = allModules.find(m => m.name === moduleKey);
        if (!mod) return;
        
        try {
            await ModStorage.exportModule(this.plugin, moduleKey, `${mod.name}.ops`);
            new Notice(t('pluto.hub.export.module-success'));
        } catch (e) {
            console.error("Failed to export module:", e);
            new Notice(t('pluto.hub.export.module-failure'));
        }
    }

    // 导出模块中的所有文件到配置的备份目录
    async exportFilesToFolder(module: MiniModule) {
        try {
            // 获取模块信息
            const allModules = await this.loadAllModules();
            const mod = allModules.find(m => m.id === module.id);
            if (!mod) return;

            // 使用配置中的备份目录作为导出路径
            const backupFolder = this.plugin.settings.backupFolderName;
            const configDir = this.plugin.app.vault.configDir;
            const folder = `${configDir}/${backupFolder}/${mod.name}`;
            const adapter = this.plugin.app.vault.adapter;
            
            // 创建目录（如果不存在）
            if (!(await adapter.exists(folder))) {
                // 递归创建目录
                const createDirRecursive = async (dirPath: string) => {
                    if (await adapter.exists(dirPath)) return;
                    
                    const parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'));
                    if (parentDir && parentDir !== dirPath) {
                        await createDirRecursive(parentDir);
                    }
                    
                    await adapter.mkdir(dirPath);
                };
                
                await createDirRecursive(folder);
            }

            // 保存当前文件内容
            const currentFile = this.getCurrentFile(module);
            if (this.currentEditor && currentFile) {
                currentFile.content = this.currentEditor.state.doc.toString();
            }

            // 导出每个文件
            for (const file of module.files) {
                const filePath = `${folder}/${file.name}`;
                const adapter = this.plugin.app.vault.adapter;

                if (isImageFile(file.type)) {
                    // 处理图片文件
                    try {
                        const blob = base64ToBlob(file.content, file.type);
                        if (blob) {
                            await adapter.writeBinary(filePath, await blob.arrayBuffer());
                        } else {
                            throw new Error('Failed to convert base64 to blob');
                        }
                    } catch (e) {
                        console.error(`Failed to export image file ${file.name}:`, e);
                        new Notice(t('pluto.hub.export.file-failure').replace('{filename}', file.name));
                    }
                } else {
                    // 处理文本文件
                    try {
                        await adapter.write(filePath, file.content);
                    } catch (e) {
                        console.error(`Failed to export text file ${file.name}:`, e);
                        new Notice(t('pluto.hub.export.file-failure').replace('{filename}', file.name));
                    }
                }
            }

            new Notice(t('pluto.hub.export.all-files-success').replace('{modname}', mod.name));
        } catch (e) {
            console.error("Failed to export files:", e);
            new Notice(t('pluto.hub.export.all-files-failure'));
        }
    }

    // --- 4. 辅助逻辑 ---
    async addNewModule() {
        const name = await this.promptUser(t('pluto.hub.module-name-prompt'));
        if (!name || name.trim() === '') {
            new Notice(t('pluto.hub.validation.empty-module-name'));
            return;
        }

        // 检查模块名是否已存在
        const allModules = await this.loadAllModules();
        if (allModules.some(mod => mod.name.toLowerCase() === name.trim().toLowerCase())) {
            new Notice(t('pluto.hub.validation.duplicate-module-name'));
            return;
        }

        const newId = Date.now().toString();
        let bgColor = ModStorage.generateRandomGradient();
        let moduleFiles: { name: string; type: string; content: string }[] = [{ name: 'main.js', type: 'js', content: 'new Notice(mod.name);' }];

        // 检查pluto.skin.path是否存在
        const pluto = (window as any).pluto;
        if (pluto && pluto.skin && pluto.skin.path) {
            const skinPath = pluto.skin.path;
            // 下载图片并转换为base64
            const imageBase64 = await downloadImageToBase64(skinPath);
            if (imageBase64) {
                const base64Parts = imageBase64.split(',');
                moduleFiles = [{ name: 'logo.webp', type: 'webp', content: base64Parts[1]! }];
            }
        }

        const newMod: MiniModule = {
            id: newId,
            name: name,
            enabled: true,
            bgColor: bgColor,
            files: moduleFiles
        };
        
        // 保存到磁盘
        await ModStorage.saveBundle(this.plugin, newMod);

        this.render();
    }

    async deleteModule(id: string) {
        // 1. 从存储中加载所有模块，查找要删除的模块
        const allModules = await this.loadAllModules();
        const mod = allModules.find(m => m.id === id);
        
        if (mod) {
            // 2. 从磁盘移除文件
            const path = ModStorage.getModulePath(this.plugin, mod.name);
            if (await this.app.vault.adapter.exists(path)) {
                await this.app.vault.adapter.remove(path);
            }

            this.render();
        }
    }



    // 用户输入提示
    async promptUser(message: string): Promise<string | null> {
        return new Promise((resolve) => {
            // 优先使用 QuickAdd 的 inputPrompt 方法
            if ((window as any).pluto?.qa?.inputPrompt) {
                (window as any).pluto.qa.inputPrompt(message).then(resolve);
            } else {
                // 如果 QuickAdd 不可用，回退到原生的 prompt 方法
                const input = prompt(message);
                resolve(input);
            }
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

    // 导入文件到当前模块
    importFileToModule(bundle: MiniModule, editorContainer: HTMLElement) {
        // 创建文件选择对话框，支持多选，不限文件格式
        const input = document.createElement('input');
        input.type = 'file';
        // 移除文件格式限制，支持所有文件类型
        input.multiple = true; // 允许选择多个文件
        
        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const files = Array.from(target.files);
                let importedCount = 0;
                let failedCount = 0;
                
                // 遍历所有选中的文件
                for (const file of files) {
                    try {
                        // 确定文件类型
                        let type: string;
                        const lastDotIndex = file.name.lastIndexOf('.');
                        if (lastDotIndex > 0) {
                            type = file.name.substring(lastDotIndex + 1).toLowerCase();
                        } else {
                            // 如果没有扩展名，使用默认类型
                            type = 'text';
                        }
                        
                        // 根据文件类型选择读取方式
                        let content: string;
                        if (isImageFile(type)) {
                            // 图片文件使用 base64 编码
                            content = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    // 提取 base64 部分，去掉 data:image/xxx;base64, 前缀
                                    const result = reader.result as string;
                                    const commaIndex = result.indexOf(',');
                                    // 确保有逗号分隔符，否则使用空字符串
                                    const base64Part: string = commaIndex !== -1 ? result.substring(commaIndex + 1) : '';
                                    resolve(base64Part);
                                };
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            });
                        } else {
                            // 文本文件使用普通文本读取
                            content = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result as string);
                                reader.onerror = reject;
                                reader.readAsText(file);
                            });
                        }
                        
                        // 检查文件名是否已存在
                        if (bundle.files.some(f => f.name === file.name)) {
                            failedCount++;
                            continue; // 跳过已存在的文件
                        }
                        
                        // 创建新文件并添加到bundle
                        const newFile: ModFile = {
                            name: file.name,
                            type: type,
                            content: content
                        };
                        bundle.files.push(newFile);
                        importedCount++;
                    } catch (error) {
                        failedCount++;
                        console.error('File import failed:', error);
                    }
                }
                
                if (importedCount > 0) {
                    // 保存更改
                    await this.saveCurrentBundle(bundle);
                    
                    // 重新渲染文件侧边栏和编辑器
                    this.currentFileIndex = bundle.files.length - 1;
                    this.renderFileSidebar(this.contentEl.querySelector('.pluto-file-sidebar')!, bundle, editorContainer);
                    
                    // 重新渲染编辑器并选中最后导入的文件
                    this.currentEditor?.destroy();
                    const lastFile = bundle.files[this.currentFileIndex];
                    if (lastFile) {
                        this.renderCodeMirror(editorContainer, lastFile);
                    }
                    
                    new Notice(`${importedCount} ${t('pluto.hub.editor.files-imported')}${failedCount > 0 ? `, ${failedCount} ${t('pluto.hub.editor.files-failed')}` : ''}`);
                } else {
                    new Notice(t('pluto.hub.editor.no-files-imported'));
                }
            }
        };
        
        input.click();
    }
}