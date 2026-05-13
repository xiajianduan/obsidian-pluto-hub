# Changes Log

## [1.1.7] - 2026-05-14

### Added
- `AGENTS.md` - 新增了插件开发指南文档，包含项目概述、环境工具、文件约定、测试、安全性、代码规范等内容
- `BatchContext` 类型 - 新增了批处理上下文类型，用于组件安装和卸载
- ThirdFactory实例管理 - 新增了instances Map来管理第三方组件实例
- ThirdFactory辅助方法 - 新增了loop()和getInstance()方法

### Improved
- 重构了ThirdFactory，新增实例管理和辅助方法
- 优化了第三方组件接口，新增prop属性，调整了register方法参数
- 重构了CoreExecutor接口，新增install和uninstall方法，调整了execute方法参数
- 优化了ModParams类型定义，调整了参数结构
- 更新了Obsidian类型定义，新增Vault接口和相关方法
- 优化了所有执行器的实现（CssExecutor、JsonExecutor、MarkdownExecutor、SandboxExecutor、SimpleExecutor、YamlExecutor、PageExecutor、GlbExecutor）
- 改进了CoreManager、ConfigManager、FormManager的实现
- 优化了BoardRenderer和EditorRenderer的渲染逻辑
- 更新了样式文件styles.css
- 优化了所有第三方组件（DvaComponent、ReactComponent、SimpleComponent、TemplaterComponent）的实现

### Files Modified
- `package.json` - 更新了版本号到1.1.7
- `manifest.json` - 更新了版本号到1.1.7
- `AGENTS.md` - 新增了插件开发指南文档
- `src/core/BoardRenderer.ts` - 优化了看板渲染器
- `src/core/EditorRenderer.ts` - 优化了编辑器渲染器
- `src/exec/CssExecutor.ts` - 优化了CSS执行器
- `src/exec/GlbExecutor.ts` - 优化了GLB执行器
- `src/exec/JsonExecutor.ts` - 优化了JSON执行器
- `src/exec/MarkdownExecutor.ts` - 优化了Markdown执行器
- `src/exec/PageExecutor.ts` - 优化了Page执行器
- `src/exec/SandboxExecutor.ts` - 优化了沙箱执行器
- `src/exec/SimpleExecutor.ts` - 优化了简单执行器
- `src/exec/YamlExecutor.ts` - 优化了YAML执行器
- `src/manager/ConfigManager.ts` - 优化了配置管理器
- `src/manager/CoreManager.ts` - 优化了核心管理器
- `src/manager/FormManager.ts` - 优化了表单管理器
- `src/pluto.ts` - 优化了Pluto核心类
- `src/styles.css` - 更新了样式文件
- `src/third/DvaComponent.ts` - 优化了Dva组件
- `src/third/ReactComponent.ts` - 优化了React组件
- `src/third/SimpleComponent.ts` - 优化了Simple组件
- `src/third/TemplaterComponent.ts` - 优化了Templater组件
- `src/third/ThirdFactory.ts` - 重构了ThirdFactory，新增实例管理
- `src/types/global.d.ts` - 更新了全局类型定义，新增BatchContext，优化了接口定义
- `src/types/obsidian.d.ts` - 更新了Obsidian类型定义，新增Vault接口

## [1.1.6] - 2026-05-06

### Added
- `src/core/PluginContext.ts` - 新增了插件上下文，提供全局插件实例访问
- `src/manager/ConfigManager.ts` - 新增了配置管理器，统一管理配置
- `README.md` - 全面更新了README文档，完善了功能说明和项目结构

### Improved
- 重构了插件初始化逻辑，使用PluginContext统一管理插件实例
- 优化了CoreManager的实现，改进了模块运行和更新逻辑
- 优化了YamlExecutor、SandboxExecutor、SimpleExecutor的实现
- 改进了存储管理，优化了模块保存和加载逻辑
- 增强了类型定义，完善了global.d.ts和obsidian.d.ts
- 更新了README文档，补充了最新功能说明、项目结构和使用指南
- 优化了ViewManager的视图构建和状态管理逻辑
- 改进了BoardRenderer和ModuleAction的实现
- 更新了TypeScript配置，优化了编译选项

