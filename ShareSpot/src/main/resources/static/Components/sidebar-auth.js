(function () {
  async function mountLogoutModal() {
    // 모달이 이미 있으면 중복 로드 방지
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

    // 바깥 클릭 닫기(선택)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await mountLogoutModal();
    bindLogoutModal();
  });
})();
