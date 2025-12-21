(function () {
  const grid = document.getElementById("itemGrid");
  const searchInput = document.getElementById("searchInput");
  const menuItems = document.querySelectorAll(".menu-item");
  let currentQuery = "";

  let chatMenuBtn = null;
  let homeMenuBtn = null;
  let pendingDeleteId = null;
  let allItems = []; // 전체 목록 저장
  let currentCategory = "전체"; // 현재 선택된 카테고리

  const me = window.Auth?.getUser?.();
  const myUserId = me?.userId || null;

  menuItems.forEach((item) => {
    if (item.innerText.includes("채팅")) chatMenuBtn = item;
    if (item.innerText.includes("홈")) homeMenuBtn = item;
  });

<<<<<<< HEAD
  function escapeHTML(str) {
    if (!str) return '';
=======
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
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatTimeAgo(createdAt) {
    const t = new Date(createdAt);
<<<<<<< HEAD
    if (Number.isNaN(t.getTime())) return '';
=======
    if (Number.isNaN(t.getTime())) return "";

>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
    const diff = Math.floor((Date.now() - t.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }

  /* =========================
<<<<<<< HEAD
   * 카드 HTML 생성
   * ========================= */
  function toCardHTML(it) {
    const canDelete = myUserId && it.ownerUserId === myUserId;
    const priceText =
      it.price === 0 ? '나눔 🎁' : `${Number(it.price).toLocaleString()}원`;

    // ▼▼▼ [수정] 이미지 경로 절대경로(/)로 변경 ▼▼▼
    const imgSrc = it.imageUrl ? it.imageUrl : '/Images/logo.png';
=======
   * 카드 렌더링
   * ========================= */
  function toCardHTML(it) {
    const canDelete = myUserId && it.ownerUserId === myUserId;

    const cat = (it.category || "").trim();

    let priceText = "";
    if (cat === "대여") {
      priceText = `${Number(it.price || 0).toLocaleString()}원`;
    } else if (cat === "교환") {
      priceText = "교환 🔄";
    } else {
      // 나눔(기본)
      priceText = "나눔 🎁";
    }

    const imgSrc = it.imageUrl
      ? it.imageUrl
      : "https://placehold.co/413x413?text=No+Image";
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc

    const roomBtn =
      it.id != null
        ? `<button class="chat-btn" data-item-id="${it.id}">1:1 채팅</button>`
        : `<button class="chat-btn" disabled>1:1 채팅</button>`;

    // ▼▼▼ [중요] data-detail-id 확인 ▼▼▼
    return `
<<<<<<< HEAD
    <div class="card" data-detail-id="${it.id}" style="cursor: pointer;">
      <img src="${imgSrc}" class="card-img" alt="${escapeHTML(
      it.title
    )}" style="object-fit: cover;" />
      <div class="card-body">
        <div class="card-top">
          <span class="badge-tag">${escapeHTML(it.category)}</span>
          <span class="time-ago">${formatTimeAgo(it.createdAt)}</span>
=======
      <div class="card">
        <div class="card-img-wrap">
          <img src="${imgSrc}" class="card-img" alt="${escapeHTML(it.title)}" />
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
        </div>

        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(it.category)}</span>
            <span class="time-ago">${formatTimeAgo(it.createdAt)}</span>
          </div>

<<<<<<< HEAD
        <div class="card-footer">
          <span>${escapeHTML(it.location)}</span>
          ${roomBtn}
          ${
            canDelete
              ? `<button class="delete-btn" data-del-id="${it.id}">삭제</button>`
              : ''
          }
=======
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
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
        </div>
      </div>
    `;
  }
  function renderItems() {
    if (!grid) return;

    const q = (currentQuery || "").trim().toLowerCase();

    // 1) 카테고리 필터
    let filtered =
      currentCategory === "전체"
        ? allItems
        : allItems.filter(
            (it) => (it.category || "").trim() === currentCategory
          );

    // 2) 검색 필터 (제목/지역/카테고리/가격텍스트/내용 등)
    if (q) {
      filtered = filtered.filter((it) => {
        const title = String(it.title || "").toLowerCase();
        const location = String(it.location || "").toLowerCase();
        const category = String(it.category || "").toLowerCase();
        const content = String(
          it.content || it.description || ""
        ).toLowerCase(); // 혹시 필드명이 다를 수 있어서 안전하게
        const price = String(it.price ?? "").toLowerCase();

        return (
          title.includes(q) ||
          location.includes(q) ||
          category.includes(q) ||
          content.includes(q) ||
          price.includes(q)
        );
      });
    }

    // 3) 렌더
    if (!Array.isArray(filtered) || filtered.length === 0) {
      grid.innerHTML =
        '<p style="text-align:center;color:#888;padding:40px;">검색 결과가 없습니다.</p>';
      return;
    }

    grid.innerHTML = filtered.map(toCardHTML).join("");
  }

  async function renderHome() {
    try {
      const res = await fetch("/api/items", { credentials: "include" });
      const items = await res.json();

<<<<<<< HEAD
      if (!Array.isArray(items) || items.length === 0) {
        grid.innerHTML =
          '<p style="text-align:center;padding:40px;">등록된 물품이 없습니다.</p>';
        return;
      }
      grid.innerHTML = items.map(toCardHTML).join('');
=======
      allItems = Array.isArray(items) ? items : [];

      // ✅ 필터 적용해서 렌더
      renderItems();
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
    } catch (e) {
      console.error(e);
      grid.innerHTML =
        '<p style="text-align:center;color:red;">목록을 불러오지 못했습니다.</p>';
    }
<<<<<<< HEAD
=======

    menuItems.forEach((el) => el.classList.remove("active"));
    if (homeMenuBtn) homeMenuBtn.classList.add("active");
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
  }
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentQuery = searchInput.value;
      renderItems(); // 카테고리 + 검색 동시 적용
    });

    // 엔터 눌렀을 때 폼 제출 같은 거 막기(혹시 모르니)
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });
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
  (function applyQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim();
    if (!q) return;

    currentQuery = q;
    if (searchInput) searchInput.value = q;
  })();
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
<<<<<<< HEAD
   * 이벤트 리스너 (클릭 처리)
   * ========================= */
  if (grid) {
    grid.addEventListener('click', (e) => {
      // 1. 삭제 버튼
      const delBtn = e.target.closest('.delete-btn[data-del-id]');
=======
   * 채팅방 생성 → 목록 이동
   * ========================= */
  window.openChatList = async function (itemId) {
    const idNum = Number(itemId);
    if (!Number.isFinite(idNum)) return alert("잘못된 상품 정보입니다.");

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

    const room = await res.json();
    const me =
      window.Auth?.getUser?.()?.userId ||
      window.Auth?.getSessionUser?.()?.userId ||
      "";
    const peer = me === room.buyerUserId ? room.sellerUserId : room.buyerUserId;

    window.location.href = `/html/chat_room.html?room=${encodeURIComponent(
      room.id
    )}&me=${encodeURIComponent(me)}&peer=${encodeURIComponent(peer)}`;
  };

  /* =========================
   * 클릭 이벤트 위임
   * ========================= */
  if (grid) {
    grid.addEventListener("click", (e) => {
      const delBtn = e.target.closest(".delete-btn[data-del-id]");
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
      if (delBtn) {
        e.stopPropagation();
        if (confirm('삭제하시겠습니까?')) deleteItem(delBtn.dataset.delId);
        return;
      }

<<<<<<< HEAD
      // 2. 채팅 버튼
      const chatBtn = e.target.closest('.chat-btn[data-item-id]');
=======
      const chatBtn = e.target.closest(".chat-btn[data-item-id]");
>>>>>>> bec324b63b7422c3b9d111f787c8f68a981194cc
      if (chatBtn) {
        e.stopPropagation();
        alert('채팅 기능 준비중');
        return;
      }

      // 3. ▼▼▼ [핵심 수정] 상세 페이지 이동 경로 절대경로(/html/...) 사용 ▼▼▼
      const card = e.target.closest('.card[data-detail-id]');
      if (card) {
        const id = card.getAttribute('data-detail-id');
        // 여기서 /html/detail.html 로 해야 확실하게 찾아갑니다!
        location.href = `/html/detail.html?id=${id}`;
      }
    });
  }

  async function deleteItem(id) {
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
      renderHome();
    } catch (err) {
      console.error(err);
    }
  }

  if (homeMenuBtn) {
    homeMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      renderHome();
    });
  }

  renderHome();

  // ✅ 카테고리 필터 버튼
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentCategory = btn.dataset.category || btn.innerText.trim() || "전체";

      // ✅ 이미 받아온 목록으로 다시 렌더(서버 재요청 X)
      renderItems();
    });
  });
})();
