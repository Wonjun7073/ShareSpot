(function () {
  async function mountLogoutModal() {
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

  // ✅ 추가: 채팅 배지 갱신 (채팅방 개수)
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
      const count = Array.isArray(rooms) ? rooms.length : 0;

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
    updateChatBadge(); // ✅ 추가
  });
})();
