# HANDOFF(次の担当へ)

最終更新: 2026-11-12(日本時間)・情報数学(第5回まで)、応用数学(CR方程式まで)、制御工学(第1〜6回)を実装済み。これだけ読めば続けられるように書く。数字は更新日時点。現在値は `node tools/check.js` で確認する。

## 公開手順(必ず守る)
- **公開元は `claude/project-thread-m6kozb` 1本だけ**(Settings → Pages = Deploy from a branch / この枝 / `(root)`)。サイトに出したい変更は、**この枝へ入れる**。push またはマージから1〜2分で反映。
- 作業枝(`claude/project-thread-xxxx`)は、**PR の base を必ず `claude/project-thread-m6kozb` にする**。別の枝(例 jlp8zi)へマージしても公開されない(2026-11-12 に応用数学・制御工学で発生)。
- 新しい作業枝は、最新の `claude/project-thread-m6kozb` から作る。ほかの枝に積んだ作業は、先に m6kozb へ取り込む。
- 反映の確認: Actions の「pages build and deployment」が成功か、head_branch が m6kozb かを見る。ホーム画面アプリは、閉じて開き直す(Service Worker のキャッシュ名 `sw.js` の CACHE を上げると確実)。
- 再発防止: `.github/workflows/publish-guard.yml` が、公開枝以外へマージされたPRにコメントし、公開枝へのPRを自動作成する(作れない場合は Settings → Actions → General → 「Allow GitHub Actions to create and approve pull requests」をオン)。PRテンプレートにも base の確認欄あり。
- 公開元の枝を変えるとき: Pages の設定、`publish-guard.yml` の `PUBLISH_BRANCH`、この節の3か所を同時に直す。

## これは何か
SeEd(日本語、日本時間、スマホで斜め読み)の学校の学習支援サイト。security-tracer と同じ作り(静的サイト・ビルドなし・素のJS・グローバル名前空間 `ST`・iPhone幅390px基準)で、授業資料を「**説明 → アニメーション(ラボ) → 問題演習**」の順で学べるようにする。まず自分専用(noindex)。いずれクラス内に公開する予定。
- 構成・スキーマ・デザインの正本は、Vault の `Knowledge\security-tracer-manual\`(README と 01〜06。届くときだけ読む)と、security-tracer リポジトリ。ここでは差分だけ書く。

## 運用の事実
- リポジトリ: https://github.com/SSSSeEd/Education-tracer (`main` はまだ無い。作業ブランチは **`claude/project-thread-jlp8zi`**(第3回まで)。第4回は **`claude/project-thread-m6kozb`** に積んだ(jlp8zi の続き)。第5回は **`claude/project-thread-dqpc89`**(m6kozb の続き)。SeEd はマージ方式にすると決めたので、このブランチから main への PR を出してある。次の担当はこの最新ブランチから続け、Pages の公開ブランチ設定は SeEd に確認する。PR は未作成)
- 公開: GitHub Pages「Deploy from a branch」= **`claude/project-thread-m6kozb`** / `(root)`(下の「公開手順」参照。上の枝の説明は古い)。**push するたびに1〜2分で反映**。URL は `https://sssseed.github.io/Education-tracer/`(SeEd が設定済み・表示確認済み)。マージは区切りのときだけで足りる(SeEd は毎回のマージを面倒に感じる)。PR を出すときは、指示文の帰属ブロックと assignee/reviewer の手順に従う。
- 資料の置き場所: SeEd 側の非公開の場所。リポジトリには置かない(パスも書かない)。
- 検証: `node tools/check.js`(OK になること)と `node tools/test.js`(19件)。UI は `python3 -m http.server 8765` と Playwright で、幅390pxのライト/ダーク両方、全ルートで「コンソールエラーなし・横はみ出しなし」を確認してから push。
- このサンドボックスでは `python3 - <<EOF` でファイルを書き換えようとした際に、安全確認で止められたことがある。ファイル編集は Edit/Write ツールを使う。
- github.io へは、この環境から curl が通らない(403)。公開確認は SeEd に頼む。

