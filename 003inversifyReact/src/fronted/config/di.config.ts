import { Container } from "inversify";
import { IgniterModule } from "../reactApp/module";

export default function diConfig(container: Container) {
  container.load(IgniterModule);
}