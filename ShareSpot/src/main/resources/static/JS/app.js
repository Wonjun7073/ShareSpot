(function () {
  const grid = document.getElementById("itemGrid");
  const searchInput = document.getElementById("searchInput");
  const menuItems = document.querySelectorAll(".menu-item");
  let currentQuery = "";

  let chatMenuBtn = null;
  let homeMenuBtn = null;
  let pendingDeleteId = null;
  let confirmOkAction = null;
  let allItems = []; // 전체 목록 저장
  let currentCategory = "전체"; // 현재 선택된 카테고리

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
      overlay.setAttribute("aria-hidden", "true");
      pendingDeleteId = null;
      confirmOkAction = null;

      // ✅ 다음에 다른 용도로 열 수 있게 "숨김만" 원복
      const cancelBtn = document.getElementById("confirmCancel");
      if (cancelBtn) cancelBtn.style.display = "";
    }

    cancelBtn.onclick = close;

    // (선택) 바깥 영역 클릭하면 닫기
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    okBtn.onclick = async () => {
      if (typeof confirmOkAction === "function") {
        await confirmOkAction();
      }
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

    const isMine = myUserId && it.ownerUserId === myUserId;

    const roomBtn = isMine
      ? "" // ✅ 내 글이면 채팅 버튼 안 보이게
      : it.id != null
      ? `<button class="chat-btn" data-item-id="${it.id}">1:1 채팅</button>`
      : `<button class="chat-btn" disabled>1:1 채팅</button>`;

    // ✅ 상세 페이지 이동을 위해 data-detail-id를 카드 전체 영역에 심었습니다.
    return `
      <div class="card" data-detail-id="${it.id}" style="cursor: pointer;">
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
            
          </div>
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
        ).toLowerCase();
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

  async function openConfirm({
    title,
    message,
    cancelText,
    okText,
    showCancel,
    onOk,
  }) {
    await mountConfirmModal();

    const overlay = document.getElementById("confirmOverlay");
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    const cancelBtn = document.getElementById("confirmCancel");
    const okBtn = document.getElementById("confirmOk");

    if (titleEl) titleEl.textContent = title ?? "확인";
    if (msgEl) msgEl.innerHTML = message ?? "";

    if (cancelBtn) {
      cancelBtn.textContent = cancelText ?? "취소";
      cancelBtn.style.display = showCancel === false ? "none" : "";
    }

    if (okBtn) okBtn.textContent = okText ?? "확인";

    confirmOkAction = typeof onOk === "function" ? onOk : null;

    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
  }

  /* =========================
   * 홈 렌더
   * ========================= */
  async function renderHome() {
    try {
      const res = await fetch("/api/items", { credentials: "include" });
      const items = await res.json();

      allItems = Array.isArray(items) ? items : [];

      // 필터 적용해서 렌더
      renderItems();
    } catch (e) {
      console.error(e);
      grid.innerHTML =
        '<p style="text-align:center;color:red;">목록을 불러오지 못했습니다.</p>';
    }

    menuItems.forEach((el) => el.classList.remove("active"));
    if (homeMenuBtn) homeMenuBtn.classList.add("active");
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentQuery = searchInput.value;
      renderItems(); // 카테고리 + 검색 동시 적용
    });

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

    return openConfirm({
      title: "삭제 확인",
      message: "정말 삭제하시겠습니까?",
      showCancel: true,
      cancelText: "취소",
      okText: "삭제",
      onOk: async () => {
        await deleteItemConfirmed(pendingDeleteId);
      },
    });
  };

  /* =========================
   * 채팅방 생성 → 목록 이동
   * ========================= */
  window.openChatList = async function (itemId) {
    const idNum = Number(itemId);

    if (!Number.isFinite(idNum)) {
      return openConfirm({
        title: "채팅방 생성 실패",
        message: "잘못된 상품 정보입니다.",
        showCancel: false,
        okText: "닫기",
      });
    }

    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: idNum }),
      });

      if (!res.ok) {
        // 서버가 준 메시지 있으면 최대한 짧게 추출
        const ct = res.headers.get("content-type") || "";
        let serverMsg = "";

        if (ct.includes("application/json")) {
          const err = await res.json().catch(() => null);
          serverMsg = err?.message || err?.error || "";
        } else {
          serverMsg = await res.text().catch(() => "");
        }

        return openConfirm({
          title: "채팅방 생성 실패",
          message:
            "채팅방을 만들 수 없습니다.<br/>" +
            `<small>${serverMsg || `오류 코드: ${res.status}`}</small>`,
          showCancel: false,
          okText: "닫기",
        });
      }

      const room = await res.json().catch(() => null);

      if (!room || room.id == null) {
        return openConfirm({
          title: "채팅방 생성 실패",
          message:
            "채팅방 정보를 가져오지 못했습니다.<br/><small>잠시 후 다시 시도해주세요.</small>",
          showCancel: false,
          okText: "닫기",
        });
      }

      const meId =
        window.Auth?.getUser?.()?.userId ||
        window.Auth?.getSessionUser?.()?.userId ||
        "";

      if (!meId) {
        return openConfirm({
          title: "로그인이 필요해요",
          message: "채팅을 사용하려면 로그인 후 다시 시도해주세요.",
          showCancel: false,
          okText: "닫기",
        });
      }

      const peer =
        meId === room.buyerUserId ? room.sellerUserId : room.buyerUserId;

      if (!peer) {
        return openConfirm({
          title: "채팅방 생성 실패",
          message:
            "상대방 정보를 찾지 못했습니다.<br/><small>잠시 후 다시 시도해주세요.</small>",
          showCancel: false,
          okText: "닫기",
        });
      }

      window.location.href = `/html/chat_room.html?room=${encodeURIComponent(
        room.id
      )}&me=${encodeURIComponent(meId)}&peer=${encodeURIComponent(peer)}`;
    } catch (e) {
      console.error(e);
      return openConfirm({
        title: "채팅방 생성 실패",
        message:
          "서버 연결에 실패했습니다.<br/><small>잠시 후 다시 시도해주세요.</small>",
        showCancel: false,
        okText: "닫기",
      });
    }
  };

  /* =========================
   * 클릭 이벤트 위임 (수정됨)
   * ========================= */
  if (grid) {
    grid.addEventListener("click", (e) => {
      // 1. 삭제 버튼 클릭 처리
      const delBtn = e.target.closest(".delete-btn[data-del-id]");
      if (delBtn) {
        const id = Number(delBtn.dataset.delId);
        if (Number.isFinite(id)) window.deleteItem(id);
        return;
      }

      // 2. 채팅 버튼 클릭 처리 (친구 코드 로직 유지)
      const chatBtn = e.target.closest(".chat-btn[data-item-id]");
      if (chatBtn) {
        const itemId = Number(chatBtn.dataset.itemId);
        if (Number.isFinite(itemId)) window.openChatList(itemId);
        return;
      }

      // 3. ✅ 카드 영역 클릭 시 상세 페이지 이동 (추가됨)
      const card = e.target.closest(".card[data-detail-id]");
      if (card) {
        const id = card.getAttribute("data-detail-id");
        location.href = `/html/detail.html?id=${id}`;
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
