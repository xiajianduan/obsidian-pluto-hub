import { SimpleExecutor } from "./SimpleExecutor";
import { base64ToBlob, base64ToBlobUrl, isImageFile, readFileAsBase64 } from "utils/helper";

export class ImageExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return isImageFile(type);
    }

    async execute(context: BatchContext): Promise<void> {
        for (const file of context.files) {
            // 将配置挂载到 pluto.assets[模块名]
            const blobUrl = base64ToBlobUrl(file.content, file.type);
            file.blobUrl = blobUrl;
            pluto.third.assets[context.name][file.name] = blobUrl;
        };
    }

    async read(file: File): Promise<string> {
        return await readFileAsBase64(file);
    }

    async write(filePath: string, content: string, type: string) {
        const blob = base64ToBlob(content, type);
        if (blob) {
            return await app.vault.adapter.writeBinary(filePath, await blob.arrayBuffer());
        } else {
            throw new Error('Failed to convert base64 to blob');
        }
    }
}
