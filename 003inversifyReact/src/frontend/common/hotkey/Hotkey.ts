import type { IHotkey, IHotkeyCallback, IHotkeyCallbackConfig, IHotkeyCallbacks } from "@/types";
import { injectable } from "inversify";
import { isEqual } from "lodash";

interface HotkeyDirectMap {
  [key: string]: IHotkeyCallback;
}

interface SequenceLevels {
  [key: string]: number;
}

interface KeyInfo {
  key: string;
  modifiers: string[];
  action: string;
}

interface CtrlKeyMap {
  [key: string]: string;
}

interface KeyMap {
  [key: number]: string;
}

interface ActionEvent {
  type: string;
}

interface KeypressEvent extends KeyboardEvent {
  type: 'keypress';
}

const SPECIAL_ALIASES: CtrlKeyMap = {
  option: 'alt',
  command: 'meta',
  return: 'enter',
  escape: 'esc',
  plus: '+',
  mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl',
};

const MAP: KeyMap = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta',
};

const KEYCODE_MAP: KeyMap = {
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  186: ';',
  187: '=',
  188: ',',
  189: '-',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'",
};

const SHIFT_MAP: CtrlKeyMap = {
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  '+': '=',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
  '|': '\\',
};

let REVERSE_MAP: CtrlKeyMap;


/**
 * checks if two arrays are equal
 */
function modifiersMatch(modifiers1: string[], modifiers2: string[]): boolean {
  return modifiers1.sort().join(',') === modifiers2.sort().join(',');
}

/**
 * takes a key event and figures out what the modifiers are
 */
function eventModifiers(e: KeyboardEvent): string[] {
  const modifiers = [];

  if (e.shiftKey) {
    modifiers.push('shift');
  }

  if (e.altKey) {
    modifiers.push('alt');
  }

  if (e.ctrlKey) {
    modifiers.push('ctrl');
  }

  if (e.metaKey) {
    modifiers.push('meta');
  }

  return modifiers;
}

/**
 * 获取事件并返回关键字符
 */
function characterFromEvent(e: KeyboardEvent): string {
  const keyCode = e.keyCode || e.which;
  // 对于按键事件，我们应该原样返回字符。
  if (e.type === 'keypress') {
    let character = String.fromCharCode(keyCode);
    // 如果未按下 Shift 键，那么可以安全地假定我们想要输入小写字母。
    // 这意味着，如果您不小心打开了大写锁定，
    // 您的按键绑定仍会正常工作。
    //
    // 唯一可能不希望出现的副作用是，
    // 如果您绑定类似“A”的键，
    // 因为您希望在按下大写字母 A 时触发事件，
    // 那么此时大写锁定将不再触发该事件。
    // 不过，Shift + A 还是会触发。
    if (!e.shiftKey) {
      character = character.toLowerCase();
    }
    return character;
  }
  // for non keypress events the special maps are needed
  if (MAP[keyCode]) {
    return MAP[keyCode];
  }
  if (KEYCODE_MAP[keyCode]) {
    return KEYCODE_MAP[keyCode];
  }
  // if it is not in the special map
  // with keydown and keyup events the character seems to always
  // come in as an uppercase character whether you are pressing shift
  // or not.  we should make sure it is always lowercase for comparisons
  // tips: Q29weXJpZ2h0IChjKSAyMDIwLXByZXNlbnQgQWxpYmFiYSBJbmMuIFYy
  return String.fromCharCode(keyCode).toLowerCase();
}

/**
 * 实际上调用了回调函数
 *
 * 如果您的回调函数返回 false，这将遵循 jQuery 的约定——阻止事件的默认行为并停止事件传播。
 */
function fireCallback(callback: IHotkeyCallback, e: KeyboardEvent, combo?: string): void {
  if (callback(e, combo) === false) {
    e.preventDefault();
    e.stopPropagation();
  }
}

/**
 * Converts from a string key combination to an array
 *
 * @param  {string} combination like "command+shift+l"
 * @return {Array}
 */
function keysFromString(combination: string): string[] {
  if (combination === '+') {
    return ['+'];
  }

  combination = combination.replace(/\+{2}/g, '+plus');
  return combination.split('+');
}


