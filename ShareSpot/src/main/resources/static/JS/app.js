(function () {
  const grid = document.getElementById('itemGrid');
  const searchInput = document.getElementById('searchInput');
  const menuItems = document.querySelectorAll('.menu-item');

  let chatMenuBtn = null;
  let homeMenuBtn = null;

  const me = window.Auth?.getUser?.();
  const myUserId = me?.userId || null;

  menuItems.forEach((item) => {
    if (item.innerText.includes('채팅')) chatMenuBtn = item;
    if (item.innerText.includes('홈')) homeMenuBtn = item;
  });

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatTimeAgo(createdAt) {
    const t = new Date(createdAt);
    if (Number.isNaN(t.getTime())) return '';
    const diff = Math.floor((Date.now() - t.getTime()) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  }

  /* =========================
   * 카드 HTML 생성
   * ========================= */
  function toCardHTML(it) {
    const canDelete = myUserId && it.ownerUserId === myUserId;
    const priceText =
      it.price === 0 ? '나눔 🎁' : `${Number(it.price).toLocaleString()}원`;

    // ▼▼▼ [수정] 이미지 경로 절대경로(/)로 변경 ▼▼▼
    const imgSrc = it.imageUrl ? it.imageUrl : '/Images/logo.png';

    const roomBtn =
      it.id != null
        ? `<button class="chat-btn" data-item-id="${it.id}">1:1 채팅</button>`
        : `<button class="chat-btn" disabled>1:1 채팅</button>`;

    // ▼▼▼ [중요] data-detail-id 확인 ▼▼▼
    return `
    <div class="card" data-detail-id="${it.id}" style="cursor: pointer;">
      <img src="${imgSrc}" class="card-img" alt="${escapeHTML(
      it.title
    )}" style="object-fit: cover;" />
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
              : ''
          }
        </div>
      </div>
    </div>
  `;
  }

  async function renderHome() {
    try {
      const res = await fetch('/api/items', { credentials: 'include' });
      const items = await res.json();

      if (!Array.isArray(items) || items.length === 0) {
        grid.innerHTML =
          '<p style="text-align:center;padding:40px;">등록된 물품이 없습니다.</p>';
        return;
      }
      grid.innerHTML = items.map(toCardHTML).join('');
    } catch (e) {
      console.error(e);
      grid.innerHTML =
        '<p style="text-align:center;color:red;">목록을 불러오지 못했습니다.</p>';
    }
  }

  /* =========================
   * 이벤트 리스너 (클릭 처리)
   * ========================= */
  if (grid) {
    grid.addEventListener('click', (e) => {
      // 1. 삭제 버튼
      const delBtn = e.target.closest('.delete-btn[data-del-id]');
      if (delBtn) {
        e.stopPropagation();
        if (confirm('삭제하시겠습니까?')) deleteItem(delBtn.dataset.delId);
        return;
      }

      // 2. 채팅 버튼
      const chatBtn = e.target.closest('.chat-btn[data-item-id]');
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
    homeMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      renderHome();
    });
  }

  renderHome();
})();
