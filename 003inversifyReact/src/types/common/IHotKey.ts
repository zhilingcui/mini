
export type IHotkeyCallback = (e: KeyboardEvent, combo?: string) => any | false;

export interface IHotkeyCallbackConfig {
  callback: IHotkeyCallback;
  modifiers: string[];
  action: string;
  seq?: string;
  level?: number;
  combo?: string;
}

export interface IHotkeyCallbacks {
  [key: string]: IHotkeyCallbackConfig[];
}

export interface IHotkey {
  /**
   * 获取当前快捷键配置
   *
   * @experimental
   * @since v1.1.0
   */
  callbacks: IHotkeyCallbacks;

  /**
   * 绑定快捷键
   * bind hotkey/hotkeys,
   * @param combos 快捷键，格式如：['command + s'] 、['ctrl + shift + s'] 等
   * @param callback 回调函数
   * @param action
   */
  bind(
    combos: string[] | string,
    callback: IHotkeyCallback,
    action?: string
  ): IHotkey;

  activate(activate: boolean): void;
}

export const NIHotkey = {
  kind: Symbol("IHotkey"),
}