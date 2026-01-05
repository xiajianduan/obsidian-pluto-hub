# Changes Log

## [1.1.4] - 2026-01-05

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

### Added
- `src/third/third.ts` - 添加了ThirdFactory和其他组件类
- `src/utils/helper.ts` - 新增了辅助工具函数
- `src/types/pluto.d.ts` - 新增了MiniModule和ModFile接口定义

### Files Modified
- `src/main.ts` - 修改了插件绑定逻辑，使用ThirdFactory创建组件实例，添加了对export class语法的支持
- `src/view.ts` - 修复按钮状态重置问题，重构renderDashboard方法，增强输入验证，优化UI显示，添加图片背景支持，修复背景图片显示问题，简化图片预览功能代码，优化toggle开关逻辑，简化导入导出功能，实现卡片等比缩放效果
- `src/i18n/en.ts` - 添加验证相关的英文翻译，删除不再使用的翻译条目
- `src/i18n/zh-cn.ts` - 添加验证相关的中文翻译，删除不再使用的翻译条目
- `src/storage.ts` - 修复导入模块时背景颜色总是变化的问题，优化模块导入逻辑，添加图片下载和base64转换功能，优化bgColor保存逻辑，将saveBundle改为saveModule
- `src/styles.css` - 更新了样式文件，实现卡片等比缩放效果
- `src/types/global.d.ts` - 修改了ThirdComponent和Pluto接口定义，添加了Third接口
- `src/types/pluto.d.ts` - 新增了MiniModule和ModFile接口定义
- `src/utils/helper.ts` - 添加了多个工具函数：readFileAsArrayBuffer, readFileAsBase64, readFileAsText, promptMessage
- `src/utils/utils.ts` - 添加了base64ToBlobUrl公共方法
- `src/settings.ts` - 修改了设置相关逻辑
- `src/third/third.ts` - 更新了ThirdFactory和组件类

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