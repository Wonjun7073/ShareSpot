document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const itemIdStr = params.get("id");
  const itemId = Number(itemIdStr);

  const chatBtn = document.getElementById("btnChat");

  // 뒤로가기
  document.getElementById("btnBack")?.addEventListener("click", () => {
    location.href = "/html/main.html";
  });

  if (!Number.isFinite(itemId)) {
    alert("잘못된 접근입니다.");
    location.href = "/html/main.html";
    return;
  }

<<<<<<< HEAD
  // 하트 버튼(관심) - ✅ DB 연동용 상태
  const btnHeart = document.getElementById('btnHeart');
  let isWished = false;

  // ✅ 하트 UI 적용 함수
  function applyHeartUI() {
    if (!btnHeart) return;
    btnHeart.textContent = isWished ? '♥' : '♡';
    btnHeart.style.color = isWished ? 'red' : '#6A7282';
  }

  // ✅ 서버에서 현재 관심 여부 가져오기
  async function syncWishStatus() {
    if (!btnHeart) return;

    try {
      const res = await fetch(`/api/wishlist/${encodeURIComponent(itemId)}/status`);
      if (!res.ok) {
        // 로그인 안 됐거나 API가 없거나 등 -> 일단 기본값(♡)
        isWished = false;
        applyHeartUI();
        return;
      }
      const data = await res.json();
      isWished = !!data.wished;
      applyHeartUI();
    } catch (e) {
      console.error('관심 상태 조회 실패:', e);
      isWished = false;
      applyHeartUI();
    }
  }

  // ✅ 하트 클릭 시 DB에 저장/삭제
  btnHeart?.addEventListener('click', async () => {
    try {
      if (!isWished) {
        // 관심 등록
        const res = await fetch(`/api/wishlist/${encodeURIComponent(itemId)}`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('관심 등록 실패');
        isWished = true;
      } else {
        // 관심 해제
        const res = await fetch(`/api/wishlist/${encodeURIComponent(itemId)}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('관심 해제 실패');
        isWished = false;
      }
      applyHeartUI();
    } catch (err) {
      console.error(err);
      alert('관심 처리에 실패했습니다. (로그인 상태를 확인해 주세요)');
    }
  });

  // ✅ 게시글 로드
  try {
    const res = await fetch(`/api/items/${encodeURIComponent(itemId)}`);
    if (!res.ok) throw new Error('게시글 조회 실패');
=======
  // ✅ 채팅 버튼: main의 openChatList 재사용
  if (chatBtn) {
    chatBtn.addEventListener("click", () => {
      if (typeof window.openChatList !== "function") {
        alert("채팅 기능 로딩에 실패했습니다. (app.js 확인)");
        return;
      }
      window.openChatList(itemId);
    });
  }

  try {
    const res = await fetch(`/api/items/${itemId}`, { credentials: "include" });
    if (!res.ok) throw new Error("게시글 조회 실패");
>>>>>>> be54dd5e3083bbd66b721844212e9fd79a494c3a
    const item = await res.json();

    renderItem(item);

<<<<<<< HEAD
    // ✅ 글 렌더 후 관심 상태 동기화
    await syncWishStatus();
=======
    // ✅ 내 글이면 채팅 버튼 숨김
    const me = window.Auth?.getUser?.() || window.Auth?.getSessionUser?.();
    const myUserId = me?.userId ?? null;
    if (myUserId && item.ownerUserId === myUserId) {
      chatBtn && (chatBtn.style.display = "none");
    }

    // ✅ (선택) 거래완료면 채팅 비활성화
    if (item.status === "SOLD") {
      if (chatBtn) {
        chatBtn.disabled = true;
        chatBtn.textContent = "거래완료";
      }
    }
>>>>>>> be54dd5e3083bbd66b721844212e9fd79a494c3a
  } catch (err) {
    console.error(err);
    alert("게시글을 불러올 수 없습니다.");
  }

  function renderItem(item) {
<<<<<<< HEAD
    const imgEl = document.getElementById('postImage');
    if (imgEl) {
      // 이미지 경로 설정 (상대경로 보정)
      const url = item.imageUrl ? normalizeImageUrl(item.imageUrl) : '/Images/logo.png';
      imgEl.src = url;
      imgEl.onerror = () => (imgEl.src = '/Images/logo.png');
    }

    document.getElementById('postAuthorName').textContent =
      item.ownerUserId || '알 수 없음';
    document.getElementById('postAuthorAvatar').textContent =
      String(item.ownerUserId || '익')[0];

    document.getElementById('postLocation').textContent =
      item.location || '위치 정보 없음';
    document.getElementById('postCategory').textContent =
      item.category || '기타';

    document.getElementById('postTitle').textContent = item.title || '(제목 없음)';

    // createdAt 안전 처리
    const timeEl = document.getElementById('postTime');
    if (timeEl) {
      const d = new Date(item.createdAt);
      timeEl.textContent = isNaN(d.getTime()) ? (item.createdAt || '날짜 정보 없음') : d.toLocaleDateString();
    }

    // 내용은 text로 넣는 게 안전 (XSS 방지)
    const descEl = document.getElementById('postDesc');
    if (descEl) descEl.textContent = item.description || '(내용 없음)';

    const priceEl = document.getElementById('postPrice');
    if (priceEl) {
      const price = Number(item.price ?? 0);
      if (item.category === '나눔' || price === 0) {
        priceEl.textContent = '나눔 🎁';
      } else if (Number.isFinite(price)) {
        priceEl.textContent = price.toLocaleString() + '원';
      } else {
        priceEl.textContent = '가격 정보 없음';
      }
    }
  }

  // 채팅 버튼
  document.getElementById('btnChat')?.addEventListener('click', () => {
    alert('채팅 기능 준비 중입니다.');
  });

  function normalizeImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return url;
    return '/' + url;
  }
=======
    const imgEl = document.getElementById("postImage");
    imgEl.src = item.imageUrl ? item.imageUrl : "/Images/logo.png";

    document.getElementById("postAuthorName").textContent =
      item.ownerUserId || "알 수 없음";
    document.getElementById("postAuthorAvatar").textContent =
      (item.ownerUserId || "익")[0];
    document.getElementById("postLocation").textContent =
      item.location || "위치 정보 없음";
    document.getElementById("postCategory").textContent =
      item.category || "기타";
    document.getElementById("postTitle").textContent = item.title || "";
    document.getElementById("postTime").textContent = new Date(
      item.createdAt
    ).toLocaleDateString();
    document.getElementById("postDesc").innerText =
      item.description || item.content || "";

    const priceEl = document.getElementById("postPrice");
    if (item.category === "나눔" || Number(item.price) === 0) {
      priceEl.textContent = "나눔 🎁";
    } else {
      priceEl.textContent = Number(item.price || 0).toLocaleString() + "원";
    }
  }

  // 하트 버튼
  const btnHeart = document.getElementById("btnHeart");
  btnHeart?.addEventListener("click", () => {
    const current = btnHeart.textContent;
    btnHeart.textContent = current === "♡" ? "♥" : "♡";
    btnHeart.style.color = current === "♡" ? "red" : "#6A7282";
  });
>>>>>>> be54dd5e3083bbd66b721844212e9fd79a494c3a
});
