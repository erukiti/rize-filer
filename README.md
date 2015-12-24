# リゼ先輩の作ったファイラー

まだ、圧倒的に途中なんですが青山ブルマ先生のように締め切りをぶっちぎりまくるのもそろそろ限界なので、さらします。

## GDD (Gochiusa Driven Development)

## アイコンのライセンス

<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a>             is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a></div>

## TODO (随時githubのissueに移す)

	- [ ] フォーカスできるものを限定する
		* [ ] body にフォーカスした時の対策をする
	- [ ] 最初のフォーカス
	- [x] focus してる側にのみマーカーを表示

	- [ ] キー移動に合わせてスクロール調整

	- view mode

	- nav pane
    * [ ] directory history
    * [ ] directory を記憶する

	- ディレクトリ状態のアップデート
		* [ ] polling ?

* preferences
	- [ ] side tab
	- [ ] font setting
* about
	- [ ] サイズをいい感じのサイズに合わせる
				最初 hidden 状態でサイズ調整してから show にする？
* application
	- [ ] bar with actions (オプション?)
	- [ ] tab
* context menu
* operation
	- ファイルコピー
	- ファイル移動
	- ファイル削除
* tray
* updateの仕組みを用意する

	- 子プロセス関連
		* [ ] 実行ステータスとかをどこかにだす
		* [ ] カスタマイズ
		* [ ] エディタを開く


----

* [-] unit test
* filer
	- [.] ディレクトリ移動した後のカーソル位置調整 (とりあえず .. に合わせる)
	- 情報を増やす
		* [-] filer-item-icon
		* [-] パーミッション
		* [-] owner, group
	- 固定thead
	- カスタマイズ
		* [-] 表示カラム
		* [-] ソート
		* [-] 時間のフォーマットをカスタマイズ
	- 情報ウィンドウ
		*
* [x] Rx?webRx? のエラーが握りつぶされてる件


* BrowserWindowLifecycle manager を作成する
