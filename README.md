# Education Tracer

授業の内容を「説明 → アニメーション → 問題演習」の順で学ぶ、静的な学習サイトです。
ビルドなし・素のJS・グローバル名前空間 `ST`。`index.html` を開くだけで動きます。構成と作り方は security-tracer 方式です。

- 内容は `js/data/*.js`(出典・用語・コースとレッスン・クイズ)、アニメーションは `js/widgets/*.js`、画面は `js/views.js`。
- 解説には出典(授業資料)を付けます。出典確認日は、実際に資料を読んだ日です。
- 解説は AI(Claude)が授業資料をもとに作成したもので、誤りがありえます。大事な判断の前には資料で確認してください。
- 検査: `node tools/check.js` と `node tools/test.js`
- 個人用(noindex)。`.nojekyll` は消さないでください。
