**[中文](./README.md)** | **English**

# Pluto Hub - Obsidian Lightweight Module Management Center

Pluto Hub is a lightweight code module center designed to enhance Obsidian runtime performance and extension experience. It helps non-technical users and developers run and maintain local lightweight code extensions safely and intuitively through decoupled `.ops` configuration packages, without compromising vault note purity or slowing down system startup.

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/releases)
[![GitHub stars](https://img.shields.io/github/stars/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/xiajianduan/obsidian-pluto-hub?style=flat-square)](https://github.com/xiajianduan/obsidian-pluto-hub/issues)
[![license](https://img.shields.io/github/license/xiajianduan/obsidian-pluto-hub?style=flat-square)](LICENSE)

<div align="center">
  <img src="./assets/pluto.webp" alt="Interface preview" width="550">
  <br>
  <em>Full interface screenshot</em>
</div>

## 🎯 Why Pluto Hub? (For the Obsidian Community & Official Dev Team)

As deep Obsidian enthusiasts and independent developers, we've noticed that with the explosion of the community ecosystem, heavy knowledge management users and the official team are jointly facing three irreconcilable ecological architecture pain points:

1. **"Micro Widget" Development Gap**: Users often only need some extremely localized lightweight functionality. Requiring average users to configure complex environments and write community plugins is overly burdensome; embedding lengthy JavaScript rendering code directly in `.md` notes using dataviewjs or templater causes severe separation between note content and presentation logic, making it difficult for ordinary people to maintain.

2. **Heavy Dependency Startup Performance Trap (Startup Time Penalty)**: To pile up various Dashboard components, users typically need to enable 20-40 different community plugins simultaneously. This causes serious lag and white-screen delay during Obsidian's initial runtime. The official team currently lacks an elegant standard mechanism for on-demand lazy activation of "non-essential visual components."

3. **Multi-Device Sync Configuration Nightmares (Configuration Conflicts)**: Users who习惯了使用 Git or third-party cloud storage for multi-device sync (like mobile and PC) frequently encounter恶性代码覆盖或路径冲突 where different plugins' data.json files overwrite each other, causing the entire local configuration vault to frequently report errors.

Pluto Hub was born as a lightweight solution to fill these three "ecological gray areas." It doesn't undermine existing official sovereignty but provides a unified isolation container, achieving high-performance decoupling where "code belongs to code, content belongs to content."

## 🎨 Preview
<div align="center">
  <img src="./assets/flush.gif" alt="Refresh plugin demo" width="550">
  <br>
  <em>Refresh plugin in action</em>
</div>

<div align="center">
  <img src="./assets/functions.gif" alt="Feature overview demo" width="550">
  <br>
  <em>Core features demonstration</em>
</div>

## 📚 Example Vault
Want to see Pluto Hub in action? Check out the example vault:

[![Example Vault](https://img.shields.io/badge/Example%20Vault-GitHub-blue?style=flat-square)](https://github.com/xiajianduan/pluto-hub-vault)

### 📊 Pluto Hub Core Features & Extension Mechanism Audit

To ensure the plugin fully complies with the community's strictest security and runtime performance specifications, Pluto Hub adopts a unified lightweight sandbox container logic, with the core framework providing low-level native support for various advanced extension modules:

| Feature Module | Core Pain Points Addressed | Local Runtime Mechanism & User Experience | Extension Status |
| :--- | :--- | :--- | :--- |
| **⏱️ Runtime Lifecycle Control** | Solves the performance trap where heavy users enabling many Dashboard plugins slow down Obsidian's initial loading and cause white-screen delays. | Provides a global console supporting four levels of on-demand async activation: `[ 0 delay / 2s delay / 4s long delay / Off ]`. | 📦 **Built-in (Example Vault)** <img src="./assets/modules/启动插件.gif" alt="刷新插件" width="250">|
| **🎨 Modular Grid Card Container** | Prevents embedding awkward JS rendering code in plain `.md` notes. Deep integration with full `dataviewjs` compatibility. | Modern Grid card layout, drag-and-drop sorting, batch import/export; achieves complete code isolation between presentation logic and note content. | 📦 **Built-in (Example Vault)** |
| **🚀 Configuration Storage Interception Engine** | Solves sync nightmares where plugins' configs frequently conflict during Git backup across multiple devices (mobile/PC). | Unified management of all extension module configs. `.obsidian/plugins/` folder can be added to `.gitignore`, enabling **zero-conflict multi-device sync**. | 🌐 **Kernel-level Native Support (Import)** |
| **🧬 WebGL 3D Spatial Positioning Linkage** | Traditional 3D orbit recording data is heavy and rigid; minor changes easily trigger global coordinate crashes (Three.js docs), with no deep linking to local notes. | Seamless 3D rendering sandbox in Obsidian; clicking 3D bones/muscles/acupoints instantly opens linked local notes! | 🌐 **WebGL Engine Support (Import)** <img src="./assets/modules/模型查看.gif" alt="Refresh plugin" width="250">|
| **🎧 Rich Frontend Micro-component Ecosystem** | Sandboxed music players, real-time comment boards, one-click command downloads, and other refined components for high-density information control. | Painless import/export via standard `.ops` format; developers and non-technical users don't need any underlying build environment. | 🌐 **Ecosystem Interface Open (Import)** |

### 📁 Multiple File Type Support

| Type | Extension | Description |
|------|-----------|-------------|
| JavaScript | `.js` | Fully sandboxed safe execution |
| CSS | `.css` | Independent control, supports on-demand activation/deactivation |
| JSON | `.json` | Configuration file dynamic parsing and hot reload |
| YAML | `.yaml` / `.yml` | Configuration file dynamic parsing and hot reload |
| Markdown | `.md` | Content sandbox isolation rendering |
| Image | `.jpg` / `.gif` / `.png` | Image processing |
| GLB | `.glb` | 3D spatial interaction model engine native support |
| Page | `.page` | Independent micro-frontend page component ecosystem encapsulation |

## Installation

### Install from Community Plugins (Recommended)

> Open Obsidian Settings → "Community Plugins" → Search for "Pluto Hub" → Click "Install" and enable.

### Manual Installation (Dev Version Debugging)

> Copy packaged main.js, styles.css, manifest.json to vault directory: `<Vault>/.obsidian/plugins/obsidian-pluto-hub/` path, restart Obsidian and enable.

### 🤝 Third-party Plugin Integration

If the following major official plugins are detected as locally activated, Pluto Hub's sandbox runtime will automatically integrate their underlying kernels and map out more advanced, content-isolated programmable interfaces:

1. **React Components**: Perfectly drive component state via `pluto.third.react`
2. **Templater**: Perform script-level lifecycle mounting via `pluto.third.templater`
3. **Dataview**: Unlock no-code advanced data rendering output via `pluto.third.dva`

## Using External Modules

Pluto Hub supports extending functionality by importing external modules.

1. Obtain module files from trusted sources (with `.ops` extension)
2. In plugin settings, **customize the storage path** (default is `.obsidian/cache/modules`)
3. Place `.ops` module files in that directory
4. Return to the plugin interface, modules will be automatically loaded and take effect

> ⚠️ Please only import modules from trusted sources. This plugin is not responsible for the security of third-party modules, and users assume their own risk.

## Version History

For detailed changelog, please see [CHANGES.md](./CHANGES.md).

## 🙏 Support the Author

If you find this plugin helpful, you can buy the author a coffee:

<div align="center">

[![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/1553599299u)

---

### Alipay & WeChat Pay

<table align="center">
  <tr>
    <td align="center">
      <img src="assets/fund1.jpg" alt="Alipay" width="150"><br>
      <strong>Alipay</strong>
    </td>
    <td align="center">
      <img src="assets/fund2.jpg" alt="WeChat Pay" width="150"><br>
      <strong>WeChat Pay</strong>
    </td>
  </tr>
</table>

</div>

---

## License

[MIT License](./LICENSE)

## Contact
- Email: xiajianduan@outlook.com
- Email: xiajianduan@qq.com
- GitHub Issues: [https://github.com/xiajianduan/obsidian-pluto-hub/issues](https://github.com/xiajianduan/obsidian-pluto-hub/issues)

---

**Enjoy the powerful extensibility of Pluto Hub!** 🚀