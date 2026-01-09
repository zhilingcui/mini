import { isObject } from "@/types";
import type { ReactNode } from "react";
export interface II18nData {
  type: "i18n";
  intl?: ReactNode;
  [key: string]: any;
}

export function isI18nData(obj: any): obj is II18nData {
  if (!isObject(obj)) {
    return false;
  }
  return obj.type === "i18n";
}

export interface IGlobalLocale {
  get locale(): string;
  setLocale(locale: string): void;
  getLocale(): string;
  onChangeLocale(fn: (locale: string) => void): () => void;
  intl(data: II18nData | string, params?: object): ReactNode;
  injectVars(msg: string, params: any, locale: string): string;
  getI18n(
    key: string,
    values?: Record<string, any>,
    locale?: string,
    messages?: Record<string, any>
  ): string;
}

export const NIGlobalLocale = {
  kind: Symbol("IGlobalLocale"),
};