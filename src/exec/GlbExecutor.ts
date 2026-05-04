import { base64ToBlob, base64ToBlobUrl, readFileAsBase64 } from "utils/helper";
import { SimpleExecutor } from "./SimpleExecutor";

export class GlbExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return type === 'glb';
    }

    async execute(module: MiniModule, started: boolean): Promise<void> {
        for (const file of module.tmpFiles!) {
            // 将配置挂载到 pluto.assets[模块名]
            const blobUrl = base64ToBlobUrl(file.content, `model/gltf-binary`);
            pluto.third.assets[module.name][file.name] = blobUrl;
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
