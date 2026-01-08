import { SimpleExecutor } from "./SimpleExecutor";
import { base64ToBlobUrl, isImageFile } from "utils/helper";

export class ImageExecutor extends SimpleExecutor {

    excutable(type: string): boolean {
        return isImageFile(type);
    }
        
    async execute(module: MiniModule): Promise<void> {
        for (const file of module.tmpFiles!) {
            // 将配置挂载到 pluto.assets[模块名]
            const blobUrl = base64ToBlobUrl(file.content, file.type);
            file.blobUrl = blobUrl;
            pluto.third.assets[module.name].images.set(file.name, blobUrl);
        };
    }
}
