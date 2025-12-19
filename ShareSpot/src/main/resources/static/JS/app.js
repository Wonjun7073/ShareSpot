(function () {
  const grid = document.getElementById("itemGrid");
  const searchInput = document.getElementById("searchInput"); // 검색 입력 요소
  
  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function toCardHTML(p) {
    return `
      <div class="card">
        <img src="https://placehold.co/413x413" class="card-img" alt="상품 이미지" />
        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(p.category)}</span>
            <span class="time-ago">${escapeHTML(p.timeAgo)}</span>
          </div>
          <h3 class="card-title">${escapeHTML(p.title)}</h3>
          <p class="card-price">${escapeHTML(p.price)}</p>
          <div class="card-footer">
            <span>${escapeHTML(p.location)}</span>
            <div class="card-stats">
              <span>💬 ${Number(p.chatCount) || 0}</span>
              <span>❤️ ${Number(p.interestCount) || 0}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. 렌더링 함수 수정 (필터링된 데이터를 받도록)
  function render(postsToRender) {
    // 렌더링할 목록이 없으면 'POSTS' 배열을 사용 (초기 렌더링 시)
    const posts = postsToRender || window.POSTS; 

    // HTML 생성
    const html = posts.map(toCardHTML).join("");
    
    // 결과가 없을 경우 메시지 표시
    if (posts.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #6A7282; padding: 50px;">검색 결과가 없습니다.</p>';
    } else {
        grid.innerHTML = html;
    }
  }
    
  // 3. 검색 로직 함수 추가
  function handleSearch() {
    // 입력 값 가져오기 및 소문자 변환 후 공백 제거
    const query = searchInput.value.toLowerCase().trim();

    // 쿼리가 비어있으면 전체 목록 렌더링
    if (!query) {
      render(window.POSTS);
      return;
    }

    // data.js의 POSTS 배열을 필터링
    const filteredPosts = window.POSTS.filter(post => {
      // 1. 물품명 (title)에 검색어가 포함되는지 확인
      const titleMatch = post.title.toLowerCase().includes(query);
      
      // 2. 동네 이름 (location)에 검색어가 포함되는지 확인
      const locationMatch = post.location.toLowerCase().includes(query);
      
      // 제목 또는 위치 중 하나라도 일치하면 true 반환
      return titleMatch || locationMatch;
    });

    // 필터링된 결과를 렌더링
    render(filteredPosts);
  }

  // 4. 이벤트 리스너 등록
  // 'input' 이벤트: 사용자가 입력할 때마다 즉시 검색 실행
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  // 초기 렌더링
  render();
})();
