"use strict";
/* Courses and lessons. Block types: {p}, {h}, {list}, {w: widget, o: opts}, {callout, kind}, {key: [...]}.
   Text uses ST.md markup (**bold**, `code`, [[term-id]]). Every lesson lists its sources.
   requires: lesson ids to read first (skill tree). [] = entry point. */
ST.COURSES = [
 {id:"im", n:"01", title:"情報数学", color:"var(--c1)", desc:"組合せ論。数え方を図とアニメーションで確かめる。",
  lessons:[
   {id:"im-binom", title:"二項係数とパスカルの三角形", min:6, requires:[], terms:["binomial","permutation","pascal-triangle"], src:["im1"], blocks:[
     {p:"n 個の中から r 個を選ぶ組合せの数を[[binomial]]といい、C(n,r) と書きます。順序を区別して並べる数は[[permutation]]です。"},
     {w:"pascal"},
     {h:"パスカルの三角形"},
     {p:"[[pascal-triangle]]の n 行目には C(n,0) から C(n,n) までが並びます。一番上を0行目と数えます。最初と最後の数は1で、ほかの数は左上と右上の数の和です。"},
     {callout:"上の三角形で数をタップすると、その数が左上と右上の和になっている様子を確かめられます。", kind:"info"},
     {key:["C(n,r) は n 個から r 個を選ぶ組合せの数","P(n,r) = r! × C(n,r)","パスカルの三角形の各数は左上と右上の和"]}
   ]}
 ]}
];
ST.LESSON = {}; ST.COURSES.forEach(c => c.lessons.forEach((l, i) => { l.course = c.id; l.idx = i; ST.LESSON[l.id] = l; }));
ST.COURSE = Object.fromEntries(ST.COURSES.map(c => [c.id, c]));