### Files Modified
- `package.json` - 更新了版本号到1.1.6
- `manifest.json` - 更新了版本号到1.1.6
- `README.md` - 全面更新了文档，完善了功能说明、快速开始、高级用法等内容
- `src/core/BoardRenderer.ts` - 优化了看板渲染器实现
- `src/core/ModuleAction.ts` - 优化了模块操作管理器
- `src/core/PluginContext.ts` - 新增了插件上下文管理
- `src/exec/SandboxExecutor.ts` - 优化了沙箱执行器实现
- `src/exec/SimpleExecutor.ts` - 优化了简单执行器实现
- `src/exec/YamlExecutor.ts` - 优化了YAML执行器实现
- `src/main.ts` - 优化了插件初始化逻辑
- `src/manager/ConfigManager.ts` - 新增了配置管理器
- `src/manager/CoreManager.ts` - 优化了核心管理器实现
- `src/manager/ViewManager.ts` - 优化了视图管理器
- `src/pluto.ts` - 重构了Pluto核心类，优化了初始化和插件绑定逻辑
- `src/storage.ts` - 优化了存储管理
- `src/types/global.d.ts` - 更新了全局类型定义
- `src/types/obsidian.d.ts` - 更新了Obsidian类型定义
- `tsconfig.json` - 更新了TypeScript配置
- `versions.json` - 更新了版本信息

## [1.1.5] - 2026-01-12

### Added
- `src/core/ViewManager.ts` - 新增了视图管理器，优化视图系统
- `src/modal/FormField.tsx` - 新增了表单字段组件
- `src/modal/FormManager.ts` - 新增了表单管理器
- `src/modal/FormModal.tsx` - 新增了React表单弹窗组件
- `src/modal/FormJson.ts` - 新增了表单JSON处理组件
- `src/modal/PlutoFormModal.tsx` - 新增了Pluto表单弹窗实现
- `src/types/form.d.ts` - 新增了表单相关类型定义
- `src/view/FormModal.ts` - 实现了动态表单模态框，支持openForm方法
- `src/view/PlutoFileView.ts` - 重命名自PlutoHomeView.ts，优化文件视图
- `src/view/PlutoTextView.ts` - 新增了文本视图
- `src/exec/SimpleExecutor.ts` - 新增了简单执行器，替代SimpleCoreExecutor
- `src/exec/YamlExecutor.ts` - 新增了YAML执行器，支持YAML文件处理
- `src/exec/PageExecutor.ts` - 新增了Page执行器，支持page类型文件处理
- `src/exec/GlbExecutor.ts` - 新增了GLB执行器，支持GLB文件处理
- `src/manager/ThemeManager.ts` - 新增了主题管理器，支持多种主题切换
- `src/utils/array.ts` - 新增了数组扩展工具，添加groupBy方法
- `src/utils/const.ts` - 新增了常量定义文件

### Improved
- 重构了视图系统，优化了视图管理逻辑
- 增强了动态表单支持，提供了更灵活的表单创建方式
- 优化了文件视图和文本视图的功能
- 修复了FormManager中表单值处理逻辑，使用空值合并操作符替代逻辑或操作符
- 优化了各种执行器的实现
- 更新了样式文件，添加了表单相关样式
- 优化了模块卡片布局，使用auto-fit实现响应式网格
- 增强了第三方组件的错误检查机制
- 优化了模块存储逻辑，移除了pako压缩开关
- 重构执行器系统，将SimpleCoreExecutor重命名为SimpleExecutor
- 新增YAML执行器，支持YAML文件处理
- 新增Page执行器，支持page类型文件处理
- 新增GLB执行器，支持GLB文件处理
- 优化第三方组件实现，重命名SimpleThirdComponent为SimpleComponent
- 增强表单功能，新增FormJson组件
- 扩展数组方法，添加groupBy功能
- 优化提示信息，使用自定义表单提示替代QuickAdd依赖
- Templater组件配置文件从JSON改为YAML
- 重构了管理器结构，将CoreManager、FormManager、ViewManager统一移动到manager目录，提高代码组织性
- 新增主题管理功能，支持多种主题切换和自定义主题
- 优化了Pluto核心类的结构，将管理器统一命名为Manager后缀
- 优化了YamlExecutor和SandboxExecutor的实现
- 增强了FormJson的表单配置功能
- 实现了模块卡片拖拽排序功能，支持直观调整模块顺序
- 优化了插件绑定机制，移除了不必要的延迟，提高了插件加载速度
- 优化了Dashboard Header和搜索输入框样式，添加了半透明背景和模糊效果
- 重构了模块卡片布局，从grid改为flex，优化了间距和阴影效果
- 增强了错误处理机制，添加了错误堆栈复制功能
- 优化了视图管理器的状态处理，调整了参数顺序
- 优化了CoreManager，新增了importFile和exportModule方法，支持批量导入导出文件
- 优化了配置文件访问方式，移除了yaml/json的get方法调用，改用直接属性访问
- 优化了PlutoTextView的页面获取方式，从page.get改为直接属性访问
- 为CoreExecutor接口添加了read和write方法，增强了执行器的文件操作能力
- 优化了ViewManager的标题属性，从props.name改为props.label

