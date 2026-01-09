
// 编写对国际化语言支持的接口
// 这个接口内的message来源于两个部分，
// 一个是inversify的注入, 一个是程序运行过程中添加的支持
// 它里边就应该存在所有的国际化语言的映射
// 它的语言来源于globalLocale,这是
// 只抛出两个方法，一个是生成react节点，一个是返回字符串
// react节点和字符串的不同是，对于react节点，如果传入的参数是mobx observable，

import type { ReactNode } from "react";

export interface IIntlMessage {
  // 第一个参数对应的是哪种国际化语言，比如 zh-CN、en-US
  // 它的值是一个对象，这个对象中，存在这各个语言对应的key-value对
  // 我们需要设置一个默认语言作为主语言，如果其他语言不存在的话，使用主语言。
  // 同样的，当添加语言的时候，需要确认一下主语言中是否存在，如果不存在，主语言需要添加
  [key: string]: Record<string, string>;
}

export const NIIntlMessage = {
  kind: Symbol("IIntlMessage"),
};

// 那么它会自动监听变化，当变化时，会自动更新节点
export interface IIntlMessageManager {
  intlNode(id: string, params?: object): ReactNode;
  intl(key: string, params?: object): string
  // 如果要添加一个新的国际化语言，那么它应该添加的是一个对象，
  // 这个对象中，存在这各个语言对应的key-value对
  // 这里只添加，不删除
  // 如果cover为true，那么会覆盖掉已经存在的语言, 默认不覆盖，日志打印已存在
  addIntl(message:IIntlMessage, cover?: boolean): void;
}

export const NIIntlMessageManager = {
  kind: Symbol("IIntlMessageManager"),
};
