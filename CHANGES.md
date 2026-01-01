# Changes Log

## [Unreleased]

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