export interface IApp {
  start(): void;
}

export const NIApp = {
  kind: Symbol("IApp"),
}