[Japanese](README.md)

# qsave - Simple Quick Save/Load Mod
## Overview
This is an unofficial mod for CoAW that can be load using [maginai](https://github.com/Spoonail-Iroiro/maginai).  
`F1`: save  
`F2`: back to title  

\* If maginai is not installed yet, install it first

## Install
Download and unzip latest `qsave-X.Y.Z.zip` from [Release](https://github.com/Spoonail-Iroiro/maginai-qsave/releases).  

`qsave` is the main folder of this mod.

You can configure hot keys by editing `setting.js` in `qsave` folder.  
Note that assignable keys are limited to 'F1' through 'F4'.

## Usage
By default setting, you can save by `F1` and go back to the title by `F2`.

However, it will not work in the following cases:

- When vanilla command keys (e.g. `s` for opening the skill window) are not available, quick save/load keys are not available too
  - Technically, if you can't open the ability window by `a`, qsave doesn't work because it uses method patching on the check method
- If you can use only suspend instead of normal save, such as in a dungeon, quick save/load are not available

# Contact

If you encounter any problems, please create an issue on this repository or contact Spoonail via [contact information provided here](https://whiteblackspace.hatenablog.com/contact-coaw)