### Files Modified
- `package.json` - 更新了依赖配置
- `src/core/BoardRenderer.ts` - 实现了模块卡片拖拽排序功能，优化了看板渲染器和导出路径处理
- `src/core/EditorRenderer.ts` - 优化了导出路径处理，添加了保存成功通知
- `src/core/MirrorRenderer.ts` - 优化了镜像渲染器实现
- `src/core/ModuleAction.ts` - 方法重命名
- `src/core/ViewManager.ts` - 优化了视图管理器
- `src/core/ViewResolver.ts` - 方法重命名和优化
- `src/exec/CoreManager.ts` - 方法调用更新
- `src/exec/CssExecutor.ts` - 优化了CSS执行器，增强了功能
- `src/exec/GlbExecutor.ts` - 新增了GLB执行器，支持GLB文件处理
- `src/exec/ImageExecutor.ts` - 优化了图片执行器
- `src/exec/JsonExecutor.ts` - 优化了JSON执行器
- `src/exec/MarkdownExecutor.ts` - 优化了Markdown执行器
- `src/exec/SandboxExecutor.ts` - 优化了沙箱执行器实现
- `src/exec/SimpleExecutor.ts` - 优化了简单执行器实现
- `src/exec/YamlExecutor.ts` - 优化了YAML执行器，增强了功能
- `src/exec/PageExecutor.ts` - 优化了Page执行器
- `src/manager/CoreManager.ts` - 优化了核心管理器实现，添加了错误堆栈复制功能，新增了importFile和exportModule方法
- `src/manager/FormManager.ts` - 移动到manager目录，优化了表单管理器
- `src/manager/ViewManager.ts` - 优化了视图管理器，调整了状态参数顺序，优化了标题属性
- `src/modal/FormJson.ts` - 增强了表单JSON配置功能
- `src/modal/PlutoFormModal.tsx` - 优化了Pluto表单弹窗实现
- `src/pluto.ts` - 重构了管理器结构，统一使用Manager后缀命名，新增主题管理器，优化了插件绑定机制，移除了不必要的延迟，调整了轮询间隔，优化了配置文件访问方式
- `src/third/DvaComponent.ts` - 优化了Dva组件实现
- `src/types/global.d.ts` - 更新了全局类型定义，添加了Manager类型和page执行器类型，为CoreExecutor添加了read和write方法
- `src/utils/helper.ts` - 优化了辅助工具函数
- `src/view/PlutoTextView.ts` - 优化了文本视图，优化了页面获取方式
- `src/i18n/en.ts` - 更新了国际化字符串
- `src/i18n/zh-cn.ts` - 更新了国际化字符串
- `src/main.ts` - 添加了路径检查方法
- `src/modal/FormField.tsx` - 优化了表单字段组件，将dropdown类型改为select
- `src/modal/FormManager.ts` - 优化了表单管理器
- `src/modal/FormModal.tsx` - 优化了React表单弹窗组件
- `src/modal/PlutoFormModal.tsx` - 优化了Pluto表单弹窗实现
- `src/pluto.ts` - 实现了FormModal动态表单模态框，支持openForm方法
- `src/settings.ts` - 更新了默认设置和UI，移除了usePako和columns设置
- `src/storage.ts` - 优化了路径处理和方法重命名，移除了pako压缩逻辑
- `src/styles.css` - 优化了Dashboard Header、搜索输入框和模块卡片样式，添加了拖拽相关样式
- `src/third/DvaComponent.ts` - 优化了Dva组件
- `src/third/QaComponent.ts` - 优化了Qa组件
- `src/third/ReactComponent.ts` - 优化了React组件，添加了错误检查、patch方法和started状态检查
- `src/third/SimpleComponent.ts` - 重命名自SimpleThirdComponent，优化了简单组件实现
- `src/third/TemplaterComponent.ts` - 优化了Templater组件，添加了错误检查和parser状态检查，配置文件改为YAML
- `src/third/ThirdFactory.ts` - 移除了FormComponent支持，更新了组件映射
- `src/types/form.d.ts` - 更新了表单字段定义，isRequired改为required，title改为可选，dropdown改为select
- `src/types/global.d.ts` - 更新了全局类型定义，移除了form组件支持，扩展了Array接口
- `src/types/obsidian.d.ts` - 更新了Obsidian相关类型定义
- `src/utils/helper.ts` - 新增了辅助工具函数，优化了提示信息处理
- `src/view/PlutoBoardView.ts` - 优化了看板视图，修改了onOpen方法调用
- `src/view/PlutoTextView.ts` - 优化了文本视图
- `tsconfig.json` - 更新了TypeScript配置

