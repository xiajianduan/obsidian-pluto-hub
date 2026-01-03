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
export async function downloadImageToBase64(url: string): Promise<string | null> {
    try {
        const response = await window.pluto.web?.download(url);
        if (response.status !== 200) {
            throw new Error(`Failed to download image: ${response.status}`);
        }
        const buffer = response.arrayBuffer;
        const blob = await window.pluto.images?.convertJpgToWebp(buffer, 90);
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