import { App, Notice, TFile } from "obsidian";

export class ImageConverter {
    private app: App;

    constructor(app: App) {
        this.app = app;
    }
    /**
     * 将 JPG 图片转换为 WebP 格式
     * @param {ArrayBuffer} jpgBuffer - JPG 图片的二进制数据
     * @param {number} quality - 压缩质量 (0-100)
     * @returns {Promise<Blob>} WebP 格式的 Blob 对象
     */
    async convertJpgToWebp(jpgBuffer: ArrayBuffer, quality: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            // 将 ArrayBuffer 转换为 Blob
            const jpgBlob = new Blob([jpgBuffer], { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(jpgBlob);

            // 创建图像对象加载 JPG
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(imageUrl);

                // 创建画布绘制图像
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);

                // 转换为 WebP 并返回 ArrayBuffer
                canvas.toBlob(
                    (webpBlob) => {
                        if (!webpBlob) {
                            reject(new Error('无法转换为 WebP 格式'));
                            return;
                        }
                        resolve(webpBlob);
                    },
                    'image/webp',
                    quality / 100 // toBlob 质量参数是 0-1 范围
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(imageUrl);
                reject(new Error('无法加载图像数据'));
            };

            img.src = imageUrl;
        });
    }

    async convertFileToWebp(file: TFile, quality = 90) {
        try {
            // 1. 获取文件二进制数据
            const jpgBuffer = await this.app.vault.readBinary(file);
            // 2. 转换为 WebP
            const blob = await this.convertJpgToWebp(jpgBuffer, quality);
            // 3. 保存为新文件（原文件名后加 .webp）
            const webpPath = file.path.replace(/\.jpg|\.png/, '.webp');
            await this.app.vault.createBinary(webpPath, await blob.arrayBuffer());
            new Notice(`转换成功: ${webpPath}`);
            return webpPath;
        } catch (error) {
            console.error('转换失败:', error);
            throw error;
        }
    }

    async convertPathToWebp(path: string, quality = 90) {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!file || !(file instanceof TFile)) {
            throw new Error(`路径 "${path}" 不存在或不是文件`);
        }
        return this.convertFileToWebp(file, quality);
    }

    /**
     * 判断 TFile 是否为图片文件
     * @param {TFile} file - Obsidian 的 TFile 对象
     * @returns {boolean} 是否为图片
     */
    isImage(file: TFile): boolean {
        const imageExtensions = ['jpg', 'jpeg', 'png'];
        const ext = file.extension.toLowerCase();
        return imageExtensions.includes(ext);
    }
}
