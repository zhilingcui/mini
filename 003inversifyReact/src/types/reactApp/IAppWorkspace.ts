export interface IAppWorkspace {
  render(props?: any): React.ReactNode;
}

export const NIAppWorkspace = {
  kind: Symbol("IAppWorkspace"),
}

