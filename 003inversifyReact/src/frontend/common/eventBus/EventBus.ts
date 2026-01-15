import { NIWrapperLog, type IEventBus, type IWrapperLog } from "@/types";
import EventEmitter from "events";
import { inject, injectable, optional, postConstruct } from "inversify";

@injectable()
export class EventBus implements IEventBus {
  @inject(NIWrapperLog.kind)
  @optional()
  public logger!: IWrapperLog;

  private readonly eventEmitter: EventEmitter = new EventEmitter();
  private name?: string;

  /**
   * 内核触发的事件名
   */
  readonly names = [];

  @postConstruct()
  public init() {
    this.logger?.setOptions({
      level: "log",
      bizName: "eventBus",
    });
  }

  // 设置事件名
  setName(name: string) {
    this.name = name;
    this.logger?.setOptions({
      level: "log",
      bizName: name ? "module-event-bus" : "event-bus",
    });
  }

  private getMsgPrefix(type: string): string {
    if (this.name && this.name.length > 0) {
      return `[${this.name}][event-${type}]`;
    } else {
      return `[*][event-${type}]`;
    }
  }

  /**
   * 监听事件
   * @param event 事件名称
   * @param listener 事件回调
   */
  on(event: string, listener: (...args: any[]) => void): () => void {
    this.eventEmitter.on(event, listener);
    this.logger?.debug(`${this.getMsgPrefix("on")} ${event}`);
    return () => {
      this.off(event, listener);
    };
  }

  prependListener(
    event: string,
    listener: (...args: any[]) => void
  ): () => void {
    this.eventEmitter.prependListener(event, listener);
    this.logger?.debug(`${this.getMsgPrefix("prependListener")} ${event}`);
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * 取消监听事件
   * @param event 事件名称
   * @param listener 事件回调
   */
  off(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.off(event, listener);
    this.logger?.debug(`${this.getMsgPrefix("off")} ${event}`);
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   * @returns
   */
  emit(event: string, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
    this.logger?.debug(
      `${this.getMsgPrefix("emit")} name: ${event}, args: `,
      ...args
    );
  }

  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): any {
    return this.eventEmitter.removeListener(event, listener);
  }

  addListener(event: string | symbol, listener: (...args: any[]) => void): any {
    return this.eventEmitter.addListener(event, listener);
  }

  setMaxListeners(n: number): any {
    return this.eventEmitter.setMaxListeners(n);
  }
  removeAllListeners(event?: string | symbol): any {
    return this.eventEmitter.removeAllListeners(event);
  }
}