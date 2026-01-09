import { type IAppWorkspace } from "@/types";

import { injectable } from "inversify";
import { createElement } from "react";
import { AppWorkspaceView } from "./AppWorkspaceView";

@injectable()
export class AppWorkspace implements IAppWorkspace {
  render(props?: any): React.ReactNode {
    return createElement(AppWorkspaceView, props);
  }
}
