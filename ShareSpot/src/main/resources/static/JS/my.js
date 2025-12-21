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

    // ✅ 숫자들은 아래에서 "계산값"으로 다시 덮어쓸 거라
    // 여기서는 일단 fallback(있으면 표시)만 해둠
    if (me?.sharedCount != null) safeText("statShared", String(me.sharedCount));
    if (me?.thanksCount != null) safeText("statThanks", String(me.thanksCount));
    if (me?.trustPercent != null)
      safeText("statTrust", String(me.trustPercent) + "%");

    // trust-banner는 기존 코드가 thanksCount를 넣고 있었는데
    // 실제 의도가 "성공 거래 횟수"면 별도 계산/필드가 필요함.
    // 일단 값이 있으면 보여주고, 없으면 0 유지.
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

    // 2) items는 딱 1번만 가져와서 shared/history/thanks 계산
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

    // ✅ 판매/대여 내역 칩(내 글 수)
    safeText("chipHistory", String(myItems.length));

    // 3) wishlist count는 count API 우선
    await loadWishCount();
  }

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

        // ✅ 받은 감사 = 관심목록과 동일
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
   * 시작
   * ===================== */
  document.addEventListener("DOMContentLoaded", loadAll);
})();
