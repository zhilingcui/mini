import type { IContainer } from "./IContainer";

export interface IIgniter {
  render(container?: IContainer): void;
}

export const NIIgniter = {
  kind: Symbol("IIgniter"),
}