## 現状(2026-11-11)
- 科目は「情報数学」(組合せ論)のみ。レッスン17本、ラボ19、用語13、クイズ13問+練習問題(レッスン内)。
- レッスン: 第1回 = im-binom + im-pascal。第2回 = im-rule2n + im-vander + im-alt。**第3回(実装済み)** = im-ex-select(演習2.16・2.17)、im-ex-atleast(演習1・2)、im-ex-points(演習3・4)、im-ex-grid(演習6・7)。**第4回(実装済み)** = im-anagram(重複順列・BENZENE・格子を R/D の並べ替えで)、im-gifts(プレゼント18,900の3通り)、im-money(お金を分ける・仕切り棒・重複組合せ入口)、im-ordpart(順序分割と班づくり)。**第5回(実装済み)** = im-heq(方程式の解の個数・問1〜4)、im-stairs(階段 漸化式・問5)、im-stairs-diag(x+2y=15・パスカルの斜めの和)、im-stairs-more(問6・7)。
- ラボ(`js/widgets/comb-*.js`、`group:"comb"`、order順): pascal 1, choose 2, subsets 3, split 4, rule1 5, vander 6, committee 7, atleast 8, points 9, polygon 10, rects 11, lattice 12、anagram 13、gifts 14、bars 15、partition 16、heq 17、stairs 18、fibpascal 19。共通の関数は `js/widgets/_comb.js`(ST.C / combIdx / permIdx / countRun「全部数える」ループ / ringPts)。
- 新しい用語: product-rule(積の法則)、sum-rule(和の法則)、complement-counting(余事象)、permutation-repetition(重複順列)、ordered-partition(順序分割)、combination-repetition(重複組合せ)。出典 `im3`・`im4`。
- 資料: SeEd のアップロードで受け取った(リポジトリには置かない)。第4回=「後期④」(重複順列・プレゼント・お金を分ける・順序分割・重複組合せ入口)、第5回=「後期⑤」(解答版)。いずれもそのPDFの中。
- 答えが資料に無い演習1・2・3・4・6と第4回 問1(カツコイイイカ=420)・お菓子の「組合せ的解釈」は、Claudeが解いて「Claudeによる解説」と明記済み。演習3(b)は「p1もp2も通らない=45」と解釈(65の別解釈も本文に注記)。SeEdの確認待ち。