### Renamed
- `src/third/SimpleThirdComponent.ts` -> `src/third/SimpleComponent.ts` - 重命名简单第三方组件
- `src/exec/CoreManager.ts` -> `src/manager/CoreManager.ts` - 将核心管理器移动到manager目录
- `src/modal/FormManager.ts` -> `src/manager/FormManager.ts` - 将表单管理器移动到manager目录
- `src/core/ViewManager.ts` -> `src/manager/ViewManager.ts` - 将视图管理器移动到manager目录

### Deleted
- `src/types/pluto.d.ts` - 删除了过时的类型定义
- `src/third/FormComponent.ts` - 删除了FormComponent组件
- `src/exec/SimpleCoreExecutor.ts` - 删除了SimpleCoreExecutor，由SimpleExecutor替代
- `src/exec/CoreManager.ts` - 移动到manager目录（已重命名）

## [1.1.4] - 2026-01-06

### Fixed
- 修复了多个按钮点击取消后加载图标持续旋转的问题（新建文件、添加模块、导出所有、保存按钮）
- 修复了文件名和模块名输入验证的构建错误
- 修复了运行模块时显示id而不是name的问题
- 修复了导入模块时背景颜色总是变化的问题，现在会保留原始模块的颜色
- 修复了加载模块时没有把背景设为logo.jpg的问题
- 修复了opacity: 0.5导致文字变暗的问题
- 修复了main.ts中根据prop创建ThirdComponent实例的问题
- 修复了new Function不支持export class语法的问题

### Improved
- 重构了renderDashboard方法，优化了错误处理逻辑
- 增强了输入验证，添加了文件名和模块名的非空检查、重复检查和无效字符验证
- 更新了JSDoc注释，提高了代码可读性
- UI优化：删除了模块卡片上的"已禁用"/"已激活"文本标签，改为在取消勾选状态时使用filter: grayscale(1)样式实现灰色背景效果
- 支持根据pluto.skin.path自动设置模块背景图片
- 实现了图片背景样式设置，包括background-size: cover和居中显示
- 实现了module创建第一次bgColor保存到文件，后面更新module不再保存bgColor的功能
- 添加了ThirdFactory类，用于根据prop动态创建相应的组件实例
- 优化了插件绑定逻辑，提高了代码的可维护性
- 提取了base64ToBlobUrl公共方法，简化了图片预览功能代码
- 新增了helper.ts文件，提供了更多工具函数
- 重构了模块管理功能，将modules从pluto直接移到pluto.third下
- 优化了导入模块的逻辑，不再使用临时文件
- 改进了文件读取功能，将多个文件读取方法封装到helper.ts中
- 优化了toggle开关的样式和逻辑，实时更新样式而不重新渲染整个界面
- 实现了卡片高度随宽度变化而等比缩放的效果
- 重构了项目结构，将功能拆分为多个模块，提高了代码的可维护性和可扩展性
- 新增了多个执行器，用于处理不同类型的文件
- 重构了Third组件，将third.ts拆分为多个组件文件
- 重构了视图系统，将view.ts拆分为PlutoBoardView.ts和PlutoHomeView.ts
- 新增了核心渲染模块：BoardRenderer.ts, EditorRenderer.ts, MirrorRenderer.ts
- 新增了ModuleAction.ts和ViewResolver.ts，优化了模块操作和视图解析逻辑
- 新增了国际化支持，包括enable-icon和webp-quality设置

