import { ModFile } from '../types/pluto';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { markdown } from '@codemirror/lang-markdown';
import { base64ToBlobUrl, isImageFile } from 'utils/helper';

export class MirrorRenderer {

    currentEditor: EditorView | null = null;

    constructor(currentEditor: EditorView | null = null) {
        this.currentEditor = currentEditor;
    }

    // 渲染 CodeMirror 6 编辑器或图片预览
    render(containerEl: HTMLElement, file: ModFile) {
        containerEl.empty();

        // 检查是否为图片文件，添加预览功能
        if (isImageFile(file.type)) {
            // 使用 Blob URL 替代 base64 显示图片，避免 URL 格式错误
            try {
                // 使用公共方法将base64转换为Blob URL
                const blobUrl = base64ToBlobUrl(file.content, file.type);
                // 显示图片预览
                const imgEl = containerEl.createEl('img', {
                    attr: {
                        src: blobUrl,
                        alt: file.name
                    },
                    cls: 'pluto-image-preview'
                });
                imgEl.style.maxWidth = '100%';
                imgEl.style.maxHeight = '100%';
                imgEl.style.objectFit = 'contain';

                // 当组件销毁时释放 Blob URL
                imgEl.onload = () => {
                    URL.revokeObjectURL(blobUrl);
                };

                // 错误处理
                imgEl.onerror = () => {
                    console.error('Failed to load image from blob URL');
                    URL.revokeObjectURL(blobUrl);
                };

                // 当成功显示图片预览时，将 currentEditor 设置为 null
                // 这样切换文件时就不会错误地保存内容到图片的base64字段中
                this.currentEditor = null;

                return;
            } catch (e) {
                console.error('Failed to create blob URL for image:', e);
                // 输出实际的 file.content 以便诊断问题
                console.log('Actual file content:', file.content);
                // 如果无法显示图片，使用文本编辑器显示base64内容
                // 这是一个 fallback 机制，确保用户仍然可以访问文件内容
            }
        }

        // 根据文件类型选择语言支持，使用更简洁的对象映射替代switch语句
        const languageMap: Record<string, any> = {
            'js': javascript(),
            'javascript': javascript(),
            'css': css(),
            'json': javascript(), // JSON 语法高亮暂时用 js 扩展替代
            'md': markdown(),     // 使用 markdown 扩展支持 Markdown
            'markdown': markdown()
        };

        const languageExtension = languageMap[file.type] || [];

        // 创建编辑器状态
        const startState = EditorState.create({
            doc: file.content,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightSpecialChars(),
                drawSelection(),
                dropCursor(),
                EditorState.allowMultipleSelections.of(true),
                indentUnit.of('    '),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                bracketMatching(),
                indentOnInput(),
                closeBrackets(),
                rectangularSelection(),
                crosshairCursor(),
                highlightActiveLine(),
                history(),
                keymap.of([...(defaultKeymap as any), ...(historyKeymap as any)]), // 类型转换以解决版本兼容问题
                languageExtension,
                EditorView.updateListener.of(update => {
                    if (update.docChanged) {
                        // 可以在这里添加自动保存逻辑
                    }
                }),
                EditorView.theme({
                    "&": {
                        height: "100%",
                        overflow: "hidden"
                    },
                    ".cm-scroller": {
                        overflow: "auto",
                        height: "100%"
                    },
                    ".cm-content": {
                        padding: "16px"
                    },
                    ".cm-line": {
                        padding: "0 4px"
                    },
                    ".cm-gutters": {
                        backgroundColor: "var(--background-secondary-alt)",
                        color: "var(--text-muted)",
                        border: "none"
                    },
                    ".cm-activeLineGutter": {
                        backgroundColor: "var(--background-hover)"
                    },
                    ".cm-activeLine": {
                        backgroundColor: "var(--background-hover)"
                    },
                    ".cm-selectionMatch": {
                        backgroundColor: "var(--background-secondary)"
                    }
                })
            ]
        });

        // 创建编辑器视图
        this.currentEditor = new EditorView({
            state: startState,
            parent: containerEl
        });
    }
}