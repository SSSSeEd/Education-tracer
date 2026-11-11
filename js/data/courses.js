"use strict";
/* Courses and lessons. Block types: {p}, {h}, {list}, {w: widget, o: opts}, {callout, kind}, {ex:{q,a,exp,term}}, {key: [...]}.
   {ex}: an inline practice question; a[0] is the correct answer (the UI shuffles). Text uses ST.md markup (**bold**, `code`, [[term-id]]).
   Every lesson lists its sources. requires: lesson ids to read first (skill tree). [] = entry point. */
ST.COURSES = [
 {id:"im", n:"01", title:"情報数学", color:"var(--c1)", desc:"組合せ論。数え方を図とアニメーションで確かめる。",
  lessons:[
   {id:"im-binom", title:"二項係数と順列", min:7, requires:[], terms:["binomial","permutation"], src:["im1"], blocks:[
     {p:"n 個の中から r 個を**選ぶ**組合せの数を[[binomial]]といい、C(n,r) と書きます(授業資料では縦に n と r を重ねた記号)。式は C(n,r) = n! / ((n−r)! r!) です。たとえば {1,2,3,4} から2個選ぶと C(4,2) = 4·3 / (2·1) = 6 通りで、{1,2}, {1,3}, {1,4}, {2,3}, {2,4}, {3,4} です。"},
     {p:"一方、n 個の中から r 個を選んで**並べる**数が[[permutation]] P(n,r) = n! / (n−r)! です。P(4,2) = 4·3 = 12 通りで、AB と BA は別のものとして数えます。"},
     {w:"choose"},
     {callout:"上のラボで「選ぶだけ」と「選んで並べる」を切り替えてみてください。選んだ組合せ1つにつき、並べ方が r! 通りずつ出てきます。", kind:"info"},
     {h:"組合せと順列の関係"},
     {p:"{A,B,C,D} から3個選ぶ組合せは4通りで、それぞれ 3! = 6 通りに並べられるので、P(4,3) = 3! × C(4,3) = 24 通りです。一般に P(n,r) = r! × C(n,r) なので、C(n,r) = P(n,r) / r! = n! / ((n−r)! r!) になります(授業資料の定理)。"},
     {ex:{q:"P(5,3) は？", a:["60通り","10通り","20通り","15通り"], term:"permutation", exp:"P(5,3) = 5·4·3 = 60 通り。C(5,3) = 10 に 3! = 6 をかけても 60 です。"}},
     {ex:{q:"C(5,2) は？", a:["10通り","20通り","5通り","25通り"], term:"binomial", exp:"C(5,2) = 5·4 / (2·1) = 10 通り。20通りは並べる場合 P(5,2) の値。"}},
     {h:"二項係数の基本の性質"},
     {p:"授業資料では次の4つを「証明せよ」としています。解き方の一例です(この説明はClaudeが資料の課題を解いたものです)。"},
     {list:["**C(n,r) = C(n,n−r)**: r 個を選ぶことは、選ばない n−r 個を決めることと同じ。式でも分母の (n−r)! と r! を入れ替えるだけで同じになる。","**C(n,r) = (n/r) C(n−1,r−1)**: n!/((n−r)! r!) = (n/r) · (n−1)!/((n−r)! (r−1)!) と変形できる。","**C(n,r) = C(n−1,r−1) + C(n−1,r)**: 特定の1つを選ぶ場合(残りから r−1 個)と選ばない場合(残りから r 個)に分ける。","**C(n,0) = 1**: 何も選ばない選び方は1通り。式では 0! = 1 と約束するので n!/(n!·0!) = 1。"]},
     {ex:{q:"C(7,2) と必ず等しいのは？", a:["C(7,5)","C(7,3)","C(6,2)","C(7,7)"], term:"binomial", exp:"C(n,r) = C(n,n−r) なので C(7,2) = C(7,5)。2個選ぶことは、選ばない5個を決めることと同じです。"}},
     {key:["C(n,r) は n 個から r 個を選ぶ組合せの数(順序は区別しない)","P(n,r) = n!/(n−r)! は選んで並べる数","P(n,r) = r! × C(n,r)","C(n,r) = C(n,n−r)、C(n,0) = 1"]}
   ]},
   {id:"im-pascal", title:"パスカルの三角形と二項定理", min:7, requires:["im-binom"], terms:["pascal-triangle","binomial","binomial-theorem"], src:["im1"], blocks:[
     {p:"[[pascal-triangle]]の n 行目には C(n,0), C(n,1), …, C(n,n) が並びます。一番上を0行目と数えます。授業資料の性質は2つです。(1) 最初と最後の数は1。(2) すべての数は左上と右上の数の和。"},
     {w:"pascal"},
     {callout:"数をタップすると、その数が左上と右上の和になっている様子と、C(n,r) としての値を確かめられます。", kind:"info"},
     {ex:{q:"パスカルの三角形の6行目(一番上が0行目)の真ん中の数は？", a:["20","15","30","35"], term:"pascal-triangle", exp:"5行目は 1 5 10 10 5 1 なので、6行目の真ん中は 10 + 10 = 20(= C(6,3))。"}},
     {h:"二項定理"},
     {p:"[[binomial-theorem]]は (a+b)ⁿ = Σ C(n,r) aⁿ⁻ʳ bʳ(r = 0〜n)です。(a+b)ⁿ は (a+b) を n 個かけたもので、そのうち r 個から b を選ぶと aⁿ⁻ʳ bʳ ができるので、係数が C(n,r) になります。たとえば (a+b)³ = a³ + 3a²b + 3ab² + b³ で、係数 1, 3, 3, 1 はパスカルの三角形の3行目です。"},
     {ex:{q:"(a+b)⁴ を展開したときの a²b² の係数は？", a:["6","4","12","8"], term:"binomial-theorem", exp:"a²b² は4個の (a+b) のうち2個から b を選ぶ場合なので C(4,2) = 6。4行目 1 4 6 4 1 の真ん中です。"}},
     {key:["パスカルの三角形の n 行目は C(n,0)〜C(n,n)","各数は左上と右上の数の和(C(n,r) = C(n−1,r−1) + C(n−1,r))","二項定理: (a+b)ⁿ の係数が C(n,r)"]}
   ]}
 ]}
];
ST.LESSON = {}; ST.COURSES.forEach(c => c.lessons.forEach((l, i) => { l.course = c.id; l.idx = i; ST.LESSON[l.id] = l; }));
ST.COURSE = Object.fromEntries(ST.COURSES.map(c => [c.id, c]));
