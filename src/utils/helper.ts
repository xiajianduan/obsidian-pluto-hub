import { App, normalizePath, TFile } from "obsidian";

/**
 * 判断文件是否为图片类型
 */
export function isImageFile(fileType: string): boolean {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageTypes.includes(fileType.toLowerCase());
}

/**
 * 将base64字符串转换为Blob对象
 */
export function base64ToBlob(base64: string, fileType: string): Blob {
    try {
        // 清除可能的空白字符和换行符
        const cleanBase64 = base64.replace(/\s/g, '');
        const binaryString = atob(cleanBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: `image/${fileType}` });
    } catch (e) {
        console.error('Failed to convert base64 to blob:', e);
        throw e;
    }
}

/**
 * 将base64字符串转换为Blob URL
 */
export function base64ToBlobUrl(base64: string, fileType: string): string {
    const blob = base64ToBlob(base64, fileType);
    return URL.createObjectURL(blob);
}

// 下载图片并转换为base64
export async function downloadImageToBase64(url: string, quality: number): Promise<string | null> {
    try {
        const response = await window.pluto.web?.download(url);
        if (response.status !== 200) {
            throw new Error(`Failed to download image: ${response.status}`);
        }
        const buffer = response.arrayBuffer;
        const blob = await window.pluto.images.convertJpgToWebp(buffer, quality);
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error downloading image:', error);
        return null;
    }
}
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

export async function readFileAsBase64(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // 提取 base64 部分，去掉 data:image/xxx;base64, 前缀
            const result = reader.result as string;
            const commaIndex = result.indexOf(',');
            // 确保有逗号分隔符，否则使用空字符串
            const base64Part: string = commaIndex !== -1 ? result.substring(commaIndex + 1) : '';
            resolve(base64Part);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function readFileAsText(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
export async function promptMessage(message: any, holder?: any): Promise<string | null> {
    return new Promise((resolve) => {
        // 优先使用 QuickAdd 的 inputPrompt 方法
        if (window.pluto.third.qa?.api.inputPrompt) {
            window.pluto.third.qa.api.inputPrompt(message, holder).then(resolve);
        } else {
            // 如果 QuickAdd 不可用，回退到原生的 prompt 方法
            const input = prompt(message, holder);
            resolve(input);
        }
    });
}

export function find_tfile(app: App, name: string): TFile | null {
    const normalizedName = normalizePath(name);
    return app.metadataCache.getFirstLinkpathDest(normalizedName, "");
}
