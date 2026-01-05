import { MiniModule } from "types/pluto";
import { SimpleCoreExecutor } from "./SimpleCoreExecutor";
import { base64ToBlobUrl, isImageFile } from "utils/helper";

export class ImageExecutor extends SimpleCoreExecutor {

    excutable(type: string): boolean {
        return isImageFile(type);
    }
        
    execute(module: MiniModule): void {
        module.files.filter(f => this.excutable(f.type)).forEach(file => {
            try {
                // 将配置挂载到 pluto.assets[模块名]
                const blobUrl = base64ToBlobUrl(file.content, file.type);
                file.blobUrl = blobUrl;
                window.pluto.third.assets[module.name].images.set(file.name, blobUrl);
            } catch (e) {
                console.error(`Error parsing image file ${file.name}:`, e);
            }
        });
    }
}
