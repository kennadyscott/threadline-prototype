/* Threadline — Trial + paywall UI. Included on app pages after preview.js.
   Reads the access state published by tl-cloud.js (window.TL_ACCESS / the
   "tl:access" event / localStorage "threadline.access"):
     - trial   → small "N days left" chip linking to plans
     - expired → persistent paywall bar + one-time modal, and gates the
                 make-it-real actions (via window.tlGate) and any AI/image call.
   On static hosts with no /api (the GitHub Pages demo) there is no access
   state, so this stays completely inert. */
(function () {
  function getAccess() {
    if (window.TL_ACCESS) return window.TL_ACCESS;
    try { return JSON.parse(localStorage.getItem("threadline.access") || "null"); } catch (e) { return null; }
  }

  function checkout(plan) {
    fetch("/api/billing", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "checkout", plan: plan || "starter" }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.url) location.href = d.url; else alert((d && d.error) || "Could not start checkout — try again from Settings."); })
      .catch(function () { location.href = "/settings"; });
  }
  window.tlSubscribe = checkout;

  /* ---- trial countdown chip ---- */
  function chip(days) {
    var ex = document.getElementById("tltrialchip");
    if (ex) { ex.querySelector("b").textContent = days + " day" + (days === 1 ? "" : "s"); return; }
    var c = document.createElement("div");
    c.id = "tltrialchip";
    c.style.cssText = "position:fixed;top:10px;right:14px;z-index:210;background:#0f172a;color:#fff;font:700 12px Satoshi,system-ui,sans-serif;padding:6px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(15,23,42,.2);cursor:pointer;display:flex;gap:6px;align-items:center;white-space:nowrap";
    c.innerHTML = '✦ Trial: <b style="color:#7dd3fc">' + days + " day" + (days === 1 ? "" : "s") + '</b> left <span style="opacity:.55">· Subscribe</span>';
    c.onclick = function () { location.href = "/settings"; };
    document.body.appendChild(c);
  }

  /* ---- expired paywall ---- */
  var PLANS = [
    ["starter", "Starter", "$19", "Plan & create for 1 brand"],
    ["pro", "Pro", "$39", "3 brands + auto-publish (1 connected)"],
    ["studio", "Studio", "$99", "10 brands + auto-publish (3 connected)"],
  ];
  function bar() {
    if (document.getElementById("tlpwbar")) return;
    var b = document.createElement("div");
    b.id = "tlpwbar";
    b.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:230;display:flex;gap:14px;align-items:center;justify-content:center;background:#0f172a;color:#fff;font:700 13.5px Satoshi,system-ui,sans-serif;padding:11px 18px;box-shadow:0 -8px 30px rgba(15,23,42,.3)";
    b.innerHTML = '<span>Your 30-day free trial has ended. Your brand &amp; plan are saved — <b style="background:linear-gradient(135deg,#a78bfa,#22d3ee);-webkit-background-clip:text;background-clip:text;color:transparent">keep building</b> for $19/mo.</span>'
      + '<button id="tlpwsub" style="background:linear-gradient(135deg,#803dff,#3b82f6);color:#fff;font:800 13px Satoshi,system-ui,sans-serif;border:none;border-radius:10px;padding:9px 16px;cursor:pointer;white-space:nowrap">Subscribe →</button>';
    document.body.appendChild(b);
    document.body.style.paddingBottom = "60px";
    document.getElementById("tlpwsub").onclick = function () { modal(); };
  }
  function modal() {
    if (document.getElementById("tlpw")) { document.getElementById("tlpw").style.display = "flex"; return; }
    var m = document.createElement("div");
    m.id = "tlpw";
    m.style.cssText = "position:fixed;inset:0;z-index:240;background:rgba(8,11,22,.55);display:flex;align-items:center;justify-content:center;padding:22px";
    m.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:452px;width:100%;padding:30px;font-family:Satoshi,system-ui,sans-serif;box-shadow:0 30px 80px rgba(8,11,22,.4);text-align:center">'
      + '<div style="font-size:30px">✦</div>'
      + '<h2 style="font:900 22px Satoshi,system-ui,sans-serif;margin:8px 0 6px;color:#0f172a">Your free trial has ended</h2>'
      + '<p style="color:#54607a;font-size:14.5px;line-height:1.6;margin-bottom:20px">You built your brand and planned your content — nice work. To keep creating, generating, and scheduling, pick a plan. Everything you’ve made stays exactly where it is.</p>'
      + '<div id="tlpwplans" style="display:flex;flex-direction:column;gap:9px;text-align:left"></div>'
      + '<button id="tlpwlook" style="margin-top:16px;background:none;border:none;color:#8b96ad;font-weight:700;font-size:13px;cursor:pointer;text-decoration:underline">View my plan (read-only)</button>'
      + "</div>";
    document.body.appendChild(m);
    var ph = document.getElementById("tlpwplans");
    PLANS.forEach(function (p) {
      var el = document.createElement("button");
      el.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;border:1.5px solid #e6e9f1;background:#fff;border-radius:12px;padding:12px 14px;cursor:pointer;text-align:left;font-family:inherit";
      el.onmouseover = function () { el.style.borderColor = "#803dff"; };
      el.onmouseout = function () { el.style.borderColor = "#e6e9f1"; };
      el.innerHTML = '<span><b style="font:800 14px Satoshi,system-ui,sans-serif;color:#0f172a">' + p[1] + '</b> <span style="color:#8b96ad;font-size:12px">' + p[3] + '</span></span>'
        + '<span style="font:900 15px Satoshi,system-ui,sans-serif;color:#803dff">' + p[2] + '<span style="font-size:11px;color:#8b96ad">/mo</span></span>';
      el.onclick = function () { checkout(p[0]); };
      ph.appendChild(el);
    });
    document.getElementById("tlpwlook").onclick = function () { m.style.display = "none"; };
  }
  function paywall(force) {
    bar();
    if (force) modal();
  }

  // Gate the "make it real" actions when expired (composes with preview.js).
  function armGate() {
    var prev = window.tlGate;
    window.tlGate = function (msg) {
      var a = getAccess();
      if (a && a.state === "expired") { paywall(true); return true; }
      return prev ? prev(msg) : false;
    };
  }

  // Any AI/image call that comes back 402 (trial ended) pops the paywall.
  function wrapFetch() {
    if (window.fetch && window.fetch._tlpw) return;
    var of = window.fetch;
    var wrapped = function () {
      var args = arguments;
      return of.apply(this, args).then(function (r) {
        try {
          var u = args[0] && args[0].url ? args[0].url : args[0];
          if (r && r.status === 402 && typeof u === "string" && (u.indexOf("/api/ai") > -1 || u.indexOf("/api/image") > -1)) {
            paywall(true);
          }
        } catch (e) {}
        return r;
      });
    };
    wrapped._tlpw = 1;
    window.fetch = wrapped;
  }

  function apply(a) {
    if (!a) return;
    if (a.state === "trial" && a.trialDaysLeft != null) chip(a.trialDaysLeft);
    if (a.state === "expired") { paywall(false); armGate(); wrapFetch(); }
  }

  var a0 = getAccess();
  if (a0) apply(a0);
  document.addEventListener("tl:access", function (e) { apply(e.detail); });
})();
