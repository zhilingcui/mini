export interface IAppWorkspace {
  render(props?: any): React.FunctionComponentElement<any>;
}

export const NIAppWorkspace = {
  kind: Symbol("IAppWorkspace"),
}

