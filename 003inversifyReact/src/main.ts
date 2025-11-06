import { init, defaultDiconfig } from "@/frontend/index";
import type { IContainer } from "@/types";

document.addEventListener("DOMContentLoaded", () => {
  init((container: IContainer) => {
    defaultDiconfig(container);
  });
});
