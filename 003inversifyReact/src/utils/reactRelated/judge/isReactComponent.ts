import type { ComponentType } from "react";
import { isReactClass } from "./isReactClass";
import { isForwardRefType } from "./isForwardRefType";
import { isMemoType } from "./isMemoType";

export function isReactComponent(obj: any): obj is ComponentType<any> {
  if (!obj) {
    return false;
  }

  return Boolean(isReactClass(obj) || typeof obj === 'function' || isForwardRefType(obj) || isMemoType(obj));
}