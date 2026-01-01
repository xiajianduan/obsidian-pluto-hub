import PlutoHubPlugin from 'main';
import * as pako from 'pako';
import { ModuleBundle } from 'settings';

export class ModStorage {
    static getPath(plugin: any, id: string): string {
        const configDir = plugin.app.vault.configDir;
        const dir = plugin.settings.moduleStoragePath || `${configDir}/modules`;
        return `${dir}/${id}.bin`;
    }

    static async saveBundle(plugin: any, bundle: ModuleBundle): Promise<void> {
        const path = this.getPath(plugin, bundle.id);
        const adapter = plugin.app.vault.adapter;
        const dir = path.substring(0, path.lastIndexOf('/'));

        if (!(await adapter.exists(dir))) await adapter.mkdir(dir);

        const jsonStr = JSON.stringify(bundle);
        const binary = plugin.settings.usePako 
            ? pako.deflate(jsonStr) 
            : new TextEncoder().encode(jsonStr);
        await adapter.writeBinary(path, binary.buffer);
    }

    static async loadBundle(plugin: any, id: string): Promise<ModuleBundle> {
        const path = this.getPath(plugin, id);
        if (!(await plugin.app.vault.adapter.exists(path))) {
            return { id, files: [{ name: 'main.js', type: 'js', content: '' }] };
        }
        const buffer = await plugin.app.vault.adapter.readBinary(path);
        const uint8 = new Uint8Array(buffer);
        const jsonStr = plugin.settings.usePako 
            ? pako.inflate(uint8, { to: 'string' }) 
            : new TextDecoder().decode(uint8);
        return JSON.parse(jsonStr);
    }
}