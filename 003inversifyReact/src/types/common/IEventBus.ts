import type { IDisposablePattern } from "..";

export interface IEventBus {
  setName(name: string): void;

  /**
   * 监听事件
   * add monitor to a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  on(event: string, listener: (...args: any[]) => void): IDisposablePattern;

  /**
   * 监听事件，会在其他回调函数之前执行
   * add monitor to a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  prependListener(event: string, listener: (...args: any[]) => void): IDisposablePattern;

  /**
   * 取消监听事件
   * cancel a monitor from a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  off(event: string, listener: (...args: any[]) => void): void;

  /**
   * 触发事件
   * emit a message for a event
   * @param event 事件名称
   * @param args 事件参数
   * @returns
   */
  emit(event: string, ...args: any[]): void;
  removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
  addListener(event: string | symbol, listener: (...args: any[]) => void): any;
  setMaxListeners(n: number): any;
  removeAllListeners(event?: string | symbol): any;
}

export const NIEventBus = {
  kind: Symbol("IEventBus"),
}