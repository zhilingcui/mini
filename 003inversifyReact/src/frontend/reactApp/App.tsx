import { useEffect } from "react";
import { useOptionalInjection } from "inversify-react";
import { NIAppWorkspace, NIWrapperLog } from "@/types";
import type { IAppWorkspace, IWrapperLog } from "@/types";

function App() {
  const wrapperLog: IWrapperLog | undefined = useOptionalInjection(
    NIWrapperLog.kind
  );
  const appWorkspace: IAppWorkspace | undefined = useOptionalInjection(
    NIAppWorkspace.kind
  );
  useEffect(() => {
    if (wrapperLog) {
      wrapperLog.setOptions({
        level: "log",
        bizName: "app",
      });
      wrapperLog.debug("App component rendered");
    }
    return () => {
      if (wrapperLog) {
        wrapperLog.debug("App component unmounted");
      }
    };
  }, [wrapperLog]);
  return <>{appWorkspace && appWorkspace.render()}</>;
}

export default App;