## 応用数学(2026-11-11 追加・複素数〜CR方程式まで実装済み)
- 資料なし。授業の推奨サイト「梅崎直也 複素解析」(https://www.umezakinaoya.com/courses/complex-analysis/)の第1章・第2章の入口・第3章の1〜4(複素数、複素平面、極形式、領域、微分、正則、CR方程式)を、自分の言葉で書き直した。文章・図は転載していない。出典は `am1`〜`am8`(各ページURL、確認日 2026-11-11)。
- 方針(SeEd): 証明は深掘りしない。実用・演習・理解重視。複素数平面をベクトルで動かして見せる。
- コース `am`(応用数学、色 c2)、レッスン8本: am-plane → am-mult → am-roots / am-region → am-func → am-deriv → am-cr → am-ex-cr(演習6問、Claudeが作って解いた旨を明記・SeEd確認待ち)。
- ラボ7本(`js/widgets/cx-*.js`、`group:"cx"`、共通は `_cx.js` の `ST.cx`: 複素数計算・座標・矢印・ドラッグ): cplane, cmul, croots, cdomain, cmap, cdir, ccr。点はスナップ0.5刻みでドラッグ(マウス/タッチ)。
- 用語13(cat「複素解析」)、クイズ12問を追加。
- 次: 続きは第3章の5〜6(等角性・調和関数)、第4章(線積分)以降。コーシーの積分定理・留数は未着手。ラボの「前後移動」は LAB_GROUPS の順で自動。

## 応用数学 アニメーション案の実装(2026-11-12 追加)
- 元: Vault `suggest/education-animation.pdf` の応用数学(複素数)案。z平面→w平面の写像は対象外。
- 新ラボ2本(偏角の象限ミス/arctan のラボは SeEd の指示で削除): `cpolar`(極形式。a+bi と r(cosθ+i sinθ) が同時更新)、`ccauchy`(円周を一周する積分。z²=0、1/z=±2πi、向きで符号反転)。
- 新レッスン2本: `am-polar`(am-mult の次)、`am-cauchy`(am-path の次。積分路の符号は問題文の読み方として本文に記載)。用語+2、クイズ+3。sw.js の CACHE を v4 に。
- 既存で足りていたため作らなかったもの: 掛け算とド・モアブル・1のn乗根=cmul/croots、CR方程式=ccr/capproach、線積分=csum/cpath。CRの「2本の矢印が重なる」形そのものは未実装(ccr の青・橙の矢印で近い見せ方)。
- Claudeが作った解説(SeEd確認待ち): am-polar・am-cauchy の本文と練習問題。

## 情報数学 アニメーション案の実装(2026-11-12 追加)
- 元: Vault `suggest/education-animation.pdf` の2-1・2-2(PDFを読んで実装)。
- 新ラボ2本: `dist`(order 20。区別できる10個を配る=1人1個 10!/何個でも 10¹⁰、全部同じ=★10個と｜2本をドラッグして C(12,2)=66)、`pick`(order 21。「順番を区別?」「重複OK?」の2問に答えると4分類の表のマスが光る。間違えると問題文のサインを黄色に。条件だけ変えた4問を並べる。アイス5→3、ジュース6→2)。
- 新レッスン `im-pick`(im-stairs-more の次。Claudeが作った解説・問題。SeEd確認待ち)。既存の gifts(4,2,2,2の配り方)・bars(コイン、タップ操作)とは別内容のため重複なし。sw.js の CACHE を v6 に。

## 制御工学(2026-11-12 追加・第1〜6回ぶん実装済み)
- 資料: 授業資料のファイルはリポジトリに置かない(パスも書かない)。作業ブランチ **`claude/project-thread-5pz8rh`**(ベースは情報数学・応用数学を含む `jlp8zi` の最新)。PR はこのブランチから出す。
- SeEd の要望: 力や電圧を実際に加えて、変位や電流を見るアニメーションで、運動方程式を立てるイメージを作る。ラプラス変換は変換そのものでなく「極の位置と応答」「部分分数を1項ずつ足す」「式変形を1段ずつ」で見せる。
- コース `ce`(制御工学、色 c3)、レッスン13本: ce-fbk(第1回①)、ce-mech(第1回②)、ce-elec・ce-filter・ce-motor(第2回)、ce-process・ce-linear・ce-laplace(第3回)、ce-invlap・ce-ode(第4回)、ce-tf(第5回)、ce-elements・ce-blocks(第6回)。
- ラボ11本(`js/widgets/ctl-*.js`、`group:"ctl"`、共通は `_ctl.js` の `ST.ctl`: RK4・時間プレーヤー(▶/↺/スクラブバー)・折れ線グラフ・スライダー・ばね/ダンパ/回路記号): fbk(フィードバック)、msd(質量・ばね・ダンパ。力を加える/壁側を動かす)、rlc(RLC・ローパス・ハイパス。電流は流れる点の速さで表示)、motor(直流サーボモータ)、tank(1タンク)、lin(線形化)、pole(s平面で極をドラッグ→波形。`_cx.js` を使う)、pfd(部分分数を1項ずつ足す)、ode(微分方程式をラプラス変換で1段ずつ解く)、elem(6つの基本要素)、blk(ブロック線図の直列・並列)。
- 用語14(cat「制御工学」)、クイズ+13問、出典 ce1〜ce6(各回)・ce7(2次遅れ解説)。
- 検証: pfd の答えのラプラス変換が F(s) と一致、ode の解が RK4 と一致(`tools/test.js` に3件追加、計22件)。全ラボとレッスンを幅390px(ライト/ダーク)で表示、全操作でコンソールエラー・横はみ出しなし。
- Claudeが作った/解いた箇所(SeEd確認待ち): 第5回 演習2(RC直列の伝達関数 1/(RCs+1)、資料に答えが無かった)、ce-linear の x² の線形化、ce-invlap の 1/((s+1)(s+2)) の例、各クイズ。授業資料に答えがある演習(2.1、2.4、第5回演習1、第6回演習1・2)は資料どおり。
- 授業の「ハイパスフィルタ(例2-4)」は位相進み回路で、直流ゲインが 0 ではなく R₂/(R₁+R₂)。ラボもそのとおり(入った瞬間は eₒ≈eᵢ、後で分圧に下がる)。
- 未着手/次: 第7回以降の資料待ち。ラボは動く量(M, C, K, R, L, C など)を変えて試せるが、ばらつき(ノイズ)や周波数応答は未対応。

## 数式の表示(LaTeX / KaTeX・2026-11-12)
- `vendor/katex/`(KaTeX 0.16.11、woff2のみ)を同梱。sw.js のキャッシュ対象に追加済み(オフライン可)。`js/tex.js` が `ST.tex` / `ST.am` を提供。
- 文章・選択肢・問題文・解説・用語は `ST.md` 経由なので、`$...$` の中に LaTeX を書くだけで描画される(見出し h・prop の formula も同様)。
- ラボが実行時に作る文字列は `ST.am(html)` で包むと、`M x″ ＋ C x′ ＝ f` のような Unicode 式が自動で LaTeX になる(時間微分は dx/dt、d²x/dt² 表記)。SVG内のテキストは対象外。
- 制御工学・情報数学・応用数学とも変換済み(2026-11-12)。新しい科目も同じく `$...$` を書く(`node tools/check.js` が全 `$...$` を KaTeX で検査する)。
- ctl 以外のラボは `ST.watchTree`(js/tex.js)が、キャプションや結果欄の Unicode 式(`C(n,r) ＝ 66` など)を再描画のたびに自動で KaTeX にする。SVG内の文字は対象外。ctl は従来どおり `ST.am()`。
- レッスン・用語の見出し(title/name)は ST.esc で出る箇所があるので、`$` を書かず普通の文字にする(propの name だけは ST.md)。長い式は `$...$` を区切って折り返せるようにする。
- 時間微分の x′, x″ は使わず dx/dt, d²x/dt² と書く(SeEd の指定)。

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
- 授業資料の出典(im1〜4、ce1〜7)は、リンクを付けず、回の名前だけを表示する(資料へのリンク・ファイルは公開物に入れない)。

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


## 制御工学ラボの方針(2回目の整理)
- 目的は「力の向き・かかる力・変位から運動方程式を立てる」ことだけ。時間応答・グラフ・時間スライダー・固有角周波数・減衰係数は載せない。
- 残したラボ: msd(静的。壁は左・台車は右、外力は台車を壁へ押す向き。壁に近づく向きを x の正)、build(式を1歩ずつ組む・4モデル対応表)、ltab(ラプラス変換表を引く)、pfd(部分分数)。
- ラプラス変換表は js/widgets/_lap.js(色グループ・折りたたみ)。
- 向きの約束: 式 M x″+C x′+K x=f は座標の向きを反転しても同じなので、変わるのは矢印の向きと符号の見せ方だけ。

## 要望フォーム(2026-11-13 追加・匿名)
- 下のタブ「要望」(`#feedback`、`js/feedback.js`)。種類(要望/不具合/その他)+本文だけを送る。名前・メール・端末情報は送らず、入力は端末に保存しない(localStorage 不使用)。fetch は `no-cors`・`credentials:"omit"`・`referrerPolicy:"no-referrer"`。連打防止はメモリ上の15秒のみ。
- 送信先は **Google フォーム**(設定済み 2026-11-13。`js/data/feedback.js` の `action`/`field`)。回答は SeEd のフォームの「回答」タブで見る。ログイン不要・メール収集オフを SeEd に確認依頼済み。
- **SeEd の設定手順**: ①Google フォームを新規作成し、記述式(段落)の質問を1つだけ置く。設定で「メールアドレスを収集」「回答を1回に制限」「ログインを必須」を**すべてオフ**。②「送信先」タブで回答をスプレッドシートにつなぐ(任意)。③公開リンク(`.../forms/d/e/<ID>/viewform`)の `viewform` を `formResponse` に変えたURLを `action` に。④フォームの「事前入力したURLを取得」で質問に適当な文字を入れてURLを出し、`entry.数字` の部分を `field` に。この2つの値をスレッドで伝えれば反映する。
- 理由: 外部サービス(Formspree等)は別アカウントと規約・保存期間の確認が要る。Google フォームなら回答者の情報は収集されず(ログイン不要設定時)、静的サイトのまま動く。
