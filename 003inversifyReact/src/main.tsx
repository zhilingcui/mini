import { init, diConfig } from "./fronted/index";
import type { IContainer } from "@/types";

document.addEventListener("DOMContentLoaded", () => {
  init((container: IContainer) => {
    diConfig(container);
  });
});
