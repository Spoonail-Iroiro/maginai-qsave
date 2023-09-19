## 口調の改変方法

### 注意
**同じ口調を使っているすべてのキャラが変更されます**ので、汎用口調のキャラには不向きです。  
ただし奴隷が1人しかPTにいない場合に、非PTキャラでは見ることのない談話セリフを追加するなど、状況によっては汎用口調に対しても限定的に活用することは可能です。

固有NPCでも以下のキャラは会話パターンが汎用と共有のため、変更が他のキャラにも影響する可能性が高いです。  

- シャルドー
- カーマイン
- ジェイル
- タカオミ
- ナツタメ
- エヅハ
- カエ

他、イベント中で一時的に変更されているPT離脱セリフや、イクリヨの追放セリフ等一部については変更されない可能性があります。  
※要望が多ければこれらの制約もアップデートで対応する可能性があります

### 口調の改変方法
口調の改変は大まかに、通常通りゲームに読み込んだ口調ファイルの内容を、適用先のNPCの口調に合成する形になります。  
以下、口調ファイルの方をsrc、適用先のNPCの口調をdstと呼びます。

現在口調の合成には、元々設定されている口調を消す「置換」（ReplaceThrough）と、口調を消さず付け足す「追加」（Merge）の2種類があります。同じキャラに対して両方を適用することもできます。  
例：話しかけた時のセリフは置換したいが、机での談話セリフは追加したい、等

また、どちらのモードもsrcにおいて内容が空の項目についてはdstに何もしません。  
談話セリフのみ等、改変したい部分だけ口調ファイル内に用意すればOKです。

#### 1. dst(適用先のNPCの口調)のPattern IDを調査
合成のためにはdstのPattern ID（基本的な会話パターンを指す内部ID）を調査する必要があります。  
これはplustalkの調査機能で調べることができます。

まずplustalkのModフォルダ（`plustalk`フォルダ）の中の設定ファイル`talk-setting.js`を開きます。  
その中の`isCheckTalkMode`が初期で`false`になっていると思いますので、`true`に設定してください。  

```js
LOADDATA = {
  isCheckTalkMode: true,
  //...
```

この状態でゲームを開始すると、NPCに干渉したときに以下のような情報が表示されます。

![npc-talk-info](docassets/npc-talk-info.png)

4つ並んだ数字が順番に、[Pattern, Talk, SubPattern, OverridePattern] IDとなっています。  
設定には1番目のPattern IDを使います。

今回は例としてこのPattern ID `1075`（エルクール）に対して口調変更を行います。

なお、調査が終わったら`isCheckTalkMode`は`false`に戻して問題ありません。

#### 2. src（合成する口調ファイル）を用意して通常通りゲームに読み込み
口調ファイルを作成します。

前述の通り、置換でも追加でもsrcに内容のない項目はdstの変更をしませんので、必要な部分のみ口調を記載してください。  
配布フォルダの中の`empty.js`はすべての内容が空の口調ファイルですので、ここから編集を始めることをおすすめします。  

例えば非敵対・非同行状態で話しかけた時の口調を変更するための口調ファイル内容は以下のようになります（一部抜粋）

```text
...
#@@#fieldboss#@@#
#@@#babycreate#@@#
#@##message>0>first#@##
#@##message>0>always#@##
こんにちは。
ちゃんとできてるみたいね。
#@##message>0>morning#@##
#@##message>0>afternoon#@##
#@##message>0>night#@##
...
```

作成できたら通常の口調ファイルの読み込みと同じ作業を行ってください。  
（`game/mydata/talk`への配置と`_LINK.js`の編集）

ゲーム内に読み込めていないとModからもアクセスできないため使用できません。  
口調ファイルタイトルに「エルクール（add）」のようなわかりやすい名前をつけておき、鏡の口調変更画面から読み込めているか確認すると確実です。

![talk-file](docassets/talk-file.png)

またこの時配置した口調ファイルのIDは後で設定ファイルでsrcとして指定しますので覚えておいてください。

#### 3. 設定ファイルでsrcをdstに適用する設定をする
`talk-setting.js`を開きます。  
（以下は不要なコメント=`//`から始まる行を削除済のものです）

```js
LOADDATA = {
  isCheckTalkMode: false,
  replaceThroughSrcAndDsts: [
  ],
  mergeSrcAndDsts: [
  ],
};
```

置換（元のセリフを削除）したい場合、`replaceThroughSrcAndDsts`リストに、`[src,[dst]]`という形でIDを記載します。  
たとえば今回のdstのPattern IDは`1075`（エルクール）で、前の手順で作成した口調ファイルsrcが`10007.js`だとすると、設定は以下のようになります。  

```js
LOADDATA = {
  isCheckTalkMode: false,
  replaceThroughSrcAndDsts: [
    [10007,[1075]],
  ],
  mergeSrcAndDsts: [
  ],
};
```

追加（元のセリフを残す）したい場合は、`mergeSrcAndDsts`の方に対して同様にしてください。  

Modはリストのすべての[src,[dst]]を処理しますので、口調を改変したいキャラが複数いる場合はここまでの手順を繰り返してすべてリストに記載してください。  
冒頭に書いたように、一部項目は置換したいが一部項目は追加したいという場合、異なる口調ファイルを用意して置換と追加を両方同じdstに対して処理することもできます。  

#### 4. 導入成功確認
ここまでの作業が終わったらゲームを起動します。  
セーブを読み込みゲーム開始時に、ログにエラーメッセージがなければ適用成功しています。  
実際に口調が変更されているか、作成した口調ファイルに基づいて確認してみましょう。

![complete](docassets/talk-edit-complete.png)

設定にエラーがある場合は以下のようなエラーメッセージがセーブ読み込み時に出ます。  

![error](docassets/talk-file-error.png)

追加と置換のどちらの設定値で失敗したのか表示されているため修正の参考にしてください。  

うまくいかない場合のチェックリスト：
- maginaiの導入自体は正しく完了していますか？
- 追加・置換した口調の条件は確認方法と合っていますか？
- 追加・置換の正しい方のリストに設定を書いていますか？
- srcの口調ファイルは読み込めていますか？
- srcの口調ファイルのIDや、dstのPattern IDに把握や調査ミスはありませんか？

一度設定できれば、口調ファイルは毎回ゲーム開始時に読みに行きますので、ファイル編集で追加・置換内容を変えることができます。

##### それでもうまくいかないときは
バグの可能性があるため、いせそう非公式Discordの`改造・MOD用`で`@Spoonail`までメンションいただくか、Misskeyまでご連絡ください  
（わかる方はここのissueを使っていただけると助かります）  
https://misskey.io/@Spoonail

### 細かな注意点等
口調ファイルで`#@@#`から始まる敬称等の項目については「置換」処理のみで変更できます。  
「追加」で適用している口調ファイルに書いていても効果がありませんのでご注意ください。

