# Pluto Hub - Obsidian 代码片段商城

Pluto Hub 是一个强大的 Obsidian 插件，允许用户管理、编辑和运行本地代码模块，为 Obsidian 提供了丰富的扩展能力。

## 功能特性

### 📦 模块管理
- **Grid 卡片布局**：美观的模块展示界面，支持自定义主题色
- **启用/禁用控制**：灵活控制模块的运行状态
- **导入/导出功能**：支持单个模块或全量模块的备份与恢复
- **以模块名称存储**：使用易于识别的模块名称作为文件名

### 💻 代码编辑器
- **CodeMirror 6 集成**：支持 JS、CSS、JSON 的语法高亮
- **多文件支持**：每个模块可以包含多个文件
- **实时编辑**：修改后立即生效
- **Obsidian 原生样式**：使用 Obsidian 官方 CSS 变量，保持视觉一致性

### 🌐 全局挂载
- **pluto 对象**：所有模块的输出都挂载到 `window.pluto` 全局对象
- **配置管理**：JSON 配置文件自动解析为 `pluto.config`
- **CSS 注入**：模块中的 CSS 自动注入到文档头部

### 🤝 依赖管理
- **第三方插件集成**：自动检测并映射第三方插件依赖
- **动态依赖绑定**：支持 dataview、react-components 等插件的依赖管理

## 安装方法

### 从 Obsidian 社区插件市场安装
1. 打开 Obsidian 设置
2. 点击 "社区插件"
3. 搜索 "Pluto Hub"
4. 点击 "安装" 按钮
5. 安装完成后点击 "启用"

### 手动安装
1. 下载最新版本的插件文件（`main.js`、`styles.css`、`manifest.json`）
2. 复制到你的 Obsidian 库的插件目录：`VaultFolder/.obsidian/plugins/obsidian-pluto-hub/`
3. 重启 Obsidian
4. 在设置中启用插件

## 快速开始

### 创建第一个模块
1. 点击左侧边栏的 Pluto Hub 图标打开仪表盘
2. 点击 "Add Module" 按钮
3. 输入模块名称，如 "My First Module"
4. 点击创建的模块卡片进入编辑器
5. 在 `main.js` 中输入你的代码，例如：
   ```javascript
   // My First Module
   return {
       hello: function() {
           console.log('Hello from Pluto Hub!');
           return 'Hello Pluto!';
       }
   };
   ```
6. 点击 "Save all changes" 按钮保存

### 使用模块
在 Obsidian 的控制台或其他模块中，你可以通过 `window.pluto` 访问你的模块：
```javascript
pluto["My First Module"].hello(); // 输出 "Hello from Pluto Hub!" 并返回 "Hello Pluto!"
```

## 模块定义

### JavaScript 模块
JavaScript 模块可以返回一个对象，该对象会被挂载到 `window.pluto` 上：

```javascript
// 模块的 main.js
return {
    // 导出的函数
    greet: function(name) {
        return `Hello, ${name}!`;
    },
    
    // 导出的变量
    version: "1.0.0",
    
    // 导出的对象
    config: {
        theme: "dark",
        fontSize: 16
    }
};
```

### CSS 模块
CSS 文件会被自动注入到文档头部：

```css
/* 模块的 styles.css */
.my-custom-class {
    color: var(--interactive-accent);
    font-weight: bold;
}

/* 使用 Obsidian 原生 CSS 变量 */
.note-card {
    background-color: var(--background-secondary);
    border-radius: var(--radius-s);
    padding: var(--size-4);
}
```

### JSON 配置
JSON 文件会被解析为 `pluto.config` 对象：

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

## Pluto 对象

### 全局对象
所有模块的输出都挂载到 `window.pluto` 对象上：

```javascript
// 访问模块
pluto["Module Name"].functionName();

// 访问配置
pluto.config.apiKey;
```

### 核心属性
- `pluto.app`: Obsidian 应用实例
- `pluto.config`: 所有 JSON 配置的合并结果
- `pluto.plugins`: 第三方插件依赖映射

### 第三方插件映射
Pluto Hub 会自动映射常用的第三方插件：

| 插件名称 | Pluto 对象路径 | 说明 |
|---------|---------------|------|
| Dataview | `pluto.dv` | 数据视图插件 |
| React Components | `pluto.react` | React 组件插件 |
| Templater | `pluto.templater` | 模板插件 |

## 开发指南

### 环境准备
- Node.js 16 或更高版本
- npm 或 yarn

### 构建流程
1. 克隆仓库：`git clone https://github.com/your-username/obsidian-pluto-hub.git`
2. 安装依赖：`npm install`
3. 开发模式：`npm run dev`（自动编译）
4. 生产构建：`npm run build`

### 项目结构
```
src/
├── main.ts          # 插件主入口
├── view.ts          # 视图组件
├── storage.ts       # 存储管理
├── settings.ts      # 设置管理
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

### 核心 API

#### 模块存储
```typescript
import { ModStorage } from './storage';

// 保存模块
await ModStorage.saveBundle(plugin, bundle);

// 加载模块
const bundle = await ModStorage.loadBundle(plugin, moduleId);

// 导出模块
await ModStorage.exportModule(plugin, moduleId, filePath);

// 导入模块
await ModStorage.importModule(plugin, filePath);
```

#### 模块运行
```typescript
// 在 main.ts 中
await this.runBundle(bundle);
await this.runAllEnabled();
```

## 高级用法

### 模块间通信
模块可以通过 `window.pluto` 互相通信：

```javascript
// Module A
export const sharedData = {
    value: 42
};

// Module B
console.log(pluto["Module A"].sharedData.value); // 输出 42
pluto["Module A"].sharedData.value = 100;
```

### 动态加载资源
```javascript
// 加载外部脚本
const script = document.createElement('script');
script.src = 'https://cdn.example.com/library.js';
document.head.appendChild(script);

// 加载外部样式
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdn.example.com/styles.css';
document.head.appendChild(link);
```

## 故障排除

### 模块无法运行
1. 检查模块是否已启用
2. 查看浏览器控制台是否有错误信息
3. 确保代码语法正确

### 导入失败
1. 检查文件格式是否为 `.ops`
2. 确保文件没有损坏
3. 查看浏览器控制台的错误信息

### 性能问题
1. 禁用不需要的模块
2. 优化代码，避免长时间运行的函数
3. 减少模块数量

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范
- 使用 Conventional Commits 规范
- 确保所有测试通过
- 保持代码风格一致

### 开发环境设置
1. 安装依赖：`npm install`
2. 运行测试：`npm test`
3. 检查代码质量：`npm run lint`

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [https://github.com/your-username/obsidian-pluto-hub/issues](https://github.com/your-username/obsidian-pluto-hub/issues)
- Discord: [https://discord.gg/obsidianmd](https://discord.gg/obsidianmd)

---

**享受 Pluto Hub 带来的强大扩展能力！** 🚀