/**
 * determines if the keycode specified is a modifier key or not
 * 确定指定的键码是否为修饰键。
 */
function isModifier(key: string): boolean {
  return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta';
}

/**
 * reverses the map lookup so that we can look for specific keys
 * to see what can and can't use keypress
 * 反转了映射查找，这样我们就可以查找特定的键，以查看哪些可以使用按键操作，哪些不可以。
 * @return {Object}
 */
function getReverseMap(): CtrlKeyMap {
  if (!REVERSE_MAP) {
    REVERSE_MAP = {};
    for (const key in MAP) {
      // pull out the numeric keypad from here cause keypress should
      // be able to detect the keys from the character
      // 从这里拔出数字小键盘，因为按键操作应该能够检测到字符键。
      if (Number(key) > 95 && Number(key) < 112) {
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(MAP, key)) {
        REVERSE_MAP[MAP[key]] = key;
      }
    }
  }
  return REVERSE_MAP;
}

/**
 * picks the best action based on the key combination
 * 根据按键组合选择最佳操作
 */
function pickBestAction(key: string, modifiers: string[], action?: string): string {
  // if no action was picked in we should try to pick the one
  // that we think would work best for this key
  if (!action) {
    action = getReverseMap()[key] ? 'keydown' : 'keypress';
  }
  // modifier keys don't work as expected with keypress,
  // switch to keydown
  if (action === 'keypress' && modifiers.length) {
    action = 'keydown';
  }
  return action;
}


/**
 * Gets info for a specific key combination
 * 获取特定组合键的信息
 *
 * @param combination key combination ("command+s" or "a" or "*")
 */
function getKeyInfo(combination: string, action?: string): KeyInfo {
  let keys: string[] = [];
  let key = '';
  let i: number;
  const modifiers: string[] = [];

  // take the keys from this pattern and figure out what the actual
  // pattern is all about
  keys = keysFromString(combination);

  for (i = 0; i < keys.length; ++i) {
    key = keys[i];

    // normalize key names
    if (SPECIAL_ALIASES[key]) {
      key = SPECIAL_ALIASES[key];
    }

    // if this is not a keypress event then we should
    // be smart about using shift keys
    // this will only work for US keyboards however
    if (action && action !== 'keypress' && SHIFT_MAP[key]) {
      key = SHIFT_MAP[key];
      modifiers.push('shift');
    }

    // if this key is a modifier then add it to the list of modifiers
    if (isModifier(key)) {
      modifiers.push(key);
    }
  }

  // depending on what the key combination is
  // we will try to pick the best event for it
  action = pickBestAction(key, modifiers, action);

  return {
    key,
    modifiers,
    action,
  };
}

function isPressEvent(e: KeyboardEvent | ActionEvent): e is KeypressEvent {
  return e.type === 'keypress';
}

@injectable()
export class Hotkey implements IHotkey {
  callbacks: IHotkeyCallbacks = {};

  private directMap: HotkeyDirectMap = {};

  private sequenceLevels: SequenceLevels = {};

  private resetTimer = 0;

  private ignoreNextKeyup: boolean | string = false;

  private ignoreNextKeypress = false;

  private nextExpectedAction: boolean | string = false;

  private isActivate = true;

  constructor() {
    this.mount(window);
  }

  activate(activate: boolean): void {
    this.isActivate = activate;
  }

  mount(window: Window) {
    const { document } = window;
    const handleKeyEvent = this.handleKeyEvent.bind(this);
    document.addEventListener('keypress', handleKeyEvent, false);
    document.addEventListener('keydown', handleKeyEvent, false);
    document.addEventListener('keyup', handleKeyEvent, false);
    return () => {
      document.removeEventListener('keypress', handleKeyEvent, false);
      document.removeEventListener('keydown', handleKeyEvent, false);
      document.removeEventListener('keyup', handleKeyEvent, false);
    };
  }

  bind(combos: string[] | string, callback: IHotkeyCallback, action?: string): IHotkey {
    this.bindMultiple(Array.isArray(combos) ? combos : [combos], callback, action);
    return this;
  }

