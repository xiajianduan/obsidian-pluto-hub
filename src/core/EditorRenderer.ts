import { MirrorRenderer } from "core/MirrorRenderer";
import { ModuleAction } from "core/ModuleAction";
import { ButtonComponent, Notice } from "obsidian";
import { MiniModule, ModFile } from "types/pluto";
import { base64ToBlob, isImageFile, promptMessage, readFileAsBase64, readFileAsText } from "utils/helper";
import { t } from "utils/translation";
import { EditorView } from '@codemirror/view';
import PlutoHubPlugin from "main";
import { ViewResolver } from "./ViewResolver";

export const VIEW_TYPE_EDITOR = "pluto-editor-view";

export class EditorRenderer {

    state: Record<string, any>;
    mirrorRenderer: MirrorRenderer;
    currentEditor: EditorView | null = null;
    currentFileIndex: number = 0;
    plugin: PlutoHubPlugin;
    resolver: ViewResolver;
    moduleAction: ModuleAction;

    constructor(resolver: ViewResolver) {
        this.resolver = resolver;
        this.mirrorRenderer = new MirrorRenderer();
        this.plugin = resolver.plugin;
        this.moduleAction = resolver.moduleAction;
    }

    // --- 2. 编辑器界面 (基于 ModuleBundle 内容) ---
    /**
     * 渲染编辑器界面，包括文件侧边栏和代码编辑器
     */
    async render(el: HTMLElement) {
        if (!this.resolver.currentModId) return;

        // 从存储中加载所有模块，查找当前模块
        const allModules = await this.moduleAction.loadAll();
        const module = allModules.find(m => m.id === this.resolver.currentModId);
        if (!module) return;

        // 1. 创建导航栏
        const nav = el.createDiv({ cls: 'pluto-editor-nav' });

        // 返回按钮
        new ButtonComponent(nav)
            .setIcon("arrow-left")
            .setTooltip(t('pluto.hub.editor.back-to-dashboard'))
            .onClick(() => {
                this.resolver.isEditing = false;
                this.currentEditor?.destroy();
                this.currentEditor = null;
                this.resolver.render();
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
        const editorContainer = editorLayout.createDiv({ cls: 'pluto-cm-editor markdown-source-view cm-s-obsidian mod-cm6 node-insert-event' });

        // 新建文件按钮（移到导航栏）
        const addFileBtn = new ButtonComponent(nav)
            .setButtonText(t('pluto.hub.editor.add-file'))
            .setClass("btn_nob")
            .onClick(async () => {
                try {
                    const name = await promptMessage(t('pluto.hub.file-name-prompt'));
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
            .onClick(() => this.importFile(module, editorContainer, el));

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
                    // 保存当前文件内容
                    this.saveCurrentEditorContent(module);
                    await this.moduleAction.save(module);
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
                    await this.moduleAction.delete(module.id);
                    this.resolver.isEditing = false;
                    this.currentEditor?.destroy();
                    this.currentEditor = null;
                    this.resolver.render();
                }
            });

        // 4. 渲染文件侧边栏
        this.renderFileSidebar(fileSidebar, module, editorContainer);

        // 5. 渲染编辑器 - 确保currentFileIndex有效
        this.currentFileIndex = Math.min(this.currentFileIndex, module.files.length - 1);
        const currentFile = this.getCurrentFile(module);
        if (currentFile) {
            this.mirrorRenderer.render(editorContainer, currentFile);
        }
    }

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
     * 保存当前编辑器中的内容到文件
     */
    saveCurrentEditorContent(bundle: MiniModule): void {
        const currentFile = this.getCurrentFile(bundle);
        if (this.currentEditor && currentFile) {
            currentFile.content = this.currentEditor.state.doc.toString();
        }
    }

    // 导出模块中的所有文件到配置的备份目录
    async exportFilesToFolder(module: MiniModule) {
        try {
            // 获取模块信息
            const allModules = await this.moduleAction.loadAll();
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

    // 渲染文件侧边栏
    renderFileSidebar(sidebarEl: HTMLElement, module: MiniModule, editorContainer: HTMLElement) {
        sidebarEl.empty();

        module.files.forEach((file, index) => {
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
                const currentFile = this.getCurrentFile(module);
                if (this.currentEditor && currentFile) {
                    currentFile.content = this.currentEditor.state.doc.toString();
                }

                // 切换文件
                this.currentFileIndex = index;
                this.renderFileSidebar(sidebarEl, module, editorContainer);

                // 重新渲染编辑器
                this.currentEditor?.destroy();
                this.currentEditor = null; // 清除当前编辑器引用，避免影响图片预览
                this.mirrorRenderer.render(editorContainer, file);
            };

            // 删除按钮点击事件
            deleteBtn.onclick = async (e) => {
                e.stopPropagation(); // 阻止事件冒泡

                // 如果只有一个文件，不允许删除
                if (module.files.length <= 1) {
                    new Notice(t('pluto.hub.editor.cannot-delete-last-file'));
                    return;
                }

                // 确认删除
                if (!confirm(t('pluto.hub.editor.confirm-delete-file').replace('{filename}', file.name))) {
                    return;
                }

                // 保存当前文件内容
                const currentFile = this.getCurrentFile(module);
                if (this.currentEditor && currentFile) {
                    currentFile.content = this.currentEditor.state.doc.toString();
                }

                // 删除文件
                module.files.splice(index, 1);

                // 更新当前文件索引
                if (this.currentFileIndex >= index && this.currentFileIndex > 0) {
                    this.currentFileIndex--;
                }

                // 重新渲染文件列表
                this.renderFileSidebar(sidebarEl, module, editorContainer);

                // 重新渲染编辑器
                this.currentEditor?.destroy();
                const fileToRender = module.files[this.currentFileIndex];
                if (fileToRender) {
                    this.mirrorRenderer.render(editorContainer, fileToRender);
                } else if (module.files.length > 0) {
                    // 确保至少渲染一个文件
                    const firstFile = module.files[0];
                    if (firstFile) {
                        this.mirrorRenderer.render(editorContainer, firstFile);
                    }
                }
            };
        });
    }

    // 导入文件到当前模块
    importFile(bundle: MiniModule, editorContainer: HTMLElement, el: HTMLElement) {
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
                            content = await readFileAsBase64(file);
                        } else {
                            // 文本文件使用普通文本读取
                            content = await readFileAsText(file);
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
                    await this.moduleAction.save(bundle);

                    // 重新渲染文件侧边栏和编辑器
                    this.currentFileIndex = bundle.files.length - 1;
                    this.renderFileSidebar(el.querySelector('.pluto-file-sidebar')!, bundle, editorContainer);

                    // 重新渲染编辑器并选中最后导入的文件
                    this.currentEditor?.destroy();
                    const lastFile = bundle.files[this.currentFileIndex];
                    if (lastFile) {
                        this.mirrorRenderer.render(editorContainer, lastFile);
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