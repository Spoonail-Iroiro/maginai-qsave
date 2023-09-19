## 口調ファイルの出力方法
固有NPC等の口調を、カスタム口調ファイルと同じ形式で出力できます。  

出力には開発者コンソールを使いますので、ゲームは`index.html`からブラウザで起動してください。

また、配布フォルダの`empty.js`（すべての項目が空の口調ファイル）をゲームに読み込んでおいてください。  

### 1. plustalkの調査機能で会話パターンIDを調べる
[口調の改変方法](USAGE.md)のページに記載の調査機能で、ダウンロードしたい口調のNPCの会話パターンIDを調べます。

4つ並んだ数字が順番に、[Pattern, Talk, SubPattern, OverridePattern] IDとなっていますが、ダウンロードにはPattern, SubPattern, OverridePatternを使います。

### 2. 出力関数を開発者コンソールで呼び出す
`empty.js`のファイルIDが`emptyTalkId`として、以下のコードを開発者コンソールで実行することで口調ファイルを出力できます（ブラウザ機能でダウンロード扱いになります）。  
※ロードが終了しタイトル画面が表示されてから実行してください

```js
plustalk.downloadTalkText(emptyTalkId,Pattern,SubPattern,OverridePattern)
```

たとえば`empty.js`を`10006.js`で読み込んだ場合に、シャルドー（会話パターン[1015,1015,null,19]）の口調ファイルをダウンロードする場合以下のようになります。

```js
plustalk.downloadTalkText(10006,1015,null,19)
```


