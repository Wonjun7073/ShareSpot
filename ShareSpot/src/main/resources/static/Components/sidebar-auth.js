(function () {
  async function mountLogoutModal() {
    // ⚠️ 네 프로젝트는 logout-modal.html을 confirmModal(id)로 쓰는 구조
    if (document.getElementById("confirmModal")) return;

    const root = document.getElementById("modal-root");
    if (!root) return;

    const res = await fetch("../Components/logout-modal.html");
    root.innerHTML = await res.text();
  }

  function bindLogoutModal() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    const modal = document.getElementById("confirmModal");
    const title = document.getElementById("modalTitle");
    const message = document.getElementById("modalMessage");
    const cancelBtn = document.getElementById("modalCancel");
    const okBtn = document.getElementById("modalOk");

    if (!modal || !title || !message || !cancelBtn || !okBtn) return;

    function open() {
      title.textContent = "로그아웃";
      message.textContent = "정말 로그아웃하시겠습니까?";
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    }

    function close() {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
    }

    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });

    cancelBtn.onclick = close;
    okBtn.onclick = () => {
      close();
      Auth.logout();
      location.href = "./login.html";
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  // ✅ 추가: 사이드바 동네 텍스트 갱신
  async function updateSidebarDong() {
    const dongEl = document.getElementById("sidebarDongText");
    if (!dongEl) return;

    // 1) 서버 세션 기준 me 조회
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (res.ok) {
        const me = await res.json();
        if (me?.dong) {
          dongEl.textContent = me.dong;
          return;
        }
      }
    } catch (e) {
      // 무시하고 로컬로 fallback
    }

    // 2) fallback: 로컬 Auth에 dong가 있으면 사용
    const localMe =
      window.Auth?.getUser?.() || window.Auth?.getSessionUser?.() || null;

    if (localMe?.dong) {
      dongEl.textContent = localMe.dong;
    }
  }

  // ✅ 추가: 채팅 배지 갱신 (채팅방 unread 합)
  async function updateChatBadge() {
    const badge = document.getElementById("chatBadge");
    if (!badge) return;

    try {
      const res = await fetch("/api/chat/rooms", { credentials: "include" });
      if (!res.ok) {
        badge.style.display = "none";
        return;
      }

      const rooms = await res.json();
      const count = Array.isArray(rooms)
        ? rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0)
        : 0;

      if (count > 0) {
        badge.textContent = count;
        badge.style.display = "inline-flex";
      } else {
        badge.style.display = "none";
      }
    } catch (e) {
      console.warn("updateChatBadge fail", e);
      badge.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await mountLogoutModal();
    bindLogoutModal();
    updateChatBadge();
    updateSidebarDong();

    // (선택) 다른 페이지에서도 동네가 바뀌었을 때 즉시 반영하고 싶으면:
    // account_settings.js에서 localStorage.setItem("USER_DONG", dong) 같은 걸 해주면
    // 아래가 자동 반영됨.
    window.addEventListener("storage", (e) => {
      if (e.key === "USER_DONG") updateSidebarDong();
    });
  });
})();
