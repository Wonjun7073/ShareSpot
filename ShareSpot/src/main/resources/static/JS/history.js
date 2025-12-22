// history.js - 거래목록을 메인 앱카드(.card)와 동일한 UI로 렌더링

(function () {
  const inProgressRoot = document.getElementById("selling-list"); // 기존 id 유지(탭 js 때문)
  const completedRoot = document.getElementById("sold-list");
  const tabs = document.querySelectorAll(".tab-item");

  // ===== 탭 전환(HTML onclick에서 호출) =====
  window.switchTab = function (tabName) {
    if (!inProgressRoot || !completedRoot || !tabs || tabs.length < 2) return;

    if (tabName === "selling") {
      inProgressRoot.classList.remove("hidden");
      completedRoot.classList.add("hidden");
      tabs[0].classList.add("active");
      tabs[1].classList.remove("active");
    } else {
      inProgressRoot.classList.add("hidden");
      completedRoot.classList.remove("hidden");
      tabs[0].classList.remove("active");
      tabs[1].classList.add("active");
    }
  };

  // ===== 유틸 =====
  function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>\"']/g, (c) => {
      return (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c] || c
      );
    });
  }

  function formatTimeAgo(dateLike) {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "";

    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }

  function setTabCounts(inProgressCount, completedCount) {
    if (!tabs || tabs.length < 2) return;
    tabs[0].textContent = `거래중 (${inProgressCount})`;
    tabs[1].textContent = `거래완료 (${completedCount})`;
  }

  async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    return { ok: res.ok, status: res.status, data };
  }

  function priceTextByCategory(category, price) {
    const cat = (category || "").trim();
    if (cat === "대여") return `${Number(price || 0).toLocaleString("ko-KR")}원`;
    if (cat === "교환") return "교환 🔄";
    return "나눔 🎁";
  }

  // ===== 메인과 동일한 카드 HTML(.card) 생성 =====
  function toMainCardHTML({ item, trade }) {
    // item은 /api/items에서 가져온 원본(가능하면)
    // trade는 /api/trades/my에서 가져온 원본

    const id = item?.id ?? trade?.itemId ?? "";
    const title = item?.title ?? trade?.itemTitle ?? "";
    const category = item?.category ?? ""; // 없으면 빈값
    const location = item?.location ?? ""; // 없으면 빈값

    const imgSrc = item?.imageUrl
      ? item.imageUrl
      : "https://placehold.co/413x413?text=No+Image";

    const statusLabel = trade?.status === "COMPLETED" ? "거래완료" : "거래중";
    const timeAgo = formatTimeAgo(trade?.createdAt || item?.createdAt);

    // 가격 표기는 메인 규칙에 맞추되, item.category가 없으면 trade.itemPrice로 그냥 원 표기
    let priceText = "";
    if (category) {
      priceText = priceTextByCategory(category, item?.price ?? trade?.itemPrice);
    } else {
      // category를 못 구하면 최소한 숫자 원으로 표기
      const p = Number(trade?.itemPrice ?? 0);
      priceText = `${p.toLocaleString("ko-KR")}원`;
    }

    // 구매자면 거래완료 버튼 노출(메인 카드의 chat-btn 스타일 재사용)
    const completeBtn =
      trade?.canComplete
        ? `<button class="chat-btn trade-complete-btn" data-trade-id="${trade.tradeId}">거래 완료</button>`
        : "";

    // footer 왼쪽 텍스트는 location이 있으면 location, 없으면 역할 표시
    const footerLeft =
      location ||
      (trade?.myRole === "SELLER" ? "판매자" : trade?.myRole === "BUYER" ? "구매자" : "");

    return `
      <div class="card" data-detail-id="${escapeHTML(id)}" style="cursor:pointer;">
        <div class="card-img-wrap">
          <img src="${escapeHTML(imgSrc)}" class="card-img" alt="${escapeHTML(title)}" />
        </div>

        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(statusLabel)}</span>
            <span class="time-ago">${escapeHTML(timeAgo)}</span>
          </div>

          <h3 class="card-title">${escapeHTML(title)}</h3>
          <p class="card-price">${escapeHTML(priceText)}</p>

          <div class="card-footer">
            <span>${escapeHTML(footerLeft)}</span>
            ${completeBtn}
          </div>
        </div>
      </div>
    `;
  }

  // ===== 이벤트 바인딩 =====
  function bindCardClick(rootEl) {
    rootEl.addEventListener("click", (e) => {
      // 버튼 클릭은 카드 이동 막기
      const btn = e.target.closest("button");
      if (btn) return;

      const card = e.target.closest(".card[data-detail-id]");
      if (!card) return;

      const id = card.getAttribute("data-detail-id");
      if (id) location.href = `/html/detail.html?id=${id}`;
    });
  }

  function bindCompleteButton(rootEl, reloadFn) {
    rootEl.addEventListener("click", async (e) => {
      const btn = e.target.closest(".trade-complete-btn[data-trade-id]");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const tradeId = btn.getAttribute("data-trade-id");
      if (!tradeId) return;

      btn.disabled = true;

      try {
        const { ok, data } = await fetchJSON(`/api/trades/${tradeId}/complete`, {
          method: "POST",
          credentials: "include",
        });

        if (!ok) {
          alert(data?.message || data || "거래 완료 처리 실패");
          return;
        }

        // 완료 처리 후 재로딩
        await reloadFn();
      } finally {
        btn.disabled = false;
      }
    });
  }

  // ===== 로드 =====
  async function load() {
    if (!inProgressRoot || !completedRoot) return;

    inProgressRoot.innerHTML = "";
    completedRoot.innerHTML = "";

    // 1) trades
    const tradesRes = await fetchJSON("/api/trades/my", { credentials: "include" });
    if (!tradesRes.ok) {
      setTabCounts(0, 0);
      inProgressRoot.innerHTML = `<div class="empty">거래 내역이 없습니다.</div>`;
      completedRoot.innerHTML = `<div class="empty">거래 내역이 없습니다.</div>`;
      return;
    }

    const trades = Array.isArray(tradesRes.data) ? tradesRes.data : [];

    // 2) items (메인 카드와 동일한 정보 채우기 위해)
    const itemsRes = await fetchJSON("/api/items", { credentials: "include" });
    const items = itemsRes.ok && Array.isArray(itemsRes.data) ? itemsRes.data : [];
    const itemMap = new Map(items.map((it) => [String(it.id), it]));

    // 3) status 분리
    const inProgress = trades.filter((t) => t.status !== "COMPLETED");
    const completed = trades.filter((t) => t.status === "COMPLETED");
    setTabCounts(inProgress.length, completed.length);

    // 4) 렌더
    if (inProgress.length === 0) {
      inProgressRoot.innerHTML = `<div class="empty">거래중인 내역이 없습니다.</div>`;
    } else {
      inProgressRoot.innerHTML = inProgress
        .map((t) => {
          const item = itemMap.get(String(t.itemId)) || null;
          return toMainCardHTML({ item, trade: t });
        })
        .join("");
    }

    if (completed.length === 0) {
      completedRoot.innerHTML = `<div class="empty">거래완료 내역이 없습니다.</div>`;
    } else {
      completedRoot.innerHTML = completed
        .map((t) => {
          const item = itemMap.get(String(t.itemId)) || null;
          return toMainCardHTML({ item, trade: t });
        })
        .join("");
    }
  }

  // ===== 초기 바인딩 + 시작 =====
  if (inProgressRoot) {
    bindCardClick(inProgressRoot);
    bindCompleteButton(inProgressRoot, load);
  }
  if (completedRoot) {
    bindCardClick(completedRoot);
    bindCompleteButton(completedRoot, load);
  }

  // 기본 탭: 거래중
  window.switchTab("selling");
  load();
})();