### Added
- `src/core/ImageConverter.ts` - 添加了图片转换功能
- `src/core/BoardRenderer.ts` - 添加了看板渲染器
- `src/core/EditorRenderer.ts` - 添加了编辑器渲染器
- `src/core/MirrorRenderer.ts` - 添加了镜像渲染器
- `src/core/ModuleAction.ts` - 添加了模块操作管理器
- `src/core/ViewResolver.ts` - 添加了视图解析器
- `src/exec/CoreManager.ts` - 新增了核心管理器
- `src/exec/CssExecutor.ts` - 新增了CSS执行器
- `src/exec/ImageExecutor.ts` - 新增了图片执行器
- `src/exec/JsonExecutor.ts` - 新增了JSON执行器
- `src/exec/MarkdownExecutor.ts` - 新增了Markdown执行器
- `src/exec/SandboxExecutor.ts` - 新增了沙箱执行器
- `src/exec/SimpleCoreExecutor.ts` - 新增了简单核心执行器
- `src/pluto.ts` - 新增了Pluto核心功能
- `src/third/DvaComponent.ts` - 新增了Dva组件
- `src/third/FormComponent.ts` - 新增了Form组件
- `src/third/QaComponent.ts` - 新增了Qa组件
- `src/third/ReactComponent.ts` - 新增了React组件
- `src/third/SimpleThirdComponent.ts` - 新增了SimpleThird组件
- `src/third/TemplaterComponent.ts` - 新增了Templater组件
- `src/third/ThirdFactory.ts` - 新增了ThirdFactory组件
- `src/third/third.ts` - 添加了ThirdFactory和其他组件类
- `src/utils/helper.ts` - 新增了辅助工具函数
- `src/types/pluto.d.ts` - 新增了MiniModule和ModFile接口定义
- `src/types/obsidian.d.ts` - 新增了Obsidian相关类型定义

### Files Modified
- `src/main.ts` - 修改了插件绑定逻辑，使用ThirdFactory创建组件实例，添加了对export class语法的支持，重构了插件加载逻辑和视图注册
- `src/view.ts` - 重构视图系统，将其拆分为PlutoBoardView.ts和PlutoHomeView.ts
- `src/pluto.ts` - 更新了Pluto核心功能，优化了模块管理和视图处理
- `src/types/obsidian.d.ts` - 更新了Obsidian相关类型定义
- `src/view/PlutoBoardView.ts` - 新增了看板视图组件
- `src/view/PlutoHomeView.ts` - 新增了主页视图组件
- `src/i18n/en.ts` - 添加验证相关的英文翻译，删除不再使用的翻译条目，新增了enable-icon和webp-quality设置的翻译
- `src/i18n/zh-cn.ts` - 添加验证相关的中文翻译，删除不再使用的翻译条目，新增了enable-icon和webp-quality设置的翻译
- `src/storage.ts` - 修复导入模块时背景颜色总是变化的问题，优化模块导入逻辑，添加图片下载和base64转换功能，优化bgColor保存逻辑，将saveBundle改为saveModule
- `src/styles.css` - 更新了样式文件，实现卡片等比缩放效果
- `src/types/global.d.ts` - 修改了ThirdComponent和Pluto接口定义，添加了Third接口，更新了类型定义
- `src/types/pluto.d.ts` - 新增了MiniModule和ModFile接口定义，更新了类型定义
- `src/utils/helper.ts` - 添加了多个工具函数：readFileAsArrayBuffer, readFileAsBase64, readFileAsText, promptMessage
- `src/utils/utils.ts` - 添加了base64ToBlobUrl公共方法
- `src/settings.ts` - 修改了设置相关逻辑，新增了enable-icon和webp-quality设置
- `src/exec/SandboxExecutor.ts` - 修改了沙箱执行器逻辑
- `src/third/DvaComponent.ts` - 修改了Dva组件
- `src/third/QaComponent.ts` - 修改了Qa组件
- `src/third/ReactComponent.ts` - 修改了React组件
- `src/third/SimpleThirdComponent.ts` - 修改了SimpleThird组件
- `src/third/TemplaterComponent.ts` - 修改了Templater组件
- `src/third/ThirdFactory.ts` - 修改了ThirdFactory组件

