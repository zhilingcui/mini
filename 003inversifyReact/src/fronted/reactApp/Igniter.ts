import "./index.css";
import { injectable } from "inversify";
import type { IContainer, IIgniter } from "@/types";
import { renderApp } from "./main";

@injectable()
export class Igniter implements IIgniter{
  render(container?: IContainer): void {
    renderApp(container);
  }
}
