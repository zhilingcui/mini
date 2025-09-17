const hasSymbol = typeof Symbol === 'function' && Symbol.for;
export const REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
export function isMemoType(obj: any): boolean {
  if (!obj || !obj?.$$typeof) {
    return false;
  }
  return obj.$$typeof === REACT_MEMO_TYPE;
}