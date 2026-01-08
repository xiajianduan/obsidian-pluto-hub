import { ButtonComponent, Notice } from "obsidian";
import { ModStorage } from "storage";
import { readFileAsArrayBuffer } from "utils/helper";
import { t } from "utils/translation";
import { ModuleAction } from "./ModuleAction";
import PlutoHubPlugin from "main";
import { CoreManager } from "exec/CoreManager";
import { ViewResolver } from "./ViewResolver";

export class BoardRenderer {

    plugin: PlutoHubPlugin;
    contentEl: HTMLElement;
    resolver: ViewResolver;
    moduleAction: ModuleAction;

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
                const promise = pluto.form.create({type: 'G'});
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
                pluto.form.prompt(t('pluto.hub.export.all-label'), true).then(async (name) => {
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
        grid.empty();

        // 从存储中加载所有模块
        const allModules = await this.moduleAction.loadAll();
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
                await ModStorage.saveModule(this.plugin, mod);
                if (mod.enabled) {
                    CoreManager.runBundle(mod, true);
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
                    const result = await pluto.form.openSetting(mod);
                    await this.moduleAction.save(result as unknown as MiniModule);
                });

            // 点击卡片：切换到编辑状态
            // card.onClickEvent(() => {
            //     this.resolver.edit(mod.id);
            // });
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
                        const modules = await ModStorage.importModule(this.plugin, buffer);
                        CoreManager.runModules(modules, true);
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
        await ModStorage.backupAllModules(this.plugin, backupFile);
        new Notice(t('pluto.hub.export.all-success') + backupFile);
    }
}