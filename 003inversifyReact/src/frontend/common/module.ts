import { ContainerModule } from "inversify";
import { NIHotkey, NIWrapperLog } from "@/types";
import type { IHotkey, IWrapperLog } from "@/types";
import { Hotkey } from "./hotkey/Hotkey";
import { WrapperLog } from "./wrapperLog/WrapperLog";

export const commonModule = new ContainerModule((bind) => {
  bind<IWrapperLog>(NIWrapperLog.kind).to(WrapperLog);
  bind<IHotkey>(NIHotkey.kind).to(Hotkey).inSingletonScope();
});
