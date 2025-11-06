import { init, IgniterModule } from "@/frontend";
import { NIAppWorkspace, type IContainer, type IAppWorkspace } from "@/types";
import { ContainerModule, type Container } from "inversify";
import { AppWorkspace } from "./AppWorkspace";

const module = new ContainerModule((bind) => {
	bind<IAppWorkspace>(NIAppWorkspace.kind).to(AppWorkspace);
});


function diConfig(container: Container) {
  container.load(IgniterModule);
  container.load(module);
}

document.addEventListener("DOMContentLoaded", () => {
  init((container: IContainer) => {
    diConfig(container);
  });
});
