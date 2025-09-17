export type ILogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';
export interface ILogOptions {
  level: ILogLevel;
  bizName: string;
}
export interface IWrapperLog {
  setOptions(options: ILogOptions): void;
  log: (...data: any[]) => void;
  info: (...data: any[]) => void;
  error: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  debug: (...data: any[]) => void;
}

export const NIWrapperLog = {
  kind: Symbol("IWrapperLog"),
}