(function () {
  /* =====================
   * 로그인 가드
   * ===================== */
  if (window.Auth && typeof Auth.guard === 'function') {
    Auth.guard();
  }

  /* =====================
   * 프로필 수정 이동
   * ===================== */
  document.getElementById('btnEditProfile')?.addEventListener('click', () => {
    location.href = './edit_profile.html';
  });

  /* =====================
   * 유틸
   * ===================== */
  function getMeFromAuth() {
    return window.Auth?.getUser?.() || window.Auth?.getSessionUser?.() || null;
  }

  async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json')
      ? await res.json()
      : await res.text();
    return { ok: res.ok, status: res.status, data };
  }

  function safeText(elId, value) {
    const el = document.getElementById(elId);
    if (el) el.textContent = value;
  }

  /* =====================
   * 화면 렌더링 (me)
   * 사용자님의 my.html ID인 avatarText, avatarImg에 맞춰 수정됨
   * ===================== */
  function renderMe(me) {
    const nickname = me?.nickname || me?.userId || '사용자';
    const dong = me?.dong || '내 동네';

    // HTML ID 매칭: nicknameText, dongText
    safeText('nicknameText', nickname);
    safeText('dongText', dong);

    const avatarText = document.getElementById('avatarText');
    const avatarImg = document.getElementById('avatarImg');

    // [핵심 해결] 사진 데이터가 있을 때와 없을 때를 명확히 나눕니다
    if (me?.profileImageUrl) {
      if (avatarImg) {
        // 서버에서 준 경로(/uploads/profile/...)에 타임스탬프를 붙여 갱신
        avatarImg.src = me.profileImageUrl + '?t=' + new Date().getTime();
        avatarImg.style.display = 'block';
      }
      if (avatarText) avatarText.style.display = 'none';
    } else {
      // 사진이 없으면: 텍스트 보여주고 이미지 숨김
      const initial = me?.profileInitial || (nickname ? nickname[0] : '?');
      if (avatarText) {
        avatarText.textContent = initial;
        avatarText.style.display = 'block';
      }
      if (avatarImg) avatarImg.style.display = 'none';
    }

    // 통계 및 신뢰도 표시
    if (me?.sharedCount != null) safeText('statShared', String(me.sharedCount));
    if (me?.thanksCount != null) safeText('statThanks', String(me.thanksCount));
    if (me?.trustPercent != null)
      safeText('statTrust', String(me.trustPercent) + '%');

    if (me?.trustCount != null) safeText('trustCount', String(me.trustCount));
  }

  /* =====================
   * 검색 → main으로 이동
   * ===================== */
  function bindSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    function goMainSearch() {
      const q = searchInput.value.trim();
      const url = q ? `./main.html?q=${encodeURIComponent(q)}` : `./main.html`;
      location.href = url;
    }

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        goMainSearch();
      }
    });

    document
      .querySelector('.search-bar span')
      ?.addEventListener('click', goMainSearch);
  }

  /* =====================
   * 관심목록 카운트
   * ===================== */
  async function loadWishCount() {
    const chip = document.getElementById('chipWish');
    const thanksEl = document.getElementById('statThanks');
    const trustEl = document.getElementById('trustCount');
    if (!chip) return;

    try {
      const countRes = await fetch('/api/wishlist/count', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (countRes.ok) {
        const data = await countRes.json();
        const c = Number(data.count ?? 0);
        chip.textContent = String(c);
        if (thanksEl) thanksEl.textContent = String(c);
        if (trustEl) trustEl.textContent = String(c);
        return;
      }

      const res = await fetch('/api/wishlist', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) return;
      const wishes = await res.json();
      const c = Array.isArray(wishes) ? wishes.length : 0;

      chip.textContent = String(c);
      if (thanksEl) thanksEl.textContent = String(c);
      if (trustEl) trustEl.textContent = String(c);
    } catch (e) {
      console.error('관심목록 개수 로드 실패', e);
    }
  }

  /* =====================
   * 거래중 카운트(판매/대여 내역 칩)
   * ===================== */
  async function updateTradeCountChipSafe() {
    try {
      const res = await fetch('/api/trades/my', { credentials: 'include' });
      if (!res.ok) return;

      const list = await res.json();
      if (!Array.isArray(list)) return;

      const uniq = new Map();
      for (const t of list) {
        if (!t || t.tradeId == null) continue;
        uniq.set(String(t.tradeId), t);
      }

      const totalCount = uniq.size;

      const byId = document.getElementById('chipHistory');
      if (byId) {
        byId.textContent = String(totalCount);
        return;
      }

      const rows = document.querySelectorAll(
        '.panel-item, .panel-link, li, a, div'
      );
      for (const r of rows) {
        const text = (r.innerText || '').replace(/\s+/g, ' ').trim();
        if (!text.includes('판매/대여') && !text.includes('거래목록')) continue;

        const chip = r.querySelector('.chip');
        if (chip) {
          chip.textContent = String(totalCount);
          return;
        }
      }
    } catch (e) {
      console.warn('updateTradeCountChipSafe fail', e);
    }
  }

  /* =====================
   * 한 번에 로드/계산
   * ===================== */
  async function loadAll() {
    bindSearch();

    let me = null;
    try {
      const { ok, data } = await fetchJSON('/api/user/me', {
        credentials: 'include',
      });
      if (ok) me = data;
    } catch (e) {
      console.warn('me api error:', e);
    }

    if (!me) me = getMeFromAuth();
    if (me) renderMe(me); // 여기서 수정된 프로필 렌더링 실행

    const myUserId = me?.userId ?? null;
    if (!myUserId) {
      safeText('statShared', '0');
      safeText('statThanks', '0');
      safeText('chipHistory', '0');
      safeText('chipWish', '0');
      safeText('trustCount', '0');
      return;
    }

    let items = [];
    try {
      const { ok, data } = await fetchJSON('/api/items', {
        credentials: 'include',
      });
      if (ok && Array.isArray(data)) items = data;
    } catch (e) {
      console.error('items load fail:', e);
    }

    const myItems = items.filter((it) => it.ownerUserId === myUserId);
    safeText('statShared', String(myItems.length));
    safeText('chipHistory', String(myItems.length));

    await loadWishCount();
    await updateTradeCountChipSafe();
  }

  // ✅ 페이지 시작
  loadAll();
})();
async function loadSuccessTradeCount() {
  const el = document.getElementById('successTradeCount');
  if (!el) return;

  try {
    // ✅ 내 거래 목록을 가져온다 (너 app.js에서도 쓰는 API)
    const res = await fetch('/api/trades/my', { credentials: 'include' });
    if (!res.ok) return;

    const trades = await res.json();

    // ✅ status가 COMPLETED인 것만 카운트
    const completedCount = trades.filter(
      (t) => String(t.status) === 'COMPLETED'
    ).length;

    el.textContent = String(completedCount);
  } catch (e) {
    console.error('loadSuccessTradeCount error:', e);
  }
}

// ✅ my.html 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadSuccessTradeCount();
});
