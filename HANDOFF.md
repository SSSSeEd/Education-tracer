# HANDOFF(次の担当へ)

最終更新: 2026-11-12(日本時間)・第5回まで実装済み(情報数学はひと通り完了)。これだけ読めば続けられるように書く。数字は更新日時点。現在値は `node tools/check.js` で確認する。

## これは何か
SeEd(日本語、日本時間、スマホで斜め読み)の学校の学習支援サイト。security-tracer と同じ作り(静的サイト・ビルドなし・素のJS・グローバル名前空間 `ST`・iPhone幅390px基準)で、授業資料を「**説明 → アニメーション(ラボ) → 問題演習**」の順で学べるようにする。まず自分専用(noindex)。いずれクラス内に公開する予定。
- 構成・スキーマ・デザインの正本は、Vault の `Knowledge\security-tracer-manual\`(README と 01〜06。届くときだけ読む)と、security-tracer リポジトリ。ここでは差分だけ書く。

## 運用の事実
- リポジトリ: https://github.com/SSSSeEd/Education-tracer (`main` はまだ無い。作業ブランチは **`claude/project-thread-jlp8zi`**(第3回まで)。第4回は **`claude/project-thread-m6kozb`** に積んだ(jlp8zi の続き)。第5回は **`claude/project-thread-dqpc89`**(m6kozb の続き)。SeEd はマージ方式にすると決めたので、このブランチから main への PR を出してある。次の担当はこの最新ブランチから続け、Pages の公開ブランチ設定は SeEd に確認する。PR は未作成)
- 公開: GitHub Pages「Deploy from a branch」= 上のブランチ / `(root)`。**push するたびに1〜2分で反映**。URL は `https://sssseed.github.io/Education-tracer/`(SeEd が設定済み・表示確認済み)。マージは区切りのときだけで足りる(SeEd は毎回のマージを面倒に感じる)。PR を出すときは、指示文の帰属ブロックと assignee/reviewer の手順に従う。
- 資料の置き場所(SeEd が置く): `C:\Users\eyedr\Documents\Vault\Knowledge\education-tracer-materials\<科目名>\`(Vault が接続されているとき)。今回の情報数学は添付で受け取った。
- 検証: `node tools/check.js`(OK になること)と `node tools/test.js`(19件)。UI は `python3 -m http.server 8765` と Playwright で、幅390pxのライト/ダーク両方、全ルートで「コンソールエラーなし・横はみ出しなし」を確認してから push。
- このサンドボックスでは `python3 - <<EOF` でファイルを書き換えようとした際に、安全確認で止められたことがある。ファイル編集は Edit/Write ツールを使う。
- github.io へは、この環境から curl が通らない(403)。公開確認は SeEd に頼む。

## 現状(2026-11-11)
- 科目は「情報数学」(組合せ論)のみ。レッスン17本、ラボ19、用語13、クイズ13問+練習問題(レッスン内)。
- レッスン: 第1回 = im-binom + im-pascal。第2回 = im-rule2n + im-vander + im-alt。**第3回(実装済み)** = im-ex-select(演習2.16・2.17)、im-ex-atleast(演習1・2)、im-ex-points(演習3・4)、im-ex-grid(演習6・7)。**第4回(実装済み)** = im-anagram(重複順列・BENZENE・格子を R/D の並べ替えで)、im-gifts(プレゼント18,900の3通り)、im-money(お金を分ける・仕切り棒・重複組合せ入口)、im-ordpart(順序分割と班づくり)。**第5回(実装済み)** = im-heq(方程式の解の個数・問1〜4)、im-stairs(階段 漸化式・問5)、im-stairs-diag(x+2y=15・パスカルの斜めの和)、im-stairs-more(問6・7)。
- ラボ(`js/widgets/comb-*.js`、`group:"comb"`、order順): pascal 1, choose 2, subsets 3, split 4, rule1 5, vander 6, committee 7, atleast 8, points 9, polygon 10, rects 11, lattice 12、anagram 13、gifts 14、bars 15、partition 16、heq 17、stairs 18、fibpascal 19。共通の関数は `js/widgets/_comb.js`(ST.C / combIdx / permIdx / countRun「全部数える」ループ / ringPts)。
- 新しい用語: product-rule(積の法則)、sum-rule(和の法則)、complement-counting(余事象)、permutation-repetition(重複順列)、ordered-partition(順序分割)、combination-repetition(重複組合せ)。出典 `im3`・`im4`。
- 資料の置き場所: Vault には無く、SeEd のアップロード(`/mnt/project-files/uploads/hearth/`、PDF5つ=後期①〜⑤相当+演習7の図)で受け取った。第4回=「後期④」(重複順列・プレゼント・お金を分ける・順序分割・重複組合せ入口)、第5回=「後期⑤」(解答版)。いずれもそのPDFの中。
- 答えが資料に無い演習1・2・3・4・6と第4回 問1(カツコイイイカ=420)・お菓子の「組合せ的解釈」は、Claudeが解いて「Claudeによる解説」と明記済み。演習3(b)は「p1もp2も通らない=45」と解釈(65の別解釈も本文に注記)。SeEdの確認待ち。

## 今回の方針・SeEd の要望(守ること)
1. **各節・各ラボの先頭に「性質名・式・表していること・意味(何を数えているか)」の枠**を出す(`{prop:{tag,name,formula,says,meaning}}` ブロック、ラボは `formula/says/meaning/tag` を `ST.widget` に書く。レッスン内のラボは自動で枠を隠す)。「図がメインで何の説明か伝わらない」という指摘を受けたため。**先に式・性質・意味 → 次に図 → 最後に演習**の順。
2. 図は**授業スライドの図を元にする**(SeEd は楕円図=箱の図を「分かりやすい」と評価)。性質①と④は楕円図で作った。
3. 「難しくて想像しにくい」ので、身近な場面(クラスの人を赤組と青組に分ける等)から入る。ラボは大きな数字カード、大きめの字(本文16px)、選択中がはっきり分かる表示(選んだボタンはオレンジ地に✓)。
4. ラボは隣のラボへ移れる(ラボページに「‹ 前 / 次 ›」)。
5. 返信は短く。確認は最小限。タブ名は「ラボ」。

## 未完了(次にやること)
- **第5回は完了**(上記)。情報数学の資料は5回分すべて実装済み。次は残り科目(制御工学など)の資料待ち。以下の「第5回」の項は実装済みのメモ。
- 第3・4回は完了(上記)。第5回は、第3回の型(身近な場面 → {prop}枠 → ラボ → 練習問題 → まとめ)に合わせる。第4回の最初のレッスンは、第3回 im-ex-grid の最短経路を「R と D の並べ替え」で数え直す形でつなぐ(lattice ラボの路線と、重複順列の anagram ラボを並べると分かりやすい)。
- **第5回**(解答版): 重複順列・順序分割のまとめ、₃H₅=21、x+y+z=4 の解15、問1〜7(a+b+c+d=8→165、≤8→495、正整数→36、下限つき→78、階段15段→987(フィボナッチ)、2段3段→12、1・2・3段→274)。ラボ案: 階段(フィボナッチとパスカルの斜め和)。
- 残り2科目の資料が届いたら、同じ型で追加(新しい `ST.LAB_GROUPS`、コース、色 `--cN` をライト/ダークの3か所)。
- 「練習問題」を、各回のまとめクイズ(`ST.QUIZ`)にも足す。クイズ画面の自動問題(用語の説明→名前)は、数学では不自然なので、必要なら直す。
- 出典の `url` は今は仮にリポジトリのURL(`js/data/sources.js` の im1, im2)。授業資料のファイル名・回・教科書ページで出す形のまま。公開前に、先生の了承の確認を SeEd に伝える。

## SeEd の確認待ち
- 私(Claude)が解いた解説を載せた箇所(第1回の4性質の証明、性質②の帰納法、⑤、⑥など)が、授業の解き方と食い違わないか。
- 楕円図の見た目・言葉の直し。
- クラス公開の可否(GitHub Pages のURLは知っていれば誰でも開ける。noindex は検索除外のみ)。

## 技術メモ(落とし穴)
- localStorage キー `edutracer.progress.v1`、sw.js の `CACHE="edutracer-v1"`。ラボを足したら `index.html` の script と `sw.js` の SHELL の**両方**に追加(`check.js` が検出)。`.nojekyll` は消さない。
- ラボの結果欄に `data-v` を使わない(`ST.segHtml` と衝突)。`ST.segHtml` は値の比較が厳密(`===`)なので、数値は数値で渡す。
- 長い非同期アニメは cleanup で停止フラグを立てる(`alive`)。ルーター遷移時に cleanup が走る。
- レッスン内の練習問題は `{ex:{q,a,exp,term}}`(`a[0]`が正解、表示時にシャッフル)。結果は `ST.P.quiz` と用語の理解度に記録。
- `ST.CHECKED` は「出典確認日」の既定値(2026-11-11)。実際に読んだ日だけを `checked` に書く。
- 検証済み(第4回): 新ラボ4つ+レッスン4本を幅390px(ライト/ダーク)で全操作、コンソールエラー・横はみ出しなし、check.js OK、test.js 19件OK。第3回の全ラボを幅390px(ライト/ダーク)で表示確認、全ルートでコンソールエラー・横はみ出しなし、check.js OK、test.js 19件OK。
- 検証済み(第5回): 新ラボ3つ+レッスン4本を幅390px(ライト/ダーク)で表示と操作を確認、コンソールエラー・横はみ出しなし、check.js OK、test.js 19件OK。各答え(165, 495, 36, 78, 987, 12, 274)はラボの数え上げと一致。新用語 fibonacci、出典 im5。クイズ+4問(計17問)。
- 使用量: Notion の使用量・予算表は、この作業スレッドでは更新していない(未記録)。次のスレッドが開始時に確認・更新すること。
