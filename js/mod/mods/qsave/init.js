import maginai from 'maginai';

const logger = maginai.logging.getLogger('plustalk');
const pt = maginai.patcher;

let isViewAbilityBlocked = false;

class ShortcutKeyInterrupter {
  constructor() {
    /** @type {Record<string, Function>}*/
    this.handlers = {};
  }
  blockViewAbility() {
    isViewAbilityBlocked = true;
  }

  end() {
    const grm = tWgm.tGameRoutineMap;
    isViewAbilityBlocked = false;
    grm.setFrameAction(tWgm);
    grm.player.isDash = false;
    grm.isAction = false;
  }

  /**
   * 追加キー処理のため無効化していたtGameMenu.viewSkillを有効化する
   * 追加キー処理の中でviewSkillにアクセスしたいときに呼ぶ
   */
  recoverViewAbility() {
    isViewAbilityBlocked = false;
  }

  patchViewSkill() {
    pt.patchMethod(tGameMenu, 'viewSkill', (origMethod) => {
      const rtnFn = function (...args) {
        if (isViewAbilityBlocked) return;

        return origMethod.call(this, ...args);
      };
      return rtnFn;
    });
  }

  /**
   * 追加キーのclickイベントハンドラの登録
   * @param {string} keyCode
   * @param {(end: () => void, recoverViewAbility: () => void) =>void} fn ハンドラー
   *    処理の終わりに必ず第一引数のend()関数を呼ぶべき（呼ばない場合フリーズ）
   */
  addHandler(keyCode, fn) {
    const keyList = ['f1', 'f2', 'f3', 'f4'];
    if (!keyList.includes(keyCode)) {
      throw new Error(`キーは次のうちの1つである必要があります: [${keyList}]`);
    }
    this.handlers[keyCode] = fn;
  }

  patchIsClick() {
    const self = this;
    pt.patchMethod(tGameKeyboard, 'isClick', (origMethod) => {
      const rtnFn = function (origKeyCode, ...rest) {
        if (origKeyCode === 'command_ability') {
          for (const keyCode of Object.keys(self.handlers)) {
            const clicked = origMethod.call(this, keyCode, ...rest);
            if (clicked) {
              logger.debug(`${keyCode} clicked!`);
              const fn = self.handlers[keyCode];
              // 非同期処理のため必ずPromiseで実行
              Promise.resolve().then(() => {
                fn(self.end);
              });
              // 本来のviewAbilityをブロックする
              // handlerがself.end()を適切に呼ぶことでキー受付のブロック解除とともに解除される
              self.blockViewAbility();
              return true;
            }
          }
        }
        // 追加キーで処理が終わらないか、相乗りするコマンドでなければ元のメソッドの結果を返す
        return origMethod.call(this, origKeyCode, ...rest);
      };
      return rtnFn;
    });
  }
}

function isSaveable() {
  let isSaveEnable = true;
  const viewMapInfo = tWgm.tGameData.getDataValue('viewMapInfo');

  // nullの可能性もあるので!=
  if (viewMapInfo?.isSaveEnable != undefined) {
    isSaveEnable = viewMapInfo.isSaveEnable;
  }

  const islocked = tWgm.tGameData.getDataValue('lock')[0];
  return !islocked && isSaveEnable;
}

function save(end) {
  try {
    const gm = tWgm;
    if (!isSaveable()) {
      gm.tGameLog.addAndViewLog('ここではセーブできない。', false);
      end();
      return;
    }

    gm.tGameSave.save(function (isOk) {
      try {
        if (isOk) {
          gm.tGameLog.addAndViewLog(
            gm.tGameTalkResource.talkData.system.save_ok,
            false
          );
        } else {
          gm.tGameLog.addAndViewLog(
            gm.tGameTalkResource.talkData.system.save_ng,
            false
          );
        }
      } finally {
        end();
      }
    });
  } catch (e) {
    logger.error(e);
    end();
  }
}

function onF1Clicked(end) {
  save(end);
}

let intr = new ShortcutKeyInterrupter();

intr.patchIsClick();
intr.patchViewSkill();

intr.addHandler('f1', onF1Clicked);

export default intr;
