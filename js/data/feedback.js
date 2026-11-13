"use strict";
/* 匿名の要望フォームの送信先。Google フォームの「回答の送信先」を使う(サーバー不要・無料・名前やメールは集めない)。
   設定が空のあいだは、フォームは表示されるが送信できない(「準備中」と出る)。設定の手順は HANDOFF.md の「要望フォーム」。
   action: フォームの公開URLの `/viewform` を `/formResponse` に変えたもの。 field: 記述式の質問の `entry.数字`。 */
(function (ST) {
  ST.FEEDBACK = { action: "https://docs.google.com/forms/d/e/1FAIpQLSeCC0xNniFcruMHtSQWgVEQpSvi56yUn-wHOR50EZgvz4gY6g/formResponse", field: "entry.906870978", max: 1000 };
})(window.ST);
