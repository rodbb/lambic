Lambic
==========

**[Deprecated]**
このリポジトリはもう使わない。もっときれいに作り直すんだ、いっそ新しい設計、新しい言語、新しいリポジトリで…。
というわけで以降は[brewery](https://github.com/rodbb/brewery)で作っていく。

- - - - -

ビアバッシュを醸すWebアプリ

[![CircleCI](https://circleci.com/gh/rodbb/lambic.svg?style=svg)](https://circleci.com/gh/rodbb/lambic)

## Description

社内勉強会であるビアバッシュを盛り上げるためのアプリケーション。
発表の内容参照や、発表に対するレスポンスを行うことができる。

## Requirement

* npm
* Firebase
* firebase-tools

## Install

### セットアップ

事前に Firebase のプロジェクトを作成しておく。

```bash
$ git clone git@github.com:rodbb/lambic.git

$ cd lambic
$ npm install

# 使用するFirebaseプロジェクトの設定
$ npx firebase login
$ npx firebase use ${プロジェクトID}

$ cd functions
$ npm install

```

### 開発用のコンパイルとホットリロード

```bash
$ npm run serve
```

### 本番用のコンパイルとミニフィ

```bash
$ cd lambic
$ npm run build
```

### Firebase Hosting にデプロイ

コンパイル後に以下を実行

```bash
$ cd lambic

# デプロイするプロジェクトを変更する場合、使用するプロジェクトを指定
$ npx firebase use ${プロジェクトID}

# デプロイ
$ npx firebase deploy
```

## Licence

[MIT](https://github.com/rodbb/lambic/blob/master/LICENSE)
