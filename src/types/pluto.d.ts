// 定义模块的元数据接口
export interface MiniModule {
    id: string;
    name: string;
    enabled: boolean;
    bgColor?: string; // 用于存储随机渐变色
    files: ModFile[]; // 直接在MiniModule中包含文件数组
    bgUrl?: string; // 用于存储图片 URL
}
export interface ModFile {
    name: string;
    type: string;
    content: string;
    blobUrl?: string; // 用于存储图片 Blob URL
}

// 定义插件设置接口
export interface PlutoSettings {
    moduleStoragePath: string;
    backupFolderName: string
    usePako: boolean;
    columns: number;
}