### Deleted
- `src/third/third.ts` - 将third.ts拆分为多个组件文件
- `src/view.ts` - 将视图系统拆分为PlutoBoardView.ts和PlutoHomeView.ts

## [1.1.3] - 2026-01-01

### Added
 - 在编辑页面添加了导出文件功能，支持将模块中的所有文件导出到配置的备份目录
 - 保存单个模块时同时保存MiniModule信息

### Changed
 - 模块现在从存储路径读取，而不是从data文件读取
 - 隐藏了默认的view-header区域（只隐藏当前视图，不影响其他视图）
 - 改进了header隐藏的实现方式，将逻辑移到构造函数中，提高效率
 - 将保存按钮、删除按钮、导入文件按钮、导出文件按钮从底部移到顶部导航栏
 - 将"保存所有更改"按钮文本改为"保存模块"
 - 将"+ 文件"按钮移动到editor命名空间下，文本改为"新建文件"
 - 为导航栏按钮添加了btn_nob样式类

### Fixed
 - 修复了导出文件功能的文件夹选择逻辑，改为直接使用配置中的备份目录，无需用户选择文件夹
 - 修复了导出全部功能中点击取消按钮后按钮一直旋转的问题
 - 优化了模块管理功能，将modules字段从MiniModule[]改为string[]类型，只存储模块名称字符串
 - 修复了模块勾选/取消勾选后状态不保存的问题

## [1.1.2] - 2026-01-01

### Added
 - 在Dashboard的pluto-header区域添加了搜索框，支持过滤模块
 - 优化了pluto-header的样式，添加了padding和边框
 - 导入文件功能支持所有文件格式
 - 支持jpg、png、gif、webp等图片文件的预览功能

### Fixed
 - 修复了图片预览的URL格式错误问题，改用Blob URL实现图片预览
 - 修复了切换文件后图片预览报错的根本问题，确保不会将文本内容错误保存到图片的base64字段中
 - 优化了图片预览的错误处理，添加了更详细的日志信息

### Changed
- 重构了switch方法，优化了模块切换的逻辑和性能

### Files Modified
- `src/styles.css` - 添加了pluto-header和搜索框样式
- `src/view.ts` - 实现了搜索框功能和模块过滤，移除了文件导入格式限制，添加了图片预览功能，重构了switch方法
- `src/i18n/en.ts` - 添加搜索框的英文翻译
- `src/i18n/zh-cn.ts` - 添加搜索框的中文翻译

## [1.1.1] - 2026-01-01

### Added
- 在编辑页面的文件侧边栏中添加了导入按钮，支持导入.js、.css、.json和.md文件

  ### Changed
- 导入按钮支持国际化
- 新建文件按钮移动到文件列表上方

### Fixed
- 修复了点击激活按钮后需要刷新页面文字才会改变的问题
- 修复了切换激活状态时会运行所有模块的问题，现在只会运行当前操作的模块

### Changed
- 为所有按钮添加了现代化的美观样式，包括悬停效果和渐变背景

### Files Modified
- `src/view.ts` - 修改toggle开关点击事件，只运行当前操作的模块并优化状态更新，添加导入文件功能
- `src/styles.css` - 添加了完整的按钮样式方案，包括默认按钮、CTA按钮、警告按钮和渐变按钮样式
- `src/i18n/en.ts` - 添加导入功能的英文翻译
- `src/i18n/zh-cn.ts` - 添加导入功能的中文翻译

## [1.1.0] - 2026-01-01

### Added
- 实现了完整的国际化支持，包括按钮文字和settings页签
- 添加了英文和中文的国际化资源文件

### Changed
- 将settings页面的所有文本替换为国际化调用
- 将仪表板界面的按钮、标题和状态标签国际化
- 将编辑器界面的所有按钮和提示文本国际化
- 将导出功能的对话框和通知文本国际化

### Files Modified
- `README.md` - 更新了项目说明
- `manifest.json` - 更新了插件信息
- `src/i18n/en.ts` - 添加英文国际化字符串
- `src/i18n/zh-cn.ts` - 添加中文国际化字符串
- `src/main.ts` - 添加国际化支持
- `src/settings.ts` - Settings页面国际化
- `src/storage.ts` - 存储功能国际化
- `src/styles.css` - 更新样式支持
- `src/view.ts` - 主界面国际化