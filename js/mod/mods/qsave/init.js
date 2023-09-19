import maginai from 'maginai';

const logger = maginai.logging.getLogger('plustalk');
const pt = maginai.patcher;

class ShortcutKeyInterrupter {
  _isAction;
  isOrigKeyProcessDisabled = false;

  disableOrigKeyProcessUntilNextIsActionFalse() {
    this.isOrigKeyProcessDisabled = true;
  }

  patchIsAction(routineMap) {
    if (routineMap === undefined) {
      throw new Error('tGameRoutineMap is not loaded');
    }
    this._isAction = routineMap.isAction;
    delete routineMap.isAction;
    const self = this;
    Object.defineProperty(routineMap, 'isAction', {
      set: function (value) {
        if (value === false) self.isOrigKeyProcessDisabled = false;
        self._isAction = value;
      },
      get: function () {
        return self._isAction;
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
  intr.patchIsAction(tWgm.tGameRoutineMap);
});

export default intr;
