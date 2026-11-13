"use strict";
/* 要望タブ: 匿名の要望フォーム。名前・メール・IP などは集めず、入力も端末に保存しない(localStorage 等は使わない)。
   送信先は js/data/feedback.js(Google フォーム)。送信は fetch の no-cors POST で、Cookie と参照元(Referer)は付けない。 */
(function (ST) {
  const KINDS = ["要望", "不具合", "その他"];
  let lastSent = 0; // 連打防止(メモリ上だけ。保存しない)
  ST.view("feedback", v => {
    const F = ST.FEEDBACK || {}, ready = !!(F.action && F.field), max = F.max || 1000;
    let kind = KINDS[0];
    v.innerHTML = `<div class="page-h"><div class="eyebrow">Feedback</div><h1>匿名の要望</h1>
      <p class="lead">「こんなラボがほしい」「ここが分かりにくい」など、気づいたことを匿名で送れます。</p></div>
      <section class="card fb">
        <ul class="fb-priv"><li>送るのは<b>本文だけ</b>。名前・メールは集めず、管理者には誰が書いたか分かりません。</li><li>書いた内容は、この端末に<b>保存しません</b>。</li><li>本文に<b>名前・連絡先・個人が分かること</b>は書かないでください。返信はできません。</li></ul>
        ${ready ? "" : `<p class="fb-off">送信先がまだ設定されていません(準備中)。いまは送信できません。</p>`}
        <div class="filters" role="group" aria-label="種類">${KINDS.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === kind}">${k}</button>`).join("")}</div>
        <label class="field" for="fb-t">内容<textarea id="fb-t" class="input" rows="7" maxlength="${max}" placeholder="例: 制御工学のラボに、ステップ応答の比較がほしい" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea></label>
        <div class="fb-row"><span class="cap" id="fb-n">0 / ${max}</span><button type="button" class="btn primary" id="fb-s" disabled>匿名で送る</button></div>
        <p class="cap fb-msg" id="fb-m" role="status" aria-live="polite"></p>
      </section>`;
    const t = v.querySelector("#fb-t"), s = v.querySelector("#fb-s"), m = v.querySelector("#fb-m"), n = v.querySelector("#fb-n");
    const sync = () => { n.textContent = `${t.value.length} / ${max}`; s.disabled = !ready || !t.value.trim(); };
    t.oninput = sync; sync();
    ST.$$("[data-k]", v).forEach(b => b.onclick = () => { kind = b.dataset.k; ST.$$("[data-k]", v).forEach(x => x.setAttribute("aria-pressed", x === b)); });
    s.onclick = async () => {
      const body = t.value.trim().slice(0, max);
      if (!ready || !body) return;
      if (Date.now() - lastSent < 15000) { m.textContent = "続けて送るときは、少し待ってください。"; return; }
      s.disabled = true; m.textContent = "送信中…";
      try {
        const p = new URLSearchParams(); p.set(F.field, `【${kind}】\n${body}`);
        await fetch(F.action, { method: "POST", mode: "no-cors", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", body: p });
        lastSent = Date.now(); t.value = ""; m.textContent = "送りました。ありがとうございます。(送った内容は端末に残りません)";
      } catch (e) { m.textContent = "送れませんでした。通信を確認して、もう一度お試しください。"; }
      sync();
    };
  });
  ST.route("feedback", "feedback", "feedback");
})(window.ST);
