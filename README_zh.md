**[English](./README.md)** | **中文**

# Pluto Hub - Obsidian 代码模块商城

Pluto Hub 是一款强大的插件，允许用户管理、编辑和运行本地代码模块，提供了丰富的扩展能力。

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/releases)
[![GitHub stars](https://img.shields.io/github/stars/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/issues)
[![license](https://img.shields.io/github/license/xiajianduan/obsidian-pluto-hub?style=flat-square)](LICENSE)

## 📚 示例仓库

想查看 Pluto Hub 的实际效果？请访问示例仓库：

[![示例仓库](https://img.shields.io/badge/示例仓库-GitHub-blue?style=flat-square)](https://github.com/xiajianduan/pluto-hub-vault)

## 功能特性

### 🎨 预览功能
<img src="./assets/pluto.webp" alt="界面预览" width="600">

### 📦 模块管理
- Grid 卡片布局：美观的模块展示界面，支持自定义主题色
- 拖拽排序：支持直观调整模块顺序
- 启用/禁用控制：灵活控制模块的运行状态
- 导入/导出功能：支持单个模块或全量模块的备份与恢复
- 批量导入导出：支持一次性导入多个文件或导出多个模块

### 💻 代码编辑器
- CodeMirror 6 集成：支持 JS、CSS、JSON、YAML、Markdown 等多种格式的语法高亮
- 多文件支持：每个模块可以包含多个文件
- 实时编辑：修改后立即生效
- Obsidian 原生样式：使用 Obsidian 官方 CSS 变量，保持视觉一致性

### 🌟 主题系统
- 多种主题支持：内置多种主题风格
- 自定义主题：支持自定义主题配置
- 主题管理器：统一管理主题设置

### 📝 动态表单
- 表单配置：支持通过 JSON 配置动态表单
- 表单字段：支持文本、下拉、复选框等多种字段类型
- 表单验证：支持必填项验证

### 🌐 全局挂载
- pluto 对象：所有模块的输出都挂载到 `window.pluto` 全局对象
- 配置管理：JSON 和 YAML 配置文件自动解析
- CSS 注入：模块中的 CSS 自动注入到文档头部

### 🤝 依赖管理
- 第三方插件集成：自动检测并映射第三方插件依赖
- 动态依赖绑定：支持 React Components、Templater、Dataview、DVA、QA 等插件的依赖管理

### 📁 多种文件类型支持

| 类型 | 扩展名 | 说明 |
|------|--------|------|
| JavaScript | `.js` | 沙箱执行，支持模块导出 |
| CSS | `.css` | 自动注入到文档头部 |
| JSON | `.json` | 配置解析 |
| YAML | `.yaml` / `.yml` | 配置解析 |
| Markdown | `.md` | 内容渲染 |
| 图片 | `.jpg` / `.gif` / `.png` | 图片处理 |
| GLB | `.glb` | 3D 模型支持 |
| Page | `.page` | 页面组件 |

## 安装方法

### 社区插件市场安装

1. 打开 Obsidian 设置
2. 进入「社区插件」
3. 搜索「Pluto Hub」
4. 点击「安装」
5. 启用插件

### 手动安装

1. 下载最新版本文件：`main.js`、`styles.css`、`manifest.json`
2. 复制到你的 Obsidian 库插件目录：`<Vault>/.obsidian/plugins/obsidian-pluto-hub/`
3. 重启 Obsidian
4. 在设置中启用插件

## 快速开始

### 创建第一个模块

1. 点击左侧边栏的 Pluto Hub 图标打开仪表盘
2. 点击「Add Module」按钮
3. 输入模块名称，如「My First Module」
4. 点击模块卡片进入编辑器
5. 在 `main.js` 中输入代码：

```javascript
function hello() {
    console.log('Hello from Pluto Hub!');
    return 'Hello Pluto!';
}
```

6. 点击「Save all changes」保存

### 使用动态表单

```javascript
await pluto.formManager.openJson({
    title: "用户信息",
    fields: [{
        name: "name", label: "姓名", required: true, input: { type: 'text', hidden: false }
    }]
});
```

## 模块定义

### JavaScript 模块

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

### CSS 模块

```css
.my-custom-class {
    color: var(--interactive-accent);
    font-weight: bold;
}
```

### JSON 配置

```json
{
    "apiKey": "your-api-key",
    "baseUrl": "https://api.example.com",
    "settings": {
        "autoSave": true,
        "theme": "light"
    }
}
```

### YAML 配置

```yaml
apiKey: your-api-key
baseUrl: https://api.example.com
settings:
  autoSave: true
  theme: light
```

## Pluto 对象

### 核心属性

| 属性 | 说明 |
|------|------|
| `pluto.app` | Obsidian 应用实例 |
| `pluto.self` | Pluto Hub 插件实例 |
| `pluto.coreManager` | 核心管理器，负责运行模块 |
| `pluto.viewManager` | 视图管理器 |
| `pluto.formManager` | 表单管理器 |
| `pluto.themeManager` | 主题管理器 |
| `pluto.configManager` | 配置管理器 |
| `pluto.third` | 第三方组件 |
| `pluto.images` | 图片转换器 |
| `pluto.helper` | 辅助工具函数 |

### 核心方法

- `pluto.getModule(name)` - 获取指定名称的模块
- `pluto.registerModule(name, exports)` - 注册模块
- `pluto.importJs(path)` - 动态导入 JavaScript 文件

## 与其他插件的集成

如果安装了以下插件，本插件会提供额外的可编程接口：

- **React Components**：可通过 `pluto.third.react` 访问
- **Templater**：可通过 `pluto.third.templater` 访问
- **Dataview**：可通过 `pluto.third.dva` 访问

## 如何使用扩展模块

Pluto Hub 支持通过导入外部模块来扩展功能。

1. 从可信来源获取模块文件（扩展名为 `.ops`）
2. 在插件设置中**自定义存储路径**（默认为 `.obsidian/cache/modules`）
3. 将 `.ops` 模块文件放入该目录
4. 返回插件界面，模块会自动加载并生效

> ⚠️ 请仅导入您信任来源的模块。本插件不对第三方模块的安全性负责，用户需自行承担风险。

## 故障排除

### 模块无法运行
1. 检查模块是否已启用
2. 查看浏览器控制台错误信息
3. 确保代码语法正确
4. 检查第三方插件依赖是否正确安装

### 导入失败
1. 检查文件格式是否正确
2. 确保文件没有损坏
3. 查看浏览器控制台错误信息

### 性能问题
1. 禁用不需要的模块
2. 优化代码，避免长时间运行的函数
3. 减少模块数量

## 版本历史

详细更新日志请查看 [CHANGES.md](./CHANGES.md)。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 支持作者

如果你觉得这个插件对你有帮助，可以请作者喝杯咖啡：

Support @mzs:
<a href="https://buymeacoffee.com/1553599299u" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 175px !important;" ></a>

### 支付宝赞助

<img src="assets/fund1.png" alt="支付宝" width="150"/>

### 微信赞助

<img src="assets/fund2.png" alt="微信" width="150"/>

### 其他方式

- 邮箱： xiajianduan@outlook.com
- 邮箱： xiajianduan@qq.com

---

## 许可证

[0-BSD License](./LICENSE)

## 联系方式

- GitHub Issues: [https://github.com/xiajianduan/obsidian-pluto-hub/issues](https://github.com/xiajianduan/obsidian-pluto-hub/issues)

---

**享受 Pluto Hub 带来的强大扩展能力！** 🚀