// Code from https://github.com/valentine195/obsidian-admonition/blob/master/src/lang/helpers.ts

import { moment } from 'obsidian';

import en from '../i18n/en';
import zhCN from '../i18n/zh-cn';

const localeMap: { [k: string]: Partial<typeof en> } = {
	en,
	'zh-cn': zhCN,
};

const locale = localeMap[moment.locale()];

export function t(str: keyof typeof en): string {
	// @ts-ignore
	return (locale && locale[str]) || en[str];
}

export function ts(str: string): string {
	// @ts-ignore
	return ((locale && locale[str]) || en[str]) as string;
}