import { Notice } from "obsidian";

export default class ThemeManager {

    private styleEl: HTMLStyleElement;
    private DEFAULT_THEME = "sky-custom";

    private static themes = {
        "sky-custom": "自定样式",
        "sky-twilight": "暮光之城",
        "sky-midnight": "黑曜之夜",
        "sky-deep-abyss": "深海幽蓝",
        "sky-solar-flare": "旭日初升",
        "sky-parchment": "羊皮纸卷",
        "sky-forest-canopy": "森林树冠",
        "sky-autumn-maple": "枫林秋色",
        "sky-ocean-mist": "海雾迷蒙",
        "sky-cyberpunk": "赛博霓虹",
        "sky-monochrome": "黑白界限",
        "sky-lava-lamp": "熔岩灯影",
        "sky-nebula-dream": "星云幻梦"
    };
    
    constructor() {
        this.init();
    }

    init(): void {
        const theme = this.getCurrentTheme();
        document.body.classList.add(theme);
        // this.setCustomTheme(this.settings.styles);
    }

    getCurrentTheme() {
        return localStorage.getItem("theme") || this.DEFAULT_THEME;
    }

    static getThemes() {
        return ThemeManager.themes;
    }

    static changeTheme(oldTheme: string, newTheme: string) {
        document.body.classList.remove(oldTheme);
        document.body.classList.add(newTheme);
    }
    setCustomTheme(styles: string) {
        if (this.styleEl) document.head.removeChild(this.styleEl);
        this.styleEl = document.createElement("style");
        this.styleEl.textContent = `body.sky-custom { ${styles} }`;
        document.head.appendChild(this.styleEl);
    }
    static setVariable(variable: string, value: string) {
        document.body.style.setProperty(variable, value);
    }

    nextTheme() {
        // 获取所有可用的主题列表
        const themes = Object.keys(ThemeManager.themes);
        const currentTheme = this.getCurrentTheme();
        const currentIndex = themes.indexOf(currentTheme);
        // 计算下一个主题的索引（循环到开头如果到达末尾）
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex]!;
        // 移除旧主题类，添加新主题类
        document.body.classList.remove(currentTheme);
        document.body.classList.add(newTheme);
        // 更新设置中的当前主题
        localStorage.setItem("theme", newTheme);
        new Notice(ThemeManager.themes[newTheme as keyof typeof ThemeManager.themes]);
    }
}