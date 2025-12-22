// my.js (정리본: 중복 fetch 제거 + 받은 감사 = 내 글의 likeCount 합)
(function () {
  /* =====================
   * 로그인 가드
   * ===================== */
  if (window.Auth && typeof Auth.guard === "function") {
    Auth.guard();
  }

  /* =====================
   * 프로필 수정 이동
   * ===================== */
  document.getElementById("btnEditProfile")?.addEventListener("click", () => {
    location.href = "./edit_profile.html";
  });

  /* =====================
   * 유틸
   * ===================== */
  function getMeFromAuth() {
    return window.Auth?.getUser?.() || window.Auth?.getSessionUser?.() || null;
  }

  async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await res.json()
      : await res.text();
    return { ok: res.ok, status: res.status, data };
  }

  function safeText(elId, value) {
    const el = document.getElementById(elId);
    if (el) el.textContent = value;
  }

  /* =====================
   * 화면 렌더링 (me)
   * ===================== */
  function renderMe(me) {
    const nickname = me?.nickname || me?.userId || "사용자";
    const dong = me?.dong || "내 동네";
    const avatar = me?.profileInitial || (nickname ? nickname[0] : "?");

    safeText("nicknameText", nickname);
    safeText("dongText", dong);

    const sideDong = document.getElementById("dongTextSide");
    if (sideDong) sideDong.textContent = dong;

    safeText("avatarText", avatar);

    // fallback 표시
    if (me?.sharedCount != null) safeText("statShared", String(me.sharedCount));
    if (me?.thanksCount != null) safeText("statThanks", String(me.thanksCount));
    if (me?.trustPercent != null)
      safeText("statTrust", String(me.trustPercent) + "%");

    if (me?.trustCount != null) safeText("trustCount", String(me.trustCount));
  }

  /* =====================
   * 검색 → main으로 이동
   * ===================== */
  function bindSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    function goMainSearch() {
      const q = searchInput.value.trim();
      const url = q ? `./main.html?q=${encodeURIComponent(q)}` : `./main.html`;
      location.href = url;
    }

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goMainSearch();
      }
    });

    document
      .querySelector(".search-bar span")
      ?.addEventListener("click", goMainSearch);
  }

  /* =====================
   * 관심목록 카운트
   * ===================== */
  async function loadWishCount() {
    const chip = document.getElementById("chipWish");
    const thanksEl = document.getElementById("statThanks");
    const trustEl = document.getElementById("trustCount");
    if (!chip) return;

    try {
      // ⭐ count API 우선
      const countRes = await fetch("/api/wishlist/count", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (countRes.ok) {
        const data = await countRes.json();
        const c = Number(data.count ?? 0);

        chip.textContent = String(c);

        // ✅ 받은 감사 = 관심목록과 동일(현재 프로젝트 정책)
        if (thanksEl) thanksEl.textContent = String(c);
        if (trustEl) trustEl.textContent = String(c);
        return;
      }

      // fallback: 목록 길이
      const res = await fetch("/api/wishlist", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) return;

      const wishes = await res.json();
      const c = Array.isArray(wishes) ? wishes.length : 0;

      chip.textContent = String(c);
      if (thanksEl) thanksEl.textContent = String(c);
      if (trustEl) trustEl.textContent = String(c);
    } catch (e) {
      console.error("관심목록 개수 로드 실패", e);
    }
  }

  /* =====================
   * ✅ 거래중 카운트(판매/대여 내역 칩)
   * - 구매자/판매자 모두 보이게
   * - tradeId 중복 제거
   * - 거래중(IN_PROGRESS)만 표시
   * ===================== */
  async function updateTradeCountChipSafe() {
    try {
      const res = await fetch("/api/trades/my", { credentials: "include" });
      if (!res.ok) return;

      const list = await res.json();
      if (!Array.isArray(list)) return;

      // tradeId 기준 중복 제거
      const uniq = new Map();
      for (const t of list) {
        if (!t || t.tradeId == null) continue;
        uniq.set(String(t.tradeId), t);
      }

      // ✅ 거래중 + 거래완료 전부 포함
      const totalCount = uniq.size;

      // 1) id로 우선 업데이트
      const byId = document.getElementById("chipHistory");
      if (byId) {
        byId.textContent = String(totalCount);
        return;
      }

      // 2) fallback: 텍스트 기반 탐색
      const rows = document.querySelectorAll(
        ".panel-item, .panel-link, li, a, div"
      );
      for (const r of rows) {
        const text = (r.innerText || "").replace(/\s+/g, " ").trim();
        if (!text.includes("판매/대여") && !text.includes("거래목록")) continue;

        const chip = r.querySelector(".chip");
        if (chip) {
          chip.textContent = String(totalCount);
          return;
        }
      }
    } catch (e) {
      console.warn("updateTradeCountChipSafe fail", e);
    }
  }

  /* =====================
   * 한 번에 로드/계산
   * ===================== */
  async function loadAll() {
    bindSearch();

    // 1) me 먼저 로드
    let me = null;

    try {
      const { ok, data } = await fetchJSON("/api/user/me", {
        credentials: "include",
      });
      if (ok) me = data;
    } catch (e) {
      console.warn("me api error:", e);
    }

    // fallback: Auth 저장값
    if (!me) me = getMeFromAuth();
    if (me) renderMe(me);

    const myUserId = me?.userId ?? null;
    if (!myUserId) {
      // 로그인 안 되어 있으면 전부 0 처리
      safeText("statShared", "0");
      safeText("statThanks", "0");
      safeText("chipHistory", "0");
      safeText("chipWish", "0");
      safeText("trustCount", "0");
      return;
    }

    // 2) items는 1번만 가져와서 shared 계산
    let items = [];
    try {
      const { ok, data } = await fetchJSON("/api/items", {
        credentials: "include",
      });
      if (ok && Array.isArray(data)) items = data;
    } catch (e) {
      console.error("items load fail:", e);
    }

    const myItems = items.filter((it) => it.ownerUserId === myUserId);

    // ✅ 공유한 물품 수
    safeText("statShared", String(myItems.length));

    // ⚠️ 기존 정책: chipHistory를 "내 글 수"로 쓰던 코드
    // 구매자도 거래중이 보이게 하려면 아래 줄은 유지하더라도
    // 맨 마지막에 updateTradeCountChipSafe()로 덮어쓴다.
    safeText("chipHistory", String(myItems.length));

    // 3) wishlist count
    await loadWishCount();

    // ✅ 마지막에 거래중 카운트로 덮어쓰기(구매자/판매자 모두)
    await updateTradeCountChipSafe();
  }

  // ✅ 페이지 시작
  loadAll();
})();
async function loadSuccessTradeCount() {
  const el = document.getElementById("successTradeCount");
  if (!el) return;

  try {
    // ✅ 내 거래 목록을 가져온다 (너 app.js에서도 쓰는 API)
    const res = await fetch("/api/trades/my", { credentials: "include" });
    if (!res.ok) return;

    const trades = await res.json();

    // ✅ status가 COMPLETED인 것만 카운트
    const completedCount = trades.filter(
      (t) => String(t.status) === "COMPLETED"
    ).length;

    el.textContent = String(completedCount);
  } catch (e) {
    console.error("loadSuccessTradeCount error:", e);
  }
}

// ✅ my.html 로드 시 실행
document.addEventListener("DOMContentLoaded", () => {
  loadSuccessTradeCount();
});
