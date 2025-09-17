import { Container } from "inversify"

export type IContainer = Container

export const NIContainer = {
  kind: Symbol("IContainer"),
}
