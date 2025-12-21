// my.js (서버 연동 최종본)
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
  const editBtn = document.getElementById("btnEditProfile");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      location.href = "./edit_profile.html";
    });
  }

  /* =====================
   * 화면 렌더링
   * ===================== */
  function renderMe(me) {
    const nickname = me.nickname || me.userId || "사용자";
    const dong = me.dong || "내 동네";

    document.getElementById("nicknameText").textContent = nickname;
    document.getElementById("dongText").textContent = dong;

    const sideDong = document.getElementById("dongTextSide");
    if (sideDong) sideDong.textContent = dong;

    const avatar = me.profileInitial || (nickname ? nickname[0] : "?");
    document.getElementById("avatarText").textContent = avatar;

    document.getElementById("statShared").textContent = me.sharedCount ?? 0;
    document.getElementById("statThanks").textContent = me.thanksCount ?? 0;
    document.getElementById("statTrust").textContent =
      (me.trustPercent ?? 0) + "%";

    document.getElementById("trustCount").textContent = me.thanksCount ?? 0;
  }

  /* =====================
   * 서버에서 내 정보 조회
   * ===================== */
  async function loadMe() {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) {
        console.error("me api failed:", res.status);

        // 🔁 fallback (localStorage)
        const local = Auth.getUser();
        if (local) renderMe(local);
        return;
      }

      const me = await res.json();
      renderMe(me);
    } catch (e) {
      console.error("me api error:", e);

      // 🔁 fallback
      const local = Auth.getUser();
      if (local) renderMe(local);
    }
  }

  loadMe();
})();
// ✅ 검색하면 main으로 이동해서 검색되게
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  function goMainSearch() {
    const q = searchInput.value.trim();
    const url = q ? `./main.html?q=${encodeURIComponent(q)}` : `./main.html`;
    window.location.href = url;
  }

  // 엔터로 검색
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goMainSearch();
    }
  });

  // 돋보기 클릭 검색
  document
    .querySelector(".search-bar span")
    ?.addEventListener("click", goMainSearch);
}
(async function () {
  // 로그인 유저 정보 가져오기
  const me =
    window.Auth?.getUser?.() || window.Auth?.getSessionUser?.() || null;

  const myUserId = me?.userId ?? null;

  const sharedEl = document.getElementById("statShared");
  if (!sharedEl) return;

  // 로그인 안 되어 있으면 0
  if (!myUserId) {
    sharedEl.textContent = "0";
    return;
  }

  try {
    const res = await fetch("/api/items", { credentials: "include" });
    const items = await res.json();

    const list = Array.isArray(items) ? items : [];

    // ✅ 내가 등록한 물품 수
    const myItemCount = list.filter((it) => it.ownerUserId === myUserId).length;

    sharedEl.textContent = String(myItemCount);
  } catch (e) {
    console.error("공유한 물품 수 로드 실패", e);
    sharedEl.textContent = "0";
  }
})();
(async function () {
  // 로그인 유저 정보
  const me =
    window.Auth?.getUser?.() || window.Auth?.getSessionUser?.() || null;

  const myUserId = me?.userId ?? null;

  const chipHistory = document.getElementById("chipHistory");
  if (!chipHistory) return;

  if (!myUserId) {
    chipHistory.textContent = "0";
    return;
  }

  try {
    const res = await fetch("/api/items", { credentials: "include" });
    const items = await res.json();
    const list = Array.isArray(items) ? items : [];

    // ✅ 현재 기준: 내가 등록한 글 전부 = 판매중
    const sellingCount = list.filter(
      (it) => it.ownerUserId === myUserId
    ).length;

    chipHistory.textContent = String(sellingCount);
  } catch (e) {
    console.error("판매/대여 내역 수 로드 실패", e);
    chipHistory.textContent = "0";
  }
})();
