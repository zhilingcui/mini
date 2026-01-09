import { init, IgniterModule } from "@/fronted";
import { NIAppWorkspace, NIIntlMessage, type IContainer, type IAppWorkspace, type IIntlMessage } from "@/types";
import { ContainerModule, type Container } from "inversify";
import { AppWorkspace } from "./AppWorkspace";

// 示例国际化消息 - 依赖注入方式
const sampleIntlMessage: IIntlMessage = {
  "zh-CN": {
    "welcome": "【注入】欢迎来到系统",
    "hello": "【注入】你好, {name}!",
    "button.save": "保存",
    "button.cancel": "取消",
    "menu.dashboard": "仪表盘",
    "menu.settings": "设置",
    "common.success": "操作成功",
    "common.error": "操作失败"
  },
  "en-US": {
    "welcome": "[Injected] Welcome to the system",
    "hello": "[Injected] Hello, {name}!",
    "button.save": "Save",
    "button.cancel": "Cancel",
    "menu.dashboard": "Dashboard",
    "menu.settings": "Settings",
    "common.success": "Operation succeeded",
    "common.error": "Operation failed"
  }
};

const module = new ContainerModule((bind) => {
	bind<IAppWorkspace>(NIAppWorkspace.kind).to(AppWorkspace);
  // 注册IIntlMessage类型
  bind<IIntlMessage>(NIIntlMessage.kind).toConstantValue(sampleIntlMessage);
});


async function diConfig(container: Container) {
  container.load(IgniterModule);
  container.load(module);
}

document.addEventListener("DOMContentLoaded", () => {
  init(async (container: IContainer) => {
    await diConfig(container);
  });
});