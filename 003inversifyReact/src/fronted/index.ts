import {
  Container,
  inject,
  injectable,
  optional,
  postConstruct,
} from "inversify";
import "reflect-metadata";
import { NIApp, NIContainer, NIIgniter, NIWrapperLog } from "@/types";
import type { IApp, IContainer, IIgniter, IWrapperLog } from "@/types";
import { commonModule } from "./common";
import defaultDiconfig from "./config/di.config.ts";
// 添加低代码模拟的注入

// 使用依赖注入
@injectable()
class App implements IApp {
  @inject(NIWrapperLog.kind)
  @optional()
  public logger!: IWrapperLog;

  @inject(NIIgniter.kind)
  @optional()
  public igniter!: IIgniter;

  @postConstruct()
  public init() {
    this.logger?.setOptions({
      level: "log",
      bizName: "app",
    });
  }

  start(container?: Container): void {
    this.logger?.debug("App started!");
    this.igniter?.render(container);
  }
}

// 我感觉初始的时候有一个入口函数就可以了，调用入口函数的时候开始，然后返回一个destroy函数，用来销毁实例。
// 这里的init可以编写一个参数函数，这个函数可以往容器中进行注入
export function init(injectFunc?: (container: Container) => void) {
  const container = new Container();
  // 将container以常量的方式注入
  container.bind<IContainer>(NIContainer.kind).toConstantValue(container);
  container.bind<App>(NIApp.kind).to(App);
  container.load(commonModule);
  if (injectFunc) {
    injectFunc(container);
  } else {
    defaultDiconfig(container);
  }
  const app = container.get<App>(NIApp.kind);
  app.start(container);
  // 销毁container
  return () => container.unbindAll();
}

// 导出所有的模块类相关的注入类
export { defaultDiconfig };
export * from "./common";
export * from "./reactApp";
