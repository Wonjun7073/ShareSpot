(function () {
  const grid = document.getElementById("itemGrid");
  const searchInput = document.getElementById("searchInput");
  const menuItems = document.querySelectorAll(".menu-item");

  let chatMenuBtn = null;
  let homeMenuBtn = null;
  let pendingDeleteId = null;

  // 로그인 유저
  const me = window.Auth?.getUser?.();
  const myUserId = me?.userId || null;

  menuItems.forEach((item) => {
    if (item.innerText.includes("채팅")) chatMenuBtn = item;
    if (item.innerText.includes("홈")) homeMenuBtn = item;
  });

  async function mountConfirmModal() {
    if (document.getElementById("confirmOverlay")) return;

    const root = document.getElementById("modal-root");
    if (!root) return;

    const res = await fetch("../Components/confirm-modal.html");
    root.insertAdjacentHTML("beforeend", await res.text());

    bindConfirmModal();
  }

  function bindConfirmModal() {
    const overlay = document.getElementById("confirmOverlay");
    const closeBtn = document.getElementById("confirmClose");
    const cancelBtn = document.getElementById("confirmCancel");
    const okBtn = document.getElementById("confirmOk");

    function close() {
      overlay.classList.remove("show");
      pendingDeleteId = null;
    }

    cancelBtn.onclick = close;

    // (선택) 바깥 영역 클릭하면 닫기
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    okBtn.onclick = async () => {
      if (!pendingDeleteId) return;
      await deleteItemConfirmed(pendingDeleteId);
      close();
    };
  }

  /* =========================
   * 유틸
   * ========================= */
  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatTimeAgo(createdAt) {
    const t = new Date(createdAt);
    if (Number.isNaN(t.getTime())) return "";

    const diff = Math.floor((Date.now() - t.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }

  /* =========================
   * 카드 렌더링
   * ========================= */
  function toCardHTML(it) {
    const canDelete = myUserId && it.ownerUserId === myUserId;

    const priceText =
      it.price === 0 ? "나눔 🎁" : `${it.price.toLocaleString()}원`;

    const imgSrc = it.imageUrl
      ? it.imageUrl
      : "https://placehold.co/413x413?text=No+Image";

    const roomBtn =
      it.id != null
        ? `<button class="chat-btn" data-item-id="${it.id}">1:1 채팅</button>`
        : `<button class="chat-btn" disabled>1:1 채팅</button>`;

    return `
      <div class="card">
        <div class="card-img-wrap">
          <img src="${imgSrc}" class="card-img" alt="${escapeHTML(it.title)}" />
        </div>

        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(it.category)}</span>
            <span class="time-ago">${formatTimeAgo(it.createdAt)}</span>
          </div>

          <h3 class="card-title">${escapeHTML(it.title)}</h3>
          <p class="card-price">${priceText}</p>

          <div class="card-footer">
            <span>${escapeHTML(it.location)}</span>
            ${roomBtn}
            ${
              canDelete
                ? `<button class="delete-btn" data-del-id="${it.id}">삭제</button>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }

  /* =========================
   * 홈 렌더
   * ========================= */
  async function renderHome() {
    try {
      const res = await fetch("/api/items", { credentials: "include" });
      const items = await res.json();

      if (!Array.isArray(items) || items.length === 0) {
        grid.innerHTML =
          '<p style="text-align:center;color:#888;padding:40px;">등록된 물품이 없습니다.</p>';
        return;
      }

      grid.innerHTML = items.map(toCardHTML).join("");
    } catch (e) {
      console.error(e);
      grid.innerHTML =
        '<p style="text-align:center;color:red;">목록을 불러오지 못했습니다.</p>';
    }

    menuItems.forEach((el) => el.classList.remove("active"));
    if (homeMenuBtn) homeMenuBtn.classList.add("active");
  }

  /* =========================
   * 삭제 확정 (모달 OK에서만 실행)
   * ========================= */
  async function deleteItemConfirmed(idNum) {
    const res = await fetch(`/api/items/${idNum}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      alert("삭제 실패: " + (txt || res.status));
      return;
    }

    await renderHome();
  }

  /* =========================
   * 삭제 버튼 클릭 -> 모달만 띄우기
   * ========================= */
  window.deleteItem = async function (id) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return;

    pendingDeleteId = idNum;
    await mountConfirmModal();
    document.getElementById("confirmOverlay").classList.add("show");
  };

  /* =========================
   * 채팅방 생성 → 목록 이동
   * ========================= */
  window.openChatList = async function (itemId) {
    const idNum = Number(itemId);
    if (!Number.isFinite(idNum)) {
      alert("잘못된 상품 정보입니다.");
      return;
    }

    const res = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ itemId: idNum }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      alert("채팅방 생성 실패: " + (txt || res.status));
      return;
    }

    window.location.href = "/html/chat.html";
  };

  /* =========================
   * 클릭 이벤트 위임
   * ========================= */
  if (grid) {
    grid.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".delete-btn[data-del-id]");
      if (delBtn) {
        const id = Number(delBtn.dataset.delId);
        if (Number.isFinite(id)) window.deleteItem(id);
        return;
      }

      const chatBtn = e.target.closest(".chat-btn[data-item-id]");
      if (chatBtn) {
        const itemId = Number(chatBtn.dataset.itemId);
        if (Number.isFinite(itemId)) window.openChatList(itemId);
        return;
      }
    });
  }

  if (homeMenuBtn) {
    homeMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      renderHome();
    });
  }

  renderHome();
})();
