**English** | **[中文](./README_zh.md)**

# Pluto Hub - Obsidian Code Module Marketplace

Pluto Hub is a powerful plugin that allows users to manage, edit, and run local code modules, providing rich extensibility.

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/releases)
[![GitHub stars](https://img.shields.io/github/stars/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/issues)
[![license](https://img.shields.io/github/license/xiajianduan/obsidian-pluto-hub?style=flat-square)](LICENSE)

## 📚 Example Vault

Want to see Pluto Hub in action? Check out the example vault:

[![Example Vault](https://img.shields.io/badge/Example%20Vault-GitHub-blue?style=flat-square)](https://github.com/xiajianduan/pluto-hub-vault)

## Features

### 🎨 Preview
<img src="./assets/pluto.webp" alt="Interface Preview" width="600">

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
2. Copy to your Obsidian vault plugin directory: `<Vault>/.obsidian/plugins/pluto-hub/`
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
function hello() {
    console.log('Hello from Pluto Hub!');
    return 'Hello Pluto!';
}
```

6. Click "Save all changes" to save

### Use Dynamic Forms

```javascript
await pluto.formManager.openJson({
    title: "My Form",
    fields: [{
        name: "name", label: "Name", required: true, input: { type: 'text', hidden: false }
    }]
});
```

## Module Definition

### JavaScript Module

```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

### CSS Module

```css
.my-custom-class {
    color: var(--interactive-accent);
    font-weight: bold;
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
## Integration with Other Plugins

If the following plugins are installed, this plugin provides additional programmable interfaces:

- **React Components**: Accessible via `pluto.third.react`
- **Templater**: Accessible via `pluto.third.templater`
- **Dataview**: Accessible via `pluto.third.dva`

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

<img src="assets/fund1.png" alt="Alipay" width="150"/>

### WeChat Donation

<img src="assets/fund2.png" alt="WeChat" width="150"/>

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