  unbind(combos: string[] | string, callback: IHotkeyCallback, action?: string) {
    const combinations = Array.isArray(combos) ? combos : [combos];
    combinations.forEach(combination => {
      const info: KeyInfo = getKeyInfo(combination, action);
      const { key, modifiers } = info;
      const idx = this.callbacks[key].findIndex(info => {
        return isEqual(info.modifiers, modifiers) && info.callback === callback;
      });
      if (idx !== -1) {
        this.callbacks[key].splice(idx, 1);
      }
    });
  }

  /**
   * resets all sequence counters except for the ones passed in
   * 重置所有序列计数器，但传入的那些除外
   */
  private resetSequences = (doNotReset?: SequenceLevels): void => {
    // doNotReset = doNotReset || {};
    let activeSequences = false;
    let key = '';
    for (key in this.sequenceLevels) {
      if (doNotReset && doNotReset[key]) {
        activeSequences = true;
      } else {
        this.sequenceLevels[key] = 0;
      }
    }
    if (!activeSequences) {
      this.nextExpectedAction = false;
    }
  }

  /**
   * finds all callbacks that match based on the keycode, modifiers,
   * and action
   * 根据按键码、修饰符和操作查找所有匹配的回调函数
   */
  private getMatches(
    character: string,
    modifiers: string[],
    e: KeyboardEvent | ActionEvent,
    sequenceName?: string,
    combination?: string,
    level?: number,
  ): IHotkeyCallbackConfig[] {
    let i: number;
    let callback: IHotkeyCallbackConfig;
    const matches: IHotkeyCallbackConfig[] = [];
    const action: string = e.type;

    // if there are no events related to this keycode
    if (!this.callbacks[character]) {
      return [];
    }

    // if a modifier key is coming up on its own we should allow it
    if (action === 'keyup' && isModifier(character)) {
      modifiers = [character];
    }

    // loop through all callbacks for the key that was pressed
    // and see if any of them match
    // 遍历所有与按下的键对应的回调函数，查看其中是否有匹配的。
    for (i = 0; i < this.callbacks[character].length; ++i) {
      callback = this.callbacks[character][i];

      // if a sequence name is not specified, but this is a sequence at
      // the wrong level then move onto the next match
      // 如果没有指定序列名称，但这是一个错误的序列级别，那么就继续下一个匹配。
      if (!sequenceName && callback.seq && this.sequenceLevels[callback.seq] !== callback.level) {
        continue;
      }

      // if the action we are looking for doesn't match the action we got
      // then we should keep going
      // 如果我们正在寻找的动作与我们得到的动作不匹配，那么我们就应该继续。
      if (action !== callback.action) {
        continue;
      }

      // if this is a keypress event and the meta key and control key
      // are not pressed that means that we need to only look at the
      // character, otherwise check the modifiers as well
      // 如果这是一个按键事件，
      // 且没有按下元键和控制键，
      // 那就意味着我们只需查看字符，否则也要检查修饰键。
      //
      // chrome will not fire a keypress if meta or control is down
      // safari will fire a keypress if meta or meta+shift is down
      // firefox will fire a keypress if meta or control is down
      if ((isPressEvent(e) && !e.metaKey && !e.ctrlKey) || modifiersMatch(modifiers, callback.modifiers)) {
        const deleteCombo = !sequenceName && callback.combo === combination;
        const deleteSequence = sequenceName && callback.seq === sequenceName && callback.level === level;
        if (deleteCombo || deleteSequence) {
          this.callbacks[character].splice(i, 1);
        }

        matches.push(callback);
      }
    }
    return matches;
  }

  private handleKey(character: string, modifiers: string[], e: KeyboardEvent): void {
    const callbacks: IHotkeyCallbackConfig[] = this.getMatches(character, modifiers, e);
    let i: number;
    const doNotReset: SequenceLevels = {};
    let maxLevel = 0;
    let processedSequenceCallback = false;

    // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
    for (i = 0; i < callbacks.length; ++i) {
      if (callbacks[i].seq) {
        maxLevel = Math.max(maxLevel, callbacks[i].level || 0);
      }
    }

    // loop through matching callbacks for this key event
    for (i = 0; i < callbacks.length; ++i) {
      // fire for all sequence callbacks
      // this is because if for example you have multiple sequences
      // bound such as "g i" and "g t" they both need to fire the
      // callback for matching g cause otherwise you can only ever
      // match the first one
      if (callbacks[i].seq) {
        // only fire callbacks for the maxLevel to prevent
        // subsequences from also firing
        //
        // for example 'a option b' should not cause 'option b' to fire
        // even though 'option b' is part of the other sequence
        //
        // any sequences that do not match here will be discarded
        // below by the resetSequences call
        if (callbacks[i].level !== maxLevel) {
          continue;
        }

        processedSequenceCallback = true;

        // keep a list of which sequences were matches for later
        doNotReset[callbacks[i].seq || ''] = 1;
        fireCallback(callbacks[i].callback, e, callbacks[i].combo);
        continue;
      }

      // if there were no sequence matches but we are still here
      // that means this is a regular match so we should fire that
      if (!processedSequenceCallback) {
        fireCallback(callbacks[i].callback, e, callbacks[i].combo);
      }
    }

    const ignoreThisKeypress = e.type === 'keypress' && this.ignoreNextKeypress;
    if (e.type === this.nextExpectedAction && !isModifier(character) && !ignoreThisKeypress) {
      this.resetSequences(doNotReset);
    }

    this.ignoreNextKeypress = processedSequenceCallback && e.type === 'keydown';
  }

  private handleKeyEvent(e: KeyboardEvent): void {
    if (!this.isActivate) {
      return;
    }
    const character = characterFromEvent(e);

    // no character found then stop
    if (!character) {
      return;
    }

    // need to use === for the character check because the character can be 0
    if (e.type === 'keyup' && this.ignoreNextKeyup === character) {
      this.ignoreNextKeyup = false;
      return;
    }

    this.handleKey(character, eventModifiers(e), e);
  }

  private resetSequenceTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.resetTimer = window.setTimeout(this.resetSequences, 1000);
  }

  private bindSequence(combo: string, keys: string[], callback: IHotkeyCallback, action?: string): void {
    // const self: any = this;
    this.sequenceLevels[combo] = 0;
    const increaseSequence = (nextAction: string) => {
      return () => {
        this.nextExpectedAction = nextAction;
        ++this.sequenceLevels[combo];
        this.resetSequenceTimer();
      };
    };
    const callbackAndReset = (e: KeyboardEvent): void => {
      fireCallback(callback, e, combo);

      if (action !== 'keyup') {
        this.ignoreNextKeyup = characterFromEvent(e);
      }

      setTimeout(this.resetSequences, 10);
    };
    for (let i = 0; i < keys.length; ++i) {
      const isFinal = i + 1 === keys.length;
      const wrappedCallback = isFinal ? callbackAndReset : increaseSequence(action || getKeyInfo(keys[i + 1]).action);
      this.bindSingle(keys[i], wrappedCallback, action, combo, i);
    }
  }

  private bindSingle(
    combination: string,
    callback: IHotkeyCallback,
    action?: string,
    sequenceName?: string,
    level?: number,
  ): void {
    // 存储一个直接映射的引用，以便与 HotKey.trigger 一起使用。
    this.directMap[`${combination}:${action}`] = callback;

    // 确保连续的多个空格变成一个空格。
    combination = combination.replace(/\s+/g, ' ');

    const sequence: string[] = combination.split(' ');

    // 如果此模式是一系列按键，则通过此方法逐个按键重新处理每个模式。
    if (sequence.length > 1) {
      this.bindSequence(combination, sequence, callback, action);
      return;
    }

    const info: KeyInfo = getKeyInfo(combination, action);

    // make sure to initialize array if this is the first time
    // a callback is added for this key
    this.callbacks[info.key] = this.callbacks[info.key] || [];

    // remove an existing match if there is one
    this.getMatches(info.key, info.modifiers, { type: info.action }, sequenceName, combination, level);

    // add this call back to the array
    // if it is a sequence put it at the beginning
    // if not put it at the end
    //
    // this is important because the way these are processed expects
    // the sequence ones to come first
    this.callbacks[info.key][sequenceName ? 'unshift' : 'push']({
      callback,
      modifiers: info.modifiers,
      action: info.action,
      seq: sequenceName,
      level,
      combo: combination,
    });
  }

  private bindMultiple(combinations: string[], callback: IHotkeyCallback, action?: string) {
    for (const item of combinations) {
      this.bindSingle(item, callback, action);
    }
  }
}