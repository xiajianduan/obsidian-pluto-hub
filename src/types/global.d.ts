export {}; // 使文件成为模块
import { App } from "obsidian";

declare global {

  export interface Window {
    pluto: any;
    quickAddApi: any;
  }
}

