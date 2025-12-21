document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("wishGrid");
  const countEl = document.getElementById("wishCount");

  try {
    const items = await fetchWishlist();
    renderWishlist(items);
  } catch (e) {
    console.error("[wishlist] load error", e);
    alert("관심목록을 불러올 수 없습니다.\n(로그인 상태를 확인해 주세요)");
    location.href = "/html/my.html";
  }

  // 하트 클릭 → 관심 해제 + 카드 제거
  grid?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".wl-heart-btn");
    if (!btn) return;

    const card = btn.closest(".wl-card");
    const id = card?.dataset?.id;
    if (!id) return;

    try {
      await fetch(`/api/wishlist/${encodeURIComponent(id)}`, { method: "DELETE" });
      card.remove();
      updateCount();

      if (grid.querySelectorAll(".wl-card").length === 0) {
        renderEmpty();
      }
    } catch (err) {
      console.error("[wishlist] remove error", err);
      alert("관심 해제에 실패했습니다.");
    }
  });

  // 카드 클릭 → 상세 이동(하트 클릭 제외)
  grid?.addEventListener("click", (e) => {
    if (e.target.closest(".wl-heart-btn")) return;
    const card = e.target.closest(".wl-card");
    if (!card) return;
    const id = card.dataset.id;
    if (!id) return;
    location.href = `./detail.html?id=${encodeURIComponent(id)}`;
  });

  async function fetchWishlist() {
    const res = await fetch("/api/wishlist", { headers: { Accept: "application/json" } });
    if (!res.ok) {
      const t = await safeText(res);
      throw new Error(`wishlist api failed: ${res.status} ${t}`);
    }
    return await res.json(); // Item[]
  }

  function renderWishlist(items) {
    if (!grid) return;
    grid.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      renderEmpty();
      updateCount();
      return;
    }

    grid.insertAdjacentHTML("beforeend", items.map(toCardHtml).join(""));
    updateCount();
  }

  function renderEmpty() {
    if (!grid) return;
    grid.innerHTML = `
      <div class="card" style="padding:16px; color:#6A7282;">
        아직 관심 등록한 글이 없어요.
      </div>
    `;
  }

  function updateCount() {
    if (!countEl || !grid) return;
    const n = grid.querySelectorAll(".wl-card").length;
    countEl.textContent = `${n}개`;
  }

  function toCardHtml(item) {
    const id = item.id;
    const title = escapeHtml(item.title ?? "(제목 없음)");
    const loc = escapeHtml(item.location ?? "위치 정보 없음");
    const category = item.category ?? "기타";
    const tagClass = categoryToTagClass(category);
    const time = timeAgo(item.createdAt);

    const priceText =
      category === "나눔" || Number(item.price ?? 0) === 0
        ? "나눔 🎁"
        : `${Number(item.price ?? 0).toLocaleString()}원`;

    const imageUrl = item.imageUrl ? normalizeImageUrl(item.imageUrl) : "";
    const thumbHtml = imageUrl
      ? `<div class="wl-thumb"><img src="${imageUrl}" alt="상품 이미지" onerror="this.src='/Images/logo.png'" /></div>`
      : `<div class="wl-thumb wl-thumb-empty"><span>이미지 없음</span></div>`;

    return `
      <article class="wl-card card" data-id="${id}">
        <button class="wl-heart-btn is-on" aria-label="관심 해제" type="button">♥</button>
        ${thumbHtml}
        <div class="wl-body">
          <div class="wl-row">
            <span class="wl-tag ${tagClass}">${escapeHtml(category)}</span>
            <span class="wl-time">${escapeHtml(time)}</span>
          </div>
          <h2 class="wl-title2">${title}</h2>
          <div class="wl-price">${escapeHtml(priceText)}</div>
          <div class="wl-bottom">
            <span class="wl-loc">${loc}</span>
          </div>
        </div>
      </article>
    `;
  }

  function categoryToTagClass(category) {
    if (category === "나눔") return "wl-tag-share";
    if (category === "대여") return "wl-tag-rent";
    return "wl-tag-exchange";
  }

  function timeAgo(createdAt) {
    if (!createdAt) return "";
    const d = new Date(createdAt);
    if (isNaN(d.getTime())) return String(createdAt);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}초 전`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    return `${day}일 전`;
  }

  function normalizeImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return url;
    return "/" + url;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function safeText(res) {
    try { return await res.text(); } catch { return ""; }
  }
});
