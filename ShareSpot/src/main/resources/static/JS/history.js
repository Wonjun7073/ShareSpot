(function () {
  // ====== 탭 전환(HTML에서 onclick 쓰고 있으니 전역으로 노출) ======
  window.switchTab = function (tabName) {
    const sellingList = document.getElementById("selling-list");
    const soldList = document.getElementById("sold-list");
    const tabs = document.querySelectorAll(".tab-item");

    if (!sellingList || !soldList || tabs.length < 2) return;

    if (tabName === "selling") {
      sellingList.classList.remove("hidden");
      soldList.classList.add("hidden");
      tabs[0].classList.add("active");
      tabs[1].classList.remove("active");
    } else {
      sellingList.classList.add("hidden");
      soldList.classList.remove("hidden");
      tabs[0].classList.remove("active");
      tabs[1].classList.add("active");
    }
  };

  // ====== 유틸 ======
  function formatTimeAgo(createdAt) {
    const t = new Date(createdAt);
    if (Number.isNaN(t.getTime())) return "";
    const diff = Math.floor((Date.now() - t.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function badgeClassByCategory(cat) {
    const c = (cat || "").trim();
    if (c === "나눔") return "green";
    if (c === "대여") return "blue";
    if (c === "교환") return "purple";
    return "green";
  }

  function priceTextByItem(it) {
    const cat = (it.category || "").trim();
    if (cat === "대여") return `${Number(it.price || 0).toLocaleString()}원`;
    if (cat === "교환") return "교환 🔄";
    return "나눔 🎁";
  }

  // ====== 카드 렌더 (✅ 삭제 버튼 포함) ======
  function toHistoryCardHTML(it) {
    const imgSrc = it.imageUrl
      ? it.imageUrl
      : "https://placehold.co/476x476?text=No+Image";

    const cat = (it.category || "").trim();

    return `
      <div class="history-card" data-item-id="${it.id}">
        <div class="card-img-box">
          <img src="${imgSrc}" alt="상품이미지" style="width: 100%; height: 100%; object-fit: cover" />
          
        </div>
        <div class="card-info">
          <div class="status-row">
            <span class="status-badge ${badgeClassByCategory(
              cat
            )}">${escapeHTML(cat)}</span>
            <span class="time-text">${formatTimeAgo(it.createdAt)}</span>
          </div>
          <h3 class="card-title">${escapeHTML(it.title)}</h3>
          <p class="card-price">${priceTextByItem(it)}</p>
          <div class="card-footer">
            <span class="location">${escapeHTML(it.location || "")}</span>
            <div class="meta-counts">
              <button class="delete-btn" data-del-id="${it.id}">삭제</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ====== confirm-modal 재사용(삭제 확인) ======
  let pendingDeleteId = null;
  let confirmOkAction = null;

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
    const cancelBtn = document.getElementById("confirmCancel");
    const okBtn = document.getElementById("confirmOk");

    function close() {
      overlay.classList.remove("show");
      overlay.setAttribute("aria-hidden", "true");
      pendingDeleteId = null;
      confirmOkAction = null;

      // 다음에 쓸 수 있게 cancel 숨김만 원복
      if (cancelBtn) cancelBtn.style.display = "";
    }

    cancelBtn.onclick = close;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    okBtn.onclick = async () => {
      if (typeof confirmOkAction === "function") await confirmOkAction();
      close();
    };
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

  async function deleteItemConfirmed(idNum) {
    const res = await fetch(`/api/items/${idNum}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return openConfirm({
        title: "삭제 실패",
        message: `삭제에 실패했습니다.<br/><small>${txt || res.status}</small>`,
        showCancel: false,
        okText: "닫기",
      });
    }

    await loadMyHistory(); // ✅ 삭제 후 목록 갱신
  }

  function askDelete(id) {
    const idNum = Number(id);
    if (!Number.isFinite(idNum)) return;

    pendingDeleteId = idNum;

    openConfirm({
      title: "삭제 확인",
      message: "정말 삭제하시겠습니까?",
      showCancel: true,
      cancelText: "취소",
      okText: "삭제",
      onOk: async () => {
        await deleteItemConfirmed(pendingDeleteId);
      },
    });
  }

  // ====== 내 글 로딩 ======
  async function loadMyHistory() {
    const sellingList = document.getElementById("selling-list");
    const soldList = document.getElementById("sold-list");

    const sellingCountEl = document.getElementById("sellingCount");
    const soldCountEl = document.getElementById("soldCount");

    // 로그인 유저
    const me =
      window.Auth?.getUser?.() || window.Auth?.getSessionUser?.() || null;
    const myUserId = me?.userId ?? null;

    if (!myUserId) {
      sellingList.innerHTML =
        '<p style="text-align:center;color:#888;padding:40px;">로그인이 필요합니다.</p>';
      soldList.innerHTML = "";
      sellingCountEl && (sellingCountEl.textContent = "0");
      soldCountEl && (soldCountEl.textContent = "0");
      return;
    }

    try {
      const res = await fetch("/api/items", { credentials: "include" });
      const items = await res.json();
      const list = Array.isArray(items) ? items : [];

      // ✅ 내가 등록한 글만
      const mine = list.filter((it) => it.ownerUserId === myUserId);

      // ✅ 요구사항: 일단 전부 판매중
      const selling = mine;
      const sold = [];

      sellingCountEl && (sellingCountEl.textContent = String(selling.length));
      soldCountEl && (soldCountEl.textContent = String(sold.length));

      sellingList.innerHTML =
        selling.length === 0
          ? '<p style="text-align:center;color:#888;padding:40px;">판매/대여 중인 물품이 없습니다.</p>'
          : selling.map(toHistoryCardHTML).join("");

      soldList.innerHTML =
        sold.length === 0
          ? '<p style="text-align:center;color:#888;padding:40px;">거래완료 내역이 없습니다.</p>'
          : sold.map(toHistoryCardHTML).join("");
    } catch (e) {
      console.error(e);
      sellingList.innerHTML =
        '<p style="text-align:center;color:red;padding:40px;">내역을 불러오지 못했습니다.</p>';
    }
  }

  // ✅ 외부에서 호출할 수도 있게
  window.loadMyHistory = loadMyHistory;

  // ====== 이벤트 위임(삭제 버튼) ======
  document.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".delete-btn[data-del-id]");
    if (!delBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const id = delBtn.dataset.delId;
    askDelete(id);
  });
  // ====== 이벤트 위임(카드 클릭 -> detail 이동) ======
  document.addEventListener("click", (e) => {
    // ❌ 삭제 버튼 클릭이면 상세 이동 막기
    if (e.target.closest(".delete-btn")) return;

    // ✅ 카드 클릭이면 detail로 이동
    const card = e.target.closest(".history-card[data-item-id]");
    if (!card) return;

    const id = card.dataset.itemId;
    if (!id) return;

    window.location.href = `/html/detail.html?id=${encodeURIComponent(id)}`;
  });

  // ====== 시작 ======
  document.addEventListener("DOMContentLoaded", loadMyHistory);
})();
