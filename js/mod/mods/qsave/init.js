import maginai from 'maginai';

const logger = maginai.logging.getLogger('plustalk');
const pt = maginai.patcher;

class ShortcutKeyInterrupter {
  _isDash;
  isOrigKeyProcessDisabled = false;

  disableOrigKeyProcessUntilNextIsActionFalse() {
    this.isOrigKeyProcessDisabled = true;
  }

  patchIsDash(routineMap) {
    if (routineMap === undefined) {
      throw new Error('tGameRoutineMap is not loaded');
    }
    this._isDash = routineMap.player.isDash;
    delete routineMap.player.isDash;
    const self = this;
    Object.defineProperty(routineMap.player, 'isDash', {
      set: function (value) {
        if (value === false) self.isOrigKeyProcessDisabled = false;
        self._isDash = value;
      },
      get: function () {
        return self._isDash;
      },
    });
  }

  patchIsClick() {
    const self = this;
    pt.patchMethod(tGameKeyboard, 'isClick', (origMethod) => {
      const rtnFn = function (keyCode, ...rest) {
        if (keyCode === 'command_miwatasu') {
          const isf1Clicked = origMethod.call(this, 'f1', ...rest);
          if (isf1Clicked) {
            logger.debug('f1 clicked!');
            self.onF1Clicked();
            self.disableOrigKeyProcessUntilNextIsActionFalse();
            return true;
          } else {
            return origMethod.call(this, keyCode, ...rest);
          }
        } else {
          return origMethod.call(this, keyCode, ...rest);
        }
      };
      return rtnFn;
    });
  }

  patchSetModeOverlook() {
    const self = this;
    pt.patchMethod(tGameRoutineMap, 'setMode', (origMethod) => {
      const rtnFn = function (mode, ...rest) {
        if (self.isOrigKeyProcessDisabled && mode === 'overlook') return;

        return origMethod.call(this, mode, ...rest);
      };
      return rtnFn;
    });
  }

  onF1Clicked() {
    maginai.logToInGameLogDebug('F1 clicked!');
  }
}

let intr = new ShortcutKeyInterrupter();

intr.patchIsClick();
intr.patchSetModeOverlook();

maginai.events.gameLoadFinished.addHandler(() => {
  // isActionメンバーにパッチするのでtWgmが読み込まれてから
  intr.patchIsDash(tWgm.tGameRoutineMap);
});

export default intr;
