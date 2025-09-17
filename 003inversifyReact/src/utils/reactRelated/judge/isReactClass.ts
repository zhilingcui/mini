import { type ComponentClass, Component } from "react";

export function isReactClass(obj: any): obj is ComponentClass<any> {
  if (!obj) {
    return false;
  }
  if (obj.prototype && (obj.prototype.isReactComponent || obj.prototype instanceof Component)) {
    return true;
  }
  return false;
}