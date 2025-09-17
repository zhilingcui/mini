import { ContainerModule } from "inversify";
import { WrapperLog } from "./wrapperLog/WrapperLog";
import { NIHotkey, NIWrapperLog } from "@/types";
import type { IHotkey, IWrapperLog } from "@/types";
import { Hotkey } from "./hotkey/Hotkey";

export const commonModule = new ContainerModule(({ bind }) => {
  bind<IWrapperLog>(NIWrapperLog.kind).to(WrapperLog);
  bind<IHotkey>(NIHotkey.kind).to(Hotkey).inSingletonScope();
});
