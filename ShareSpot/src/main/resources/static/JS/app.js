(function () {
  const grid = document.getElementById('itemGrid');
  const searchInput = document.getElementById('searchInput');
  const menuItems = document.querySelectorAll('.menu-item');
  let currentQuery = '';

  let chatMenuBtn = null;
  let homeMenuBtn = null;
  let pendingDeleteId = null;
  let confirmOkAction = null;
  let allItems = [];
  let currentCategory = '전체';
  let currentSort = 'latest'; // 기본 최신순

  // ✅ itemId -> "IN_PROGRESS" | "COMPLETED"
  let tradeStatusByItemId = new Map();

  const me = window.Auth?.getUser?.();
  const myUserId = me?.userId || null;

  menuItems.forEach((item) => {
    if (item.innerText.includes('채팅')) chatMenuBtn = item;
    if (item.innerText.includes('홈')) homeMenuBtn = item;
  });

  /* =========================
   * 유틸
   * ========================= */
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
   * 카드 렌더링
   * ========================= */
  function toCardHTML(it) {
    const cat = (it.category || '').trim();

    let priceText = '';
    if (cat === '대여')
      priceText = `${Number(it.price || 0).toLocaleString()}원`;
    else if (cat === '교환') priceText = '교환 🔄';
    else priceText = '나눔 🎁';

    const imgSrc = it.imageUrl
      ? it.imageUrl
      : 'https://placehold.co/413x413?text=No+Image';

    const isMine = myUserId && it.ownerUserId === myUserId;

    const roomBtn = isMine
      ? ''
      : `<button class="chat-btn" data-item-id="${it.id}">1:1 채팅</button>`;

    // ✅ 배지 텍스트만 변경
    const tStatus = tradeStatusByItemId.get(String(it.id)) || null;
    const badgeText = tStatus
      ? tStatus === 'COMPLETED'
        ? '거래완료'
        : '거래중'
      : it.category;

    return `
      <div class="card" data-detail-id="${it.id}" data-created-at="${
      it.createdAt
    }">
        <div class="card-img-wrap">
          <img src="${imgSrc}" class="card-img" />
        </div>

        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(badgeText)}</span>
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

  /* =========================
   * 리스트 렌더링
   * ========================= */
  function renderItems() {
    if (!grid) return;

    let filtered = [...allItems];

    // ✅ 0단계: 거래완료(COMPLETED) 아이템 숨김
    filtered = filtered.filter((it) => {
      const st = tradeStatusByItemId.get(String(it.id));
      return st !== 'COMPLETED';
    });

    // 1) 카테고리 필터
    if (currentCategory !== '전체') {
      filtered = filtered.filter(
        (it) => (it.category || '').trim() === currentCategory
      );
    }

    // 2) 검색 필터
    const q = (currentQuery || '').toLowerCase();
    if (q) {
      filtered = filtered.filter((it) => {
        return (
          (it.title || '').toLowerCase().includes(q) ||
          (it.location || '').toLowerCase().includes(q) ||
          (it.category || '').toLowerCase().includes(q)
        );
      });
    }

    filtered.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return currentSort === 'oldest' ? ta - tb : tb - ta;
    });

    if (filtered.length === 0) {
      grid.innerHTML =
        '<p style="text-align:center;color:#888;padding:40px;">표시할 게시글이 없습니다.</p>';
      return;
    }

    grid.innerHTML = filtered.map(toCardHTML).join('');
  }

  /* =========================
   * 홈 로딩
   * ========================= */
  async function renderHome() {
    try {
      const res = await fetch('/api/items', { credentials: 'include' });
      allItems = await res.json();

      // ✅ 거래 상태 로딩
      tradeStatusByItemId = new Map();
      const trRes = await fetch('/api/trades/my', { credentials: 'include' });
      if (trRes.ok) {
        const trades = await trRes.json();
        trades.forEach((t) => {
          const key = String(t.itemId);
          const st = String(t.status);
          if (tradeStatusByItemId.get(key) === 'IN_PROGRESS') return;
          tradeStatusByItemId.set(key, st);
        });
      }

      renderItems();
    } catch (e) {
      console.error(e);
      grid.innerHTML =
        '<p style="text-align:center;color:red;">목록을 불러오지 못했습니다.</p>';
    }
  }

  async function openChatList(itemId) {
    const idNum = Number(itemId);

    if (!Number.isFinite(idNum)) {
      alert('잘못된 상품 정보입니다.');
      return;
    }

    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId: idNum }),
      });

      if (!res.ok) {
        let msg = `채팅방을 만들 수 없습니다. (HTTP ${res.status})`;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const err = await res.json();
            msg = err?.message || err?.error || msg;
          } else {
            const t = await res.text();
            if (t) msg = t;
          }
        } catch (_) {}
        alert(msg);
        return;
      }

      const room = await res.json();

      const meId =
        window.Auth?.getUser?.()?.userId ||
        window.Auth?.getSessionUser?.()?.userId ||
        '';

      if (!meId) {
        alert('로그인이 필요합니다.');
        location.href = '/html/login.html';
        return;
      }

      const peer =
        meId === room.buyerUserId ? room.sellerUserId : room.buyerUserId;

      if (!peer) {
        alert('상대방 정보를 찾지 못했습니다.');
        return;
      }

      location.href = `/html/chat_room.html?room=${encodeURIComponent(
        room.id
      )}&me=${encodeURIComponent(meId)}&peer=${encodeURIComponent(peer)}`;
    } catch (e) {
      console.error(e);
      alert('채팅방 생성 중 오류가 발생했습니다.');
    }
  }

  /* =========================
   * 이벤트
   * ========================= */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentQuery = searchInput.value;
      renderItems();
    });
  }

  function toggleSortMenu() {
    const sortMenu = document.getElementById('sortMenu');
    // 메뉴 토글 (보이기/숨기기)
    if (!sortMenu) return;

    // 메뉴 토글 (보이기/숨기기)
    if (sortMenu.style.display === 'block') {
      sortMenu.style.display = 'none'; // 닫기
    } else {
      sortMenu.style.display = 'block'; // 열기
    }
  }

  function sortItems(sortBy) {
    const sortMenu = document.getElementById('sortMenu');
    const sortLabel = document.getElementById('sortLabel');

    currentSort = sortBy;

    // 2) 라벨 변경
    if (sortLabel) {
      sortLabel.textContent = sortBy === 'oldest' ? '오래된순' : '최신순';
    }

    // 3) ✅ 옵션 클릭하면 자동으로 닫기
    if (sortMenu) sortMenu.style.display = 'none';

    // 4) 렌더링
    renderItems();
  }

  if (grid) {
    grid.addEventListener('click', (e) => {
      // 1) 채팅 버튼
      const chatBtn = e.target.closest('.chat-btn');
      if (chatBtn) {
        e.stopPropagation();
        const id = Number(chatBtn.dataset.itemId);
        if (Number.isFinite(id)) openChatList(id);
        return;
      }

      // 2) 카드 클릭 → 상세 이동
      const card = e.target.closest('.card[data-detail-id]');
      if (card) {
        const id = card.dataset.detailId;
        location.href = `/html/detail.html?id=${encodeURIComponent(id)}`;
      }
    });
  }

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document
        .querySelectorAll('.filter-btn')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.dataset.category || '전체';
      renderItems();
    });
  });

  window.toggleSortMenu = toggleSortMenu;
  window.sortItems = sortItems;

  renderHome();
})();
