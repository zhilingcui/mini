import { createElement, type ReactNode, type FC } from "react";
import {
  NIGlobalLocale,
  NIIntlMessage,
  NIWrapperLog,
  type IGlobalLocale,
  type IIntlMessage,
  type IIntlMessageManager,
  type IWrapperLog,
} from "@/types";
import {
  inject,
  injectable,
  multiInject,
  optional,
  postConstruct,
} from "inversify";
import _ from "lodash";
import { observer } from "mobx-react";

// 定义IntlElementProps接口
interface IntlElementProps {
  id: string;
  params?: object;
  intlFn: (id: string, params?: object) => string;
}

// 创建observer装饰的函数组件
const IntlElement: FC<IntlElementProps> = observer(({ id, params, intlFn }) => {
  return intlFn(id, params);
});

@injectable()
export class IntlMessageManager implements IIntlMessageManager {
  // 程序运行过程中添加的message
  private _runningMessage: IIntlMessage = {};

  // 合并后的message， 这个合并一个是加载IntlMessageManager的时候合并，一个是add的时候合并
  private message: IIntlMessage = {};

  // inversify注入的intlMessage
  @multiInject(NIIntlMessage.kind)
  @optional()
  private intlMessages!: IIntlMessage[];

  @inject(NIGlobalLocale.kind)
  @optional()
  private globalLocale!: IGlobalLocale;

  @inject(NIWrapperLog.kind)
  @optional()
  private logger!: IWrapperLog;

  @postConstruct()
  public init() {
    this.logger?.setOptions({
      bizName: "IntlMessageManager",
      level: "log",
    });
    if (this.intlMessages && this.intlMessages.length > 0) {
      this.message = this.mergeMessage(...this.intlMessages);
    }
  }

  // 编写一个工具类吧，合并message
  private mergeMessage(...messages: IIntlMessage[]): IIntlMessage {
    const _message = _.merge({}, ...messages);
    return _message;
  }

  // 添加国际化消息
  addIntl(message: IIntlMessage, cover?: boolean): void {
    if (!message) return;

    this.logger?.debug("addIntl:", message, cover);

    // 合并新消息到运行时消息中
    if (cover) {
      // 如果cover为true，直接覆盖
      this._runningMessage = this.mergeMessage(this._runningMessage, message);
    } else {
      // 否则只添加不存在的key
      for (const locale in message) {
        if (!this._runningMessage[locale]) {
          this._runningMessage[locale] = message[locale];
        } else {
          for (const key in message[locale]) {
            if (!this._runningMessage[locale][key]) {
              this._runningMessage[locale][key] = message[locale][key];
            } else {
              this.logger?.warn(
                `Intl key ${key} already exists in locale ${locale}, skipping`
              );
            }
          }
        }
      }
    }

    // 重新合并所有消息
    if (this.intlMessages && this.intlMessages.length > 0) {
      if (cover) {
        // 覆盖模式下，运行时消息优先级高
        this.message = this.mergeMessage(
          ...this.intlMessages,
          this._runningMessage
        );
      } else {
        // 非覆盖模式下，注入消息优先级高
        this.message = this.mergeMessage(
          this._runningMessage,
          ...this.intlMessages
        );
      }
    } else {
      this.message = this._runningMessage;
    }
  }

  // 获取国际化字符串
  intl(key: string, params?: object): string {
    if (!key) return "";

    const locale = this.globalLocale?.locale || "zh-CN";
    this.logger?.debug("intl:", key, params, locale);

    // 查找对应locale下的消息
    if (this.message[locale] && this.message[locale][key]) {
      const msg = this.message[locale][key];
      return this.globalLocale?.injectVars(msg, params, locale) || msg;
    }

    this.logger?.warn(`Intl key ${key} not found in locale ${locale}`);
    return "";
  }

  // 获取国际化React节点
  intlNode(id: string, params?: object): ReactNode {
    // 使用外部定义的IntlElement组件，支持mobx observable参数的自动更新
    return createElement(IntlElement, { id, params, intlFn: this.intl.bind(this) });
  }
}