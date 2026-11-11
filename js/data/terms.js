"use strict";
/* Terms (用語). id = lowercase letters, digits and hyphens. Every term needs at least one source key. */
ST.TERM_CATS = ["すべて","組合せ論"];
ST.TERMS = [
 {id:"binomial", name:"二項係数", en:"Binomial coefficient", cat:"組合せ論", lab:"pascal",
  summary:"n 個の中から r 個を選ぶ組合せの数。記号は C(n,r) や n choose r。",
  how:"C(n,r) = n! / ((n−r)! r!) で求める。たとえば {1,2,3,4} から2個選ぶ組合せは C(4,2) = 4·3 / (2·1) = 6 通り。",
  risk:"順列（並べ方）と混ぜると数がずれる。選ぶだけなら順序は区別しない。",
  defense:["選ぶ順序を区別するかどうかを先に決める","小さな例（n=4 など）で数え上げて確かめる"],
  src:["im1"]},
 {id:"permutation", name:"順列", en:"Permutation", cat:"組合せ論",
  summary:"n 個のものを並べ替えた数、または n 個の中から r 個を選んで並べる数 P(n,r)。",
  how:"P(n,r) = n! / (n−r)!。P(4,2) = 4·3 = 12 通り。P(n,r) = r! × C(n,r) の関係があるので、C(n,r) = P(n,r) / r! と書ける。",
  risk:"組合せ C(n,r) とは別物。並べる順序を区別するときが順列。",
  defense:["「順序が区別されるか」を問題文から読み取る","P(n,r) = r! × C(n,r) で組合せとの関係を確かめる"],
  src:["im1"]},
 {id:"pascal-triangle", name:"パスカルの三角形", en:"Pascal's triangle", cat:"組合せ論", lab:"pascal",
  summary:"各行に二項係数を並べた三角形。最初と最後は1で、ほかの数は左上と右上の数の和。",
  how:"n 行目には C(n,0), C(n,1), …, C(n,n) が並ぶ。5行目は 1 5 10 10 5 1。",
  risk:"行を数えるとき、一番上を0行目とする点に注意。",
  defense:["一番上を0行目と数える","左上と右上の和で次の行を作る"],
  src:["im1"]}
];
ST.TERM = Object.fromEntries(ST.TERMS.map(t => [t.id, t]));
