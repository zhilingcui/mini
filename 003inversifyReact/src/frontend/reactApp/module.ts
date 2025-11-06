import { NIIgniter, type IIgniter } from "@/types";
import { ContainerModule } from "inversify";
import { Igniter } from "./Igniter";

export const IgniterModule = new ContainerModule((bind) => {
	bind<IIgniter>(NIIgniter.kind).to(Igniter);
});
