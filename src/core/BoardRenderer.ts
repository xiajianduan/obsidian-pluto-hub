import { ButtonComponent, Notice } from "obsidian";
import { ModStorage } from "storage";
import { readFileAsArrayBuffer } from "utils/helper";
import { t } from "utils/translation";
import { ModuleAction } from "./ModuleAction";
import PlutoHubPlugin from "main";
import { ViewResolver } from "./ViewResolver";

export class BoardRenderer {

    plugin: PlutoHubPlugin;
    contentEl: HTMLElement;
    resolver: ViewResolver;
    moduleAction: ModuleAction;
    private draggedModId: string | null = null;

    constructor(resolver: ViewResolver) {
        this.resolver = resolver;
        this.plugin = resolver.plugin;
        this.contentEl = resolver.contentEl;
        this.moduleAction = resolver.moduleAction;
    }
    
    /**
     * 渲染仪表盘界面，显示所有模块列表和搜索功能
     * @param el 渲染仪表盘的容器元素
     */
    render() {
        const header = this.contentEl.createDiv({ cls: 'pluto-header' });
        // 添加模块按钮
        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.add-module'))
            .setClass('btn_nob')
            .onClick(async () => {
                const promise = pluto.formManager.create({type: 'G'});
                promise.then(async (name) => {
                    await this.moduleAction.create(name);
                    this.resolver.borad();
                }).catch(e => {
                    console.log(e.message);
                    return;
                });

            });

        // 导入导出按钮
        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.import'))
            .setClass('btn_nob')
            .onClick(() => this.showImportDialog());

        // 导出所有按钮
        new ButtonComponent(header)
            .setButtonText(t('pluto.hub.dashboard.export-all'))
            .setClass('btn_nob')
            .onClick(async () => {
                pluto.formManager.prompt(t('pluto.hub.export.all-label'), true).then(async (name) => {
                    await this.showExportAllDialog(name);
                }).catch(e => {
                    new Notice(e.message);
                    return;
                });
            });

        // 搜索框 - 放在最右侧
        const searchContainer = header.createDiv({ cls: 'pluto-search-container' });
        const searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: t('pluto.hub.dashboard.search-placeholder'),
            cls: 'pluto-search-input'
        });

        const grid = this.contentEl.createDiv({ cls: 'pluto-grid' });

        // 初始渲染所有模块
        this.renderModules(grid);

        // 搜索框事件监听器
        searchInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.renderModules(grid, target.value.trim());
        });
    }

    /**
     * 渲染模块列表
     */
    async renderModules(grid: HTMLElement, filter?: string): Promise<void> {
        // 从存储中加载所有模块
        const allModules = await this.moduleAction.loadAll();
        let filteredModules = allModules;

        if (filter) {
            const lowerFilter = filter.toLowerCase();
            filteredModules = allModules.filter((mod: MiniModule) =>
                mod.name.toLowerCase().includes(lowerFilter)
            );
        }
        // 按 order 排序
        filteredModules.sort((a, b) => a.order - b.order);
        grid.empty();
        filteredModules.forEach((mod: MiniModule, index: number) => {
            const card = grid.createDiv({ cls: 'pluto-card' });
            
            // 添加拖拽功能
            card.draggable = true;
            card.dataset.modId = mod.id;
            card.dataset.modIndex = index.toString();

            // 检查bgUrl是否存在
            if (mod.bgUrl) {
                // 对于图片，使用背景图片样式
                const bgLayer = card.createDiv({ cls: 'card-bg' });
                bgLayer.style.backgroundImage = `url(${mod.bgUrl})`;
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
            const cboxEl = cardHeader.createDiv({ cls: 'checkbox-container' });
            cboxEl.createEl('input', { type: 'checkbox' });
            if(mod.enabled) cboxEl.classList.add('is-enabled');
            cboxEl.onclick = async (e) => {
                e.stopPropagation();
                if(mod.enabled) {
                    mod.enabled = false;
                    cboxEl.classList.remove('is-enabled');
                } else {
                    mod.enabled = true;
                    cboxEl.classList.add('is-enabled');
                }
                await ModStorage.saveModule(mod);
                if (mod.enabled) {
                    pluto.coreManager.runBundle(mod, true);
                    card.style.filter = '';
                } else {
                    // 如果模块被禁用，移除该模块的所有样式
                    document.querySelectorAll(`[id^="pluto-css-${mod.id}-"]`).forEach(el => el.remove());
                    // 从pluto.modules中移除该模块的导出
                    if (pluto.third.modules) {
                        delete pluto.third.modules[mod.name];
                    }
                    card.style.filter = 'grayscale(1)';
                }
            };
            // 删除按钮
            new ButtonComponent(cardHeader)
                .setIcon('trash')
                .setTooltip(t('pluto.hub.dashboard.delete-tooltip'))
                .setClass('mod-tooltip-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete ${mod.name}? This cannot be undone.`)) {
                        await this.moduleAction.delete(mod.id);
                        this.resolver.borad();
                    }
                });

            // 模块名称
            card.createDiv({ text: mod.name, cls: 'card-title' });

            // 模块操作按钮
            const cardActions = card.createDiv({ cls: 'card-actions' });

            // 编辑按钮
            new ButtonComponent(cardActions)
                .setIcon('pencil')
                .setTooltip(t('pluto.hub.dashboard.edit-tooltip'))
                .setClass('mod-tooltip-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    this.resolver.edit(mod.id);
                });
            // 导出按钮
            new ButtonComponent(cardActions)
                .setIcon('download')
                .setTooltip(t('pluto.hub.dashboard.export-tooltip'))
                .setClass('mod-tooltip-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    await this.moduleAction.export(mod.name);
                });
            // 设置按钮
            new ButtonComponent(cardActions)
                .setIcon('settings')
                .setTooltip(t('pluto.hub.dashboard.settings-tooltip'))
                .setClass('mod-tooltip-btn')
                .onClick(async (e) => {
                    e.stopPropagation();
                    const result = await pluto.formManager.openSetting(mod);
                    await this.moduleAction.save(result as unknown as MiniModule);
                    // 显示保存成功通知
                    new Notice(t('pluto.hub.editor.module-saved'));
                });

            // 点击卡片：切换到编辑状态
            // card.onClickEvent(() => {
            //     this.resolver.edit(mod.id);
            // });

            // 拖拽事件处理
            this.setupDragAndDrop(card, mod, allModules, filteredModules, grid);
        });
    }

    /**
     * 重新排列 DOM 元素而不重新渲染
     */
    private reorderCards(grid: HTMLElement, newOrder: MiniModule[]): void {
        // 创建模块 ID 到 DOM 元素的映射
        const cardMap = new Map<string, HTMLElement>();
        const cards = Array.from(grid.children) as HTMLElement[];
        cards.forEach(card => {
            const modId = card.dataset.modId;
            if (modId) {
                cardMap.set(modId, card);
            }
        });

        // 检查顺序是否真的改变了
        let orderChanged = false;
        const currentOrder = Array.from(grid.children).map(c => (c as HTMLElement).dataset.modId);
        const newOrderIds = newOrder.map(m => m.id);
        if (currentOrder.length !== newOrderIds.length || 
            currentOrder.some((id, idx) => id !== newOrderIds[idx])) {
            orderChanged = true;
        }

        if (!orderChanged) {
            return; // 顺序没有改变，不需要重新排列
        }

        // 启用过渡动画类
        grid.classList.add('reordering');
        
        // 使用双重 requestAnimationFrame 确保浏览器准备好渲染和样式应用
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 按照新顺序重新排列 DOM 元素
                // 使用 DocumentFragment 来批量操作，减少重排
                const fragment = document.createDocumentFragment();
                newOrder.forEach(mod => {
                    const card = cardMap.get(mod.id);
                    if (card) {
                        fragment.appendChild(card);
                    }
                });
                
                // 清空并重新添加（使用 fragment 可以减少重排）
                grid.empty();
                grid.appendChild(fragment);

                // 等待过渡完成后移除类
                setTimeout(() => {
                    grid.classList.remove('reordering');
                }, 300); // 与 CSS transition 时间匹配
            });
        });
    }

    /**
     * 设置拖拽功能
     */
    private setupDragAndDrop(card: HTMLElement, mod: MiniModule, allModules: MiniModule[], filteredModules: MiniModule[], grid: HTMLElement): void {
        // 拖拽开始
        card.addEventListener('dragstart', (e: DragEvent) => {
            // 如果拖拽目标是按钮或按钮的子元素，不触发拖拽
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('.mod-tooltip-btn') || target.closest('.checkbox-container')) {
                e.preventDefault();
                return;
            }
            
            this.draggedModId = mod.id;
            card.classList.add('dragging', 'selected');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', mod.id);
            }
        });

        // 拖拽结束
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging', 'selected');
            // 清除所有卡片的拖拽样式
            grid.querySelectorAll('.pluto-card').forEach(c => {
                c.classList.remove('drag-over', 'selected');
            });
            this.draggedModId = null;
        });

        // 拖拽悬停
        card.addEventListener('dragover', (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
            }
            
            if (this.draggedModId && this.draggedModId !== mod.id) {
                card.classList.add('drag-over');
            }
        });

        // 拖拽离开
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        // 放置
        card.addEventListener('drop', async (e: DragEvent) => {
            e.preventDefault();
            card.classList.remove('drag-over');

            if (!this.draggedModId || this.draggedModId === mod.id) {
                return;
            }

            // 找到被拖拽的模块
            const draggedMod = allModules.find(m => m.id === this.draggedModId);
            if (!draggedMod) {
                return;
            }

            // 使用所有模块（按 order 排序）来计算新的顺序
            const sortedAllModules = [...allModules].sort((a, b) => a.order - b.order);
            const targetIndex = sortedAllModules.findIndex(m => m.id === mod.id);
            const draggedIndex = sortedAllModules.findIndex(m => m.id === this.draggedModId);
            
            if (draggedIndex === -1 || targetIndex === -1) {
                return;
            }

            // 重新计算所有模块的 order
            // 从 sortedAllModules 中移除被拖拽的模块
            const modulesWithoutDragged = sortedAllModules.filter(m => m.id !== this.draggedModId);
            
            // 在目标位置插入被拖拽的模块
            modulesWithoutDragged.splice(targetIndex, 0, draggedMod);

            // 更新所有模块的 order
            modulesWithoutDragged.forEach((m, idx) => {
                m.order = idx;
            });

            // 获取当前显示的卡片（过滤后的模块）
            // 按照新的 order 重新排序过滤后的模块
            const filteredNewOrder = filteredModules
                .map(fm => {
                    const updatedMod = modulesWithoutDragged.find(m => m.id === fm.id);
                    return updatedMod || fm;
                })
                .sort((a, b) => {
                    const aOrder = modulesWithoutDragged.find(m => m.id === a.id)?.order ?? a.order;
                    const bOrder = modulesWithoutDragged.find(m => m.id === b.id)?.order ?? b.order;
                    return aOrder - bOrder;
                });

            // 直接重新排列 DOM 元素，不重新渲染
            this.reorderCards(grid, filteredNewOrder);

            // 异步保存所有受影响的模块（不阻塞 UI）
            setTimeout(async () => {
                for (const moduleToSave of modulesWithoutDragged) {
                    await ModStorage.saveModule(moduleToSave);
                }
            }, 0);
        });
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
                        const buffer = await readFileAsArrayBuffer(file);
                        // 导入模块
                        const modules = await ModStorage.importModule(buffer);
                        pluto.coreManager.runModules(modules, true);
                        new Notice(t('pluto.hub.import-success'));
                        this.resolver.borad();
                    } catch (e) {
                        console.error("Failed to import module:", e);
                        new Notice(t('pluto.hub.import-failure'));
                    }
                }
            }
        };

        input.click();
    }

    async showExportAllDialog(name: string) {
        // 使用配置中的备份目录
        const backupFolder = this.plugin.settings.backupFolderName;
        const backupFile = `${backupFolder}/${name}.ops`;
        await ModStorage.backupAllModules(backupFile);
        new Notice(t('pluto.hub.export.all-success') + backupFile);
    }
}