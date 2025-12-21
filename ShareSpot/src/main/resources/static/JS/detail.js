document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');

  // 뒤로가기
  document.getElementById('btnBack')?.addEventListener('click', () => {
    location.href = '/html/main.html';
  });

  if (!itemId) {
    alert('잘못된 접근입니다.');
    location.href = '/html/main.html';
    return;
  }

  try {
    const res = await fetch(`/api/items/${itemId}`);
    if (!res.ok) throw new Error('게시글 조회 실패');
    const item = await res.json();
    renderItem(item);
  } catch (err) {
    console.error(err);
    alert('게시글을 불러올 수 없습니다.');
  }

  function renderItem(item) {
    const imgEl = document.getElementById('postImage');
    // 이미지 경로 설정
    imgEl.src = item.imageUrl ? item.imageUrl : '/Images/logo.png';

    document.getElementById('postAuthorName').textContent =
      item.ownerUserId || '알 수 없음';
    document.getElementById('postAuthorAvatar').textContent =
      (item.ownerUserId || '익')[0];
    document.getElementById('postLocation').textContent =
      item.location || '위치 정보 없음';
    document.getElementById('postCategory').textContent =
      item.category || '기타';
    document.getElementById('postTitle').textContent = item.title;
    document.getElementById('postTime').textContent = new Date(
      item.createdAt
    ).toLocaleDateString();
    document.getElementById('postDesc').innerText = item.description;

    const priceEl = document.getElementById('postPrice');
    if (item.category === '나눔' || item.price === 0) {
      priceEl.textContent = '나눔 🎁';
    } else {
      priceEl.textContent = Number(item.price).toLocaleString() + '원';
    }
  }

  // 채팅 버튼
  document.getElementById('btnChat')?.addEventListener('click', () => {
    alert('채팅 기능 준비 중입니다.');
  });

  // 하트 버튼
  const btnHeart = document.getElementById('btnHeart');
  btnHeart?.addEventListener('click', () => {
    const current = btnHeart.textContent;
    btnHeart.textContent = current === '♡' ? '♥' : '♡';
    btnHeart.style.color = current === '♡' ? 'red' : '#6A7282';
  });
});
