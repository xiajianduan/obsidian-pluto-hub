**[English](./README.md)** | **[中文](./README_zh.md)**

# Pluto Hub - Obsidian Code Snippet Marketplace

Pluto Hub is a powerful Obsidian plugin that allows users to manage, edit, and run local code modules, providing rich extensibility for Obsidian.

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/releases)
[![GitHub stars](https://img.shields.io/github/stars/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/issues)
[![license](https://img.shields.io/github/license/xiajianduan/obsidian-pluto-hub?style=flat-square)](LICENSE)

## Features

### 🎨 Preview
<img src="./assets/pluto.webp" alt="Interface Preview" width="600">

### 🛠 Custom Modules
|Module Icon|Module Name|Module Description|Module Preview|
|--|--|--|--
|<img src="./assets/module/默认皮肤.png" alt="Default Skin" width="40">|Default Skin|`pluto.themeManager.nextTheme()`|<img src="./assets/skin/熔岩灯影.webp" alt="Lava Lamp Preview" width="200">|
|<img src="./assets/module/主页冥王.png" alt="Home Pluto" width="40">|Home Pluto|`right.page` `home.page`|<img src="./assets/sample/主页冥王.webp" alt="Home Pluto Preview" width="200">|
|<img src="./assets/module/主题小猫.png" alt="Theme Cat" width="40">|Theme Cat|Switches cats based on time, component`jsx:<AnimationCute/>`|<img src="./assets/sample/主题小猫.webp" alt="Theme Cat Preview" width="80">|
|<img src="./assets/module/模块工具.png" alt="Module Tools" width="40">|Module Tools|Basic tools|/|
|<img src="./assets/module/模块核心.png" alt="Module Core" width="40">|Module Core|Module core functionality|/|
|<img src="./assets/module/模块功能.png" alt="Module Functions" width="40">|Module Functions|Custom functions|/|
|<img src="./assets/module/配置规则.png" alt="Config Rules" width="40">|Config Rules|Configuration rules management|/|
|<img src="./assets/module/启动插件.png" alt="Start Plugins" width="40">|Start Plugins|Plugins|/|
|<img src="./assets/module/插件配置.png" alt="Plugin Config" width="40">|Plugin Config|/|/|
|<img src="./assets/module/配置皮肤.png" alt="Config Skin" width="40">|Config Skin|/|/|
|<img src="./assets/module/配置补全.png" alt="Config Complete" width="40">|Config Complete|/|/|
|<img src="./assets/module/配置表格.png" alt="Config Table" width="40">|Config Table|/|/|
|<img src="./assets/module/定制属性.png" alt="Custom Properties" width="40">|Custom Properties|/|/|
|<img src="./assets/module/定制注脚.png" alt="Custom Footnotes" width="40">|Custom Footnotes|/|/|
|<img src="./assets/module/定制选项.png" alt="Custom Options" width="40">|Custom Options|/|/|
|<img src="./assets/module/定制预览.png" alt="Custom Preview" width="40">|Custom Preview|/|/|
|<img src="./assets/module/控件太极.png" alt="Control Taiji" width="40">|Control Taiji|/|/|
|<img src="./assets/module/控件按钮.png" alt="Control Button" width="40">|Control Button|/|/|
|<img src="./assets/module/控件时钟.png" alt="Control Clock" width="40">|Control Clock|/|/|
|<img src="./assets/module/控件模型.png" alt="Control Model" width="40">|Control Model|/|/|
|<img src="./assets/module/控件画廊.png" alt="Control Gallery" width="40">|Control Gallery|/|/|
|<img src="./assets/module/控件皮肤.png" alt="Control Skin" width="40">|Control Skin|/|/|
|<img src="./assets/module/控件窗口.png" alt="Control Window" width="40">|Control Window|/|/|
|<img src="./assets/module/控件经络.png" alt="Control Meridian" width="40">|Control Meridian|/|/|
|<img src="./assets/module/控件音乐.png" alt="Control Music" width="40">|Control Music|/|/|
|<img src="./assets/module/样式个人.png" alt="Style Personal" width="40">|Style Personal|/|/|
|<img src="./assets/module/样式代码.png" alt="Style Code" width="40">|Style Code|/|/|
|<img src="./assets/module/样式彩虹.png" alt="Style Rainbow" width="40">|Style Rainbow|/|/|
|<img src="./assets/module/样式按钮.png" alt="Style Button" width="40">|Style Button|/|/|
|<img src="./assets/module/样式标注.png" alt="Style Label" width="40">|Style Label|/|/|
|<img src="./assets/module/菜单命令.png" alt="Menu Command" width="40">|Menu Command|/|/|
|<img src="./assets/module/菜单下载.png" alt="Menu Download" width="40">|Menu Download|/|/|


### 📦 Module Management
- Grid card layout: Beautiful module display interface with custom theme colors
- Drag-and-drop sorting: Intuitive module order adjustment
- Enable/disable control: Flexible module running state control
- Import/export functionality: Single module or full backup and restore
- Batch import/export: Import multiple files or export multiple modules at once

### 💻 Code Editor
- CodeMirror 6 integration: Syntax highlighting for JS, CSS, JSON, YAML, Markdown and more
- Multi-file support: Each module can contain multiple files
- Real-time editing: Changes take effect immediately
- Obsidian native style: Uses official Obsidian CSS variables for visual consistency

### 🌟 Theme System
- Multiple theme support: Built-in various theme styles
- Custom themes: Custom theme configuration support
- Theme manager: Unified theme settings management

### 📝 Dynamic Forms
- Form configuration: Dynamic form configuration via JSON
- Form fields: Support for text, dropdown, checkbox and other field types
- Form validation: Required field validation support

### 🌐 Global Mount
- pluto object: All module outputs are mounted to `window.pluto` global object
- Configuration management: JSON and YAML configuration files are automatically parsed
- CSS injection: Module CSS is automatically injected into document head

### 🤝 Dependency Management
- Third-party plugin integration: Automatic detection and mapping of third-party plugin dependencies
- Dynamic dependency binding: Support for React Components, Templater, Dataview, DVA, QA plugins

### 📁 Multiple File Type Support

| Type | Extension | Description |
|------|-----------|-------------|
| JavaScript | `.js` | Sandbox execution, module export support |
| CSS | `.css` | Automatic injection into document head |
| JSON | `.json` | Configuration parsing |
| YAML | `.yaml` / `.yml` | Configuration parsing |
| Markdown | `.md` | Content rendering |
| Image | `.jpg` / `.gif` / `.png` | Image processing |
| GLB | `.glb` | 3D model support |
| Page | `.page` | Page component |

## Installation

### Install from Community Plugins

1. Open Obsidian Settings
2. Go to "Community Plugins"
3. Search for "Pluto Hub"
4. Click "Install"
5. Enable the plugin

### Manual Installation

1. Download the latest version files: `main.js`, `styles.css`, `manifest.json`
2. Copy to your Obsidian vault plugin directory: `<Vault>/.obsidian/plugins/obsidian-pluto-hub/`
3. Restart Obsidian
4. Enable the plugin in Settings

## Quick Start

### Create Your First Module

1. Click the Pluto Hub icon in the left sidebar to open the dashboard
2. Click the "Add Module" button
3. Enter a module name, like "My First Module"
4. Click the module card to enter the editor
5. Enter code in `main.js`:

```javascript
return {
    hello: function() {
        console.log('Hello from Pluto Hub!');
        return 'Hello Pluto!';
    }
};
```

6. Click "Save all changes" to save

### Use Modules

```javascript
pluto["My First Module"].hello();
// Outputs "Hello from Pluto Hub!" and returns "Hello Pluto!"
```

### Use Dynamic Forms

```javascript
await pluto.formManager.openForm({
    title: "My Form",
    fields: [
        { id: "name", type: "text", label: "Name", required: true },
        { id: "age", type: "number", label: "Age" },
        { id: "gender", type: "select", label: "Gender", options: ["Male", "Female", "Other"] }
    ]
});
```

## Module Definition

### JavaScript Module

```javascript
return {
    greet: function(name) {
        return `Hello, ${name}!`;
    },
    version: "1.0.0",
    config: {
        theme: "dark",
        fontSize: 16
    }
};
```

### CSS Module

```css
.my-custom-class {
    color: var(--interactive-accent);
    font-weight: bold;
}

.note-card {
    background-color: var(--background-secondary);
    border-radius: var(--radius-s);
    padding: var(--size-4);
}
```

### JSON Configuration

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

### YAML Configuration

```yaml
apiKey: your-api-key
baseUrl: https://api.example.com
settings:
  autoSave: true
  theme: light
```

## Pluto Object

### Core Properties

| Property | Description |
|----------|-------------|
| `pluto.app` | Obsidian app instance |
| `pluto.self` | Pluto Hub plugin instance |
| `pluto.coreManager` | Core manager, responsible for running modules |
| `pluto.viewManager` | View manager |
| `pluto.formManager` | Form manager |
| `pluto.themeManager` | Theme manager |
| `pluto.configManager` | Configuration manager |
| `pluto.third` | Third-party components |
| `pluto.images` | Image converter |
| `pluto.helper` | Helper utility functions |

### Core Methods

- `pluto.getModule(name)` - Get module by name
- `pluto.registerModule(name, exports)` - Register a module
- `pluto.importJs(path)` - Dynamically import JavaScript files

### Third-Party Plugin Mapping

| Plugin | Pluto Object Path |
|--------|------------------|
| React Components | `pluto.third.react` |
| Templater | `pluto.third.templater` |
| Dataview | `pluto.third.dv` |
| DVA | `pluto.third.dva` |
| QA | `pluto.third.qa` |
| Simple Component | `pluto.third.simple` |

## Project Structure

```
src/
├── main.ts                # Plugin main entry
├── pluto.ts               # Pluto core functionality
├── settings.ts             # Plugin settings
├── storage.ts              # Storage management
├── core/                  # Core modules
│   ├── BoardRenderer.ts   # Board renderer
│   ├── EditorRenderer.ts  # Editor renderer
│   ├── ImageConverter.ts  # Image converter
│   ├── MirrorRenderer.ts  # Mirror renderer
│   ├── ModuleAction.ts    # Module action manager
│   ├── PluginContext.ts   # Plugin context
│   └── ViewResolver.ts    # View resolver
├── manager/               # Managers
│   ├── ConfigManager.ts   # Configuration manager
│   ├── CoreManager.ts     # Core manager
│   ├── FormManager.ts     # Form manager
│   ├── ThemeManager.ts    # Theme manager
│   └── ViewManager.ts     # View manager
├── exec/                   # Executors
│   ├── CssExecutor.ts     # CSS executor
│   ├── GlbExecutor.ts     # GLB executor
│   ├── ImageExecutor.ts   # Image executor
│   ├── JsonExecutor.ts    # JSON executor
│   ├── MarkdownExecutor.ts # Markdown executor
│   ├── PageExecutor.ts    # Page executor
│   ├── SandboxExecutor.ts # Sandbox executor
│   ├── SimpleExecutor.ts  # Simple executor
│   └── YamlExecutor.ts    # YAML executor
├── modal/                 # Modal components
│   ├── FormField.tsx      # Form field component
│   ├── FormJson.ts        # Form JSON handler
│   ├── FormModal.tsx      # React form modal
│   └── PlutoFormModal.tsx # Pluto form modal
├── i18n/                  # Internationalization
│   ├── en.ts              # English translations
│   └── zh-cn.ts           # Chinese translations
├── third/                 # Third-party components
│   ├── DvaComponent.ts    # DVA component
│   ├── QaComponent.ts     # QA component
│   ├── ReactComponent.ts  # React component
│   ├── SimpleComponent.ts # Simple component
│   ├── TemplaterComponent.ts # Templater component
│   └── ThirdFactory.ts    # Third-party component factory
├── types/                 # TypeScript type definitions
│   ├── form.d.ts          # Form types
│   ├── global.d.ts        # Global types
│   └── obsidian.d.ts      # Obsidian types
├── utils/                 # Utility functions
│   ├── array.ts           # Array utilities
│   ├── const.ts           # Constants
│   ├── helper.ts          # Helper functions
│   └── translation.ts     # Translation utilities
└── view/                  # View components
    ├── PlutoBoardView.ts  # Board view
    ├── PlutoFileView.ts   # File view
    └── PlutoTextView.ts   # Text view
```

## Development Guide

### Environment Setup

- Node.js 16+
- npm or yarn

### Build Process

```bash
# Clone repository
git clone https://github.com/xiajianduan/obsidian-pluto-hub.git

# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Code linting
npm run lint
```

## Advanced Usage

### Module Communication

```javascript
// Module A
export const sharedData = { value: 42 };

// Module B
console.log(pluto["Module A"].sharedData.value);
pluto["Module A"].sharedData.value = 100;
```

### Dynamic Resource Loading

```javascript
// Load external script
const script = document.createElement('script');
script.src = 'https://cdn.example.com/library.js';
document.head.appendChild(script);

// Load external stylesheet
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.example.com/styles.css';
document.head.appendChild(link);
```

### Using Forms

```javascript
const result = await pluto.formManager.openForm({
    title: "User Info",
    fields: [
        { id: "username", type: "text", label: "Username", required: true },
        { id: "email", type: "text", label: "Email" },
        { id: "age", type: "number", label: "Age" },
        { id: "newsletter", type: "checkbox", label: "Subscribe to newsletter" }
    ]
});

if (result) {
    console.log("User info:", result);
}
```

## Using External Modules

Pluto Hub supports extending functionality by importing external modules.

1. Obtain module files from trusted sources (with `.ops` extension)
2. In plugin settings, **customize the storage path** (default is `.obsidian/cache/modules`)
3. Place `.ops` module files in that directory
4. Return to the plugin interface, modules will be automatically loaded and take effect

> ⚠️ Please only import modules from trusted sources. This plugin is not responsible for the security of third-party modules, and users assume their own risk.

## Troubleshooting

### Module Not Running
1. Check if the module is enabled
2. Check browser console for error messages
3. Ensure code syntax is correct
4. Check if third-party plugin dependencies are correctly installed

### Import Failed
1. Check if file format is correct
2. Ensure files are not corrupted
3. Check browser console for error messages

### Performance Issues
1. Disable unused modules
2. Optimize code, avoid long-running functions
3. Reduce number of modules

## Version History

For detailed changelog, please see [CHANGES.md](./CHANGES.md).

## Contributing

Issues and Pull Requests are welcome!

## Support the Author

If you find this plugin helpful, you can buy the author a coffee:

Support @mzs:
<a href="https://buymeacoffee.com/1553599299u" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 175px !important;" ></a>

### Alipay Donation

<img src="assets/fund1.png" alt="Alipay" width="200"/>

### WeChat Donation

<img src="assets/fund2.png" alt="WeChat" width="200"/>

### Other Methods

- Email: xiajianduan@outlook.com
- Email: xiajianduan@qq.com

---

## License

[0-BSD License](./LICENSE)

## Contact

- GitHub Issues: [https://github.com/xiajianduan/obsidian-pluto-hub/issues](https://github.com/xiajianduan/obsidian-pluto-hub/issues)

---

**Enjoy the powerful extensibility of Pluto Hub!** 🚀