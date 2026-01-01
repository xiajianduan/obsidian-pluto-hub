export {}; // 使文件成为模块
import { App } from "obsidian";

declare global {

  export interface Window {
    pluto: Pluto;
    quickAddApi: any;
  }

  export interface Pluto {
    dv: null;
    rc: null;
    modules: object;
    qa: any;
  }
}

