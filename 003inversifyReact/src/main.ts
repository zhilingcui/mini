import { init, defaultDiconfig } from "@/fronted/index";
import type { IContainer } from "@/types";

document.addEventListener("DOMContentLoaded", () => {
  init((container: IContainer) => {
    defaultDiconfig(container);
  });
});
