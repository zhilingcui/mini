// 要吧GlobalLocale添加到inversify中，利用inversify中的机制进行通信
import IntlMessageFormat from "intl-messageformat";
import { inject, injectable, optional, postConstruct } from "inversify";
import { computed, observable } from "mobx";
import type { ReactNode } from "react";
import {
  NIWrapperLog,
  type IEventBus,
  type IGlobalLocale,
  type II18nData,
  type IWrapperLog,
  isI18nData,
  NIEventBus,
} from "@/types";

const LowcodeConfigKey = "ali-lowcode-config";
function hasLocalStorage(obj: any): obj is WindowLocalStorage {
  return obj.localStorage;
}

function generateTryLocales(locale: string) {
  const tries = [locale, locale.replace("-", "_")];
  if (locale === "zh-TW" || locale === "en-US") {
    tries.push("zh-CN");
    tries.push("zh_CN");
  } else {
    tries.push("en-US");
    tries.push("en_US");
    if (locale !== "zh-CN") {
      tries.push("zh-CN");
      tries.push("zh_CN");
    }
  }
  return tries;
}

function getConfig(name: string) {
  const win: any = window;
  return (
    win[name] || (win.g_config || {})[name] || (win.pageConfig || {})[name]
  );
}

const languageMap: { [key: string]: string } = {
  en: "en-US",
  zh: "zh-CN",
  zt: "zh-TW",
  es: "es-ES",
  pt: "pt-PT",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  ru: "ru-RU",
  ja: "ja-JP",
  ko: "ko-KR",
  ar: "ar-SA",
  tr: "tr-TR",
  th: "th-TH",
  vi: "vi-VN",
  nl: "nl-NL",
  he: "iw-IL",
  id: "in-ID",
  pl: "pl-PL",
  hi: "hi-IN",
  uk: "uk-UA",
  ms: "ms-MY",
  tl: "tl-PH",
};

@injectable()
export class GlobalLocale implements IGlobalLocale {
  @inject(NIWrapperLog.kind)
  @optional()
  private logger!: IWrapperLog;

  @inject(NIEventBus.kind)
  @optional()
  private emitter!: IEventBus;

  @postConstruct()
  public init() {
    this.emitter.setName("GlobalLocale");
    this.emitter?.setMaxListeners(0);
    this.logger?.setOptions({
      bizName: "GlobalLocale",
      level: "log",
    });
  }

  @observable.ref private _locale?: string;

  @computed get locale() {
    if (this._locale != null) {
      return this._locale;
    }

    // TODO: store 1 & store 2 abstract out as custom implements

    // store 1: config from storage
    let result = null;
    if (hasLocalStorage(window)) {
      const store = window.localStorage;
      let config: any;
      try {
        config = JSON.parse(store.getItem(LowcodeConfigKey) || "");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore;
      }
      if (config?.locale) {
        result = (config.locale || "").replace("_", "-");
        this.logger?.debug(`getting locale from localStorage: ${result}`);
      }
    }
    if (!result) {
      // store 2: config from window
      const localeFromConfig: string = getConfig("locale");
      if (localeFromConfig) {
        result =
          languageMap[localeFromConfig] || localeFromConfig.replace("_", "-");
        this.logger?.debug(`getting locale from config: ${result}`);
      }
    }

    if (!result) {
      // store 3: config from system
      const { navigator } = window as any;
      if (navigator.language) {
        const lang = navigator.language as string;
        return languageMap[lang] || lang.replace("_", "-");
      } else if (navigator.browserLanguage) {
        const it = navigator.browserLanguage.split("-");
        let localeFromSystem = it[0];
        if (it[1]) {
          localeFromSystem += `-${it[1].toUpperCase()}`;
        }
        result = localeFromSystem;
        this.logger?.debug(`getting locale from system: ${result}`);
      }
    }
    if (!result) {
      this.logger?.warn(
        "something when wrong when trying to get locale, use zh-CN as default, please check it out!"
      );
      result = "zh-CN";
    }
    this._locale = result;
    return result;
  }

  setLocale(locale: string) {
    this.logger?.log(`setting locale to ${locale}`);
    if (locale === this.locale) {
      return;
    }
    this._locale = locale;
    if (hasLocalStorage(window)) {
      const store = window.localStorage;
      let config: any;
      try {
        config = JSON.parse(store.getItem(LowcodeConfigKey) || "");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore;
      }

      if (config && typeof config === "object") {
        config.locale = locale;
      } else {
        config = { locale };
      }

      store.setItem(LowcodeConfigKey, JSON.stringify(config));
    }
    this.emitter?.emit("localechange", locale);
  }

  getLocale() {
    return this.locale;
  }

  onChangeLocale(fn: (locale: string) => void): () => void {
    this.emitter?.on("localechange", fn);
    return () => {
      this.emitter?.removeListener("localechange", fn);
    };
  }

  intl(data: II18nData | string, params?: object): ReactNode {
    if (!isI18nData(data)) {
      return data;
    }
    if (data.intl) {
      return data.intl;
    }
    const locale = this.locale;
    const tries = generateTryLocales(locale);
    let msg: string | undefined;
    for (const lan of tries) {
      msg = data[lan];
      if (msg != null) {
        break;
      }
    }
    if (msg == null) {
      return `##intl@${locale}##`;
    }
    return this.injectVars(msg, params, locale);
  }

  injectVars(msg: string, params: any, locale: string): string {
    if (!msg || !params) {
      return msg;
    }
    const formater = new IntlMessageFormat(msg, locale);
    return formater.format(params as any) as string;
  }

  getI18n = (
    key: string,
    values = {},
    locale = "zh-CN",
    messages: Record<string, any> = {}
  ) => {
    this.logger?.debug("getI18n:", key, values, locale, messages);
    if (!messages || !messages[locale] || !messages[locale][key]) {
      return "";
    }
    const formater = new IntlMessageFormat(messages[locale][key], locale);
    return formater.format(values) as string;
  };
}