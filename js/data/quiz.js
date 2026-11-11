"use strict";
/* Quiz. a[0] is always the correct answer (the UI shuffles). term and exp are required. */
ST.QUIZ = [
 {q:"{1,2,3,4} から2個選ぶ組合せは何通り？", a:["6通り","12通り","8通り","4通り"], term:"binomial", exp:"選ぶだけで順序を区別しないので C(4,2) = 4·3 / (2·1) = 6 通り。12通りは並べる場合 P(4,2) の値。"},
 {q:"{A,B,C,D} から2個選んで並べる数 P(4,2) は？", a:["12通り","6通り","24通り","8通り"], term:"permutation", exp:"P(4,2) = 4·3 = 12 通り。AB と BA は別の並べ方として数える。"}
];
