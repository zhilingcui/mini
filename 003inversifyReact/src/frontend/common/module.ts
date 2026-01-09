import { ContainerModule } from "inversify";
import { NIEventBus, NIGlobalLocale, NIHotkey, NIIntlMessageManager, NIWrapperLog } from "@/types";
import type { IEventBus, IGlobalLocale, IHotkey, IIntlMessageManager, IWrapperLog } from "@/types";
import { Hotkey } from "./hotkey/Hotkey";
import { WrapperLog } from "./wrapperLog/WrapperLog";
import { EventBus } from "./eventBus/EventBus";
import { GlobalLocale } from "./globalLocale/GlobalLocale";
import { IntlMessageManager } from "./globalLocale/IntlMessageManager";

export const commonModule = new ContainerModule((bind) => {
  bind<IWrapperLog>(NIWrapperLog.kind).to(WrapperLog);
  bind<IEventBus>(NIEventBus.kind).to(EventBus);
  bind<IHotkey>(NIHotkey.kind).to(Hotkey).inSingletonScope();
  bind<IGlobalLocale>(NIGlobalLocale.kind).to(GlobalLocale).inSingletonScope();
  bind<IIntlMessageManager>(NIIntlMessageManager.kind).to(IntlMessageManager).inSingletonScope();
});
