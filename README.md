# My molkky

## 概要

モルック（molkky）というスポーツの得点管理アプリです。  
参加しているチーム毎にスマートフォン等の端末を用意し、自分の得点を記録します。  
また相手の得点はリアルタイムで反映されます。

[モルックとは](https://molkky.jp/molkky/)


### My molkkyオリジナルルール

基本的には通常のモルックのルールに加えて、下記のルールを加えています。

先に50点を先取したチームは1ポイント獲得し、そのラウンドは終了となります。
獲得したポイントはそのままで、すべてのチームの得点やスキットルの配置をリセットします。
先に2ポイント獲得したチームが勝利となり、ゲーム終了です。

<img src="https://github.com/xyytgae/my-molkky/blob/images/capture_1.png" alt="capture_1" >

<img src="https://github.com/xyytgae/my-molkky/blob/images/capture_2.PNG" alt="capture_2" >

<img src="https://github.com/xyytgae/my-molkky/blob/images/capture_3.PNG" alt="capture_3" >

## 機能一覧
- プレイルーム作成、入退室
- モルック得点管理
- ゲーム履歴閲覧

## 実装予定機能
- 複数写真投稿
- 編集
- 削除
- ハッシュタグカラー変更

## 環境構築

```bash
# クローン
$ git clone https://github.com/xyytgae/my-molkky.git

# パッケージインストール
$ yarn

# localhost:3000でサーバー立ち上げ
$ yarn dev
```

## 開発中によく使うコマンド
```bash
# git czを使用しgit commitを行う
$ yarn commit
```

## 技術
- Nuxt.js（2系）→ Nuxt.js（3系）[移行中](https://github.com/xyytgae/my-molkky/tree/develop)
- Vuetify.js
- Firebase（Authentication、Firestore、Storage、Hosting）

## DeployURL

https://my-molkky.web.app

