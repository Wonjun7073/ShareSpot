(function () {
  const grid = document.getElementById("itemGrid");
  const searchInput = document.getElementById("searchInput");
  const menuItems = document.querySelectorAll(".menu-item");

  let chatMenuBtn = null;
  let homeMenuBtn = null;

  // 로그인 유저
  const me = window.Auth?.getUser?.();
  const myUserId = me?.userId || null;

  menuItems.forEach((item) => {
    if (item.innerText.includes("채팅")) chatMenuBtn = item;
    if (item.innerText.includes("홈")) homeMenuBtn = item;
  });

  /* =========================
   * 유틸
   * ========================= */
  function escapeHTML(str) {
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
    const priceText = it.price === 0 ? "나눔 🎁" : `${it.price.toLocaleString()}원`;

    // 💡 이미지 처리 로직: it.imageUrl(Base64)이 있으면 사용, 없으면 더미 이미지 사용
    const imgSrc = it.imageUrl ? it.imageUrl : "https://placehold.co/413x413";

    return `
      <div class="card">
        <div class="card-img-wrapper" style="width: 413px; height: 413px; overflow: hidden; background: #f0f0f0;">
            <img src="${imgSrc}" class="card-img" 
                 style="width: 100%; height: 100%; object-fit: cover;" 
                 onerror="this.src='https://placehold.co/413x413'"/>
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

            <button class="chat-btn" onclick="openChatList(${it.id})">
              1:1 채팅
            </button>

            ${canDelete
                ? `<button class="delete-btn" onclick="deleteItem(${it.id})">삭제</button>`
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
      const res = await fetch("/api/items", { credentials: "same-origin" });
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
        '<p style="text-align:center;color:red;">서버 오류</p>';
    }

    menuItems.forEach((el) => el.classList.remove("active"));
    if (homeMenuBtn) homeMenuBtn.classList.add("active");
  }

  /* =========================
   * 채팅방 생성 → 목록 이동
   * ========================= */
  window.openChatList = async function (itemId) {
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        alert("채팅방 생성 실패: " + (txt || res.status));
        return;
      }

      window.location.href = "/html/chat.html";
    } catch (e) {
      console.error(e);
      alert("채팅방 생성 중 오류");
    }
  };

  /* =========================
   * 삭제
   * ========================= */
  window.deleteItem = async function (id) {
    if (!confirm("삭제하시겠습니까?")) return;

    const res = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

    if (!res.ok) {
      alert("삭제 실패");
      return;
    }

    renderHome();
  };

  if (homeMenuBtn) {
    homeMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      renderHome();
    });
  }

  renderHome();
})();
