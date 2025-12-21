(function () {
  const grid = document.getElementById("itemGrid");
  const searchInput = document.getElementById("searchInput"); // 검색 입력 요소
  const menuItems = document.querySelectorAll(".menu-item");
  let chatMenuBtn = null;
  let homeMenuBtn = null;

  menuItems.forEach(item => {
    if (item.innerText.includes("채팅")) {
      chatMenuBtn = item;
    } else if (item.innerText.includes("홈")) {
      homeMenuBtn = item;
    }
  });

  // app.js 내부 적당한 위치에 추가
  function displayPrice(price) {
    if (price === 0 || !price) return "나눔 🎁";
    return price.toLocaleString() + "원";
  }

  // === 2. 가상 채팅방 데이터 (로컬 스토리지 사용) ===
  // 실제로는 DB에서 가져와야 하지만, 지금은 브라우저에 임시 저장하여 기능을 확인합니다.
  function getChatRooms() {
    const rooms = localStorage.getItem("myChatRooms");
    return rooms ? JSON.parse(rooms) : [];
  }
  // 채팅방 개설 로직
  function addChatRoom(itemTitle, location) {
    const rooms = getChatRooms();

    // 이미 존재하는 방인지 확인 (제목으로 단순 비교)
    const exists = rooms.find(r => r.title === itemTitle);
    if (exists) {
      alert("이미 존재하는 채팅방입니다. 채팅 목록으로 이동합니다.");
      renderChatList(); // 채팅 목록 화면으로 이동
      return;
    }

    // 새 채팅방 객체 생성 (맨 앞에 추가하여 최신순 유지)
    const newRoom = {
      id: Date.now(), // 고유 ID
      title: itemTitle, // 물품 제목이 방 제목이 됨
      location: location,
      lastMessage: "채팅방이 개설되었습니다. 대화를 시작해보세요!",
      timestamp: "방금 전",
      isNew: true
    };

    rooms.unshift(newRoom); // 배열 맨 앞에 추가
    localStorage.setItem("myChatRooms", JSON.stringify(rooms)); // 저장

    // 사이드바 뱃지 업데이트 (선택 사항)
    updateSidebarBadge(rooms.length);

    alert(`'${itemTitle}' 채팅방이 개설되었습니다!\n왼쪽 [채팅] 메뉴에서 확인하세요.`);

    // 바로 채팅 목록 화면으로 전환
    renderChatList();
  }

  // === 3. HTML 렌더링 함수들 ===
  // 사이드바 뱃지 업데이트 함수
  function updateSidebarBadge(count) {
    if (chatMenuBtn) {
      const badge = document.querySelector(".menu .badge");
      if (badge) badge.innerText = count;
    }
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  }

  function toCardHTML(p) {
    // 💡 추가: 서버에서 받은 이미지 경로가 있으면 사용하고, 없으면 기본 이미지를 사용합니다.
    const imgSrc = p.imageUrl ? p.imageUrl : "https://placehold.co/413x413";

    // ✅ id가 없으면 버튼 자체를 비활성화
    const roomBtn = (it.id != null)
      ? `<button class="chat-btn" data-item-id="${it.id}">1:1 채팅</button>`
      : `<button class="chat-btn" disabled>1:1 채팅</button>`;

    return `
<<<<<<< HEAD
      <div class="card">
        <img src="${imgSrc}" class="card-img" alt="상품 이미지" 
        style="width: 413px; height: 413px; object-fit: cover;"
             onerror="this.src='https://placehold.co/413x413'"/>
        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(p.category)}</span>
            <span class="time-ago">${escapeHTML(p.timeAgo)}</span>
          </div>
          <h3 class="card-title">${escapeHTML(p.title)}</h3>
          <p class="card-price">${displayPrice(p.price)}</p>
          <div class="card-footer">
            <span>${escapeHTML(p.location)}</span>
            <button class="chat-btn" onclick="window.handleChatClick('${escapeHTML(p.title)}', '${escapeHTML(p.location)}')">
                1:1 채팅
            </button>
            <div class="card-stats">
              <span>💬 ${Number(p.chatCount) || 0}</span>
              <span>❤️ ${Number(p.interestCount) || 0}</span>
            </div>
          </div>
=======
    <div class="card">
      <img src="https://placehold.co/413x413" class="card-img" />
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

          ${canDelete ? `<button class="delete-btn" data-del-id="${it.id}">삭제</button>` : ""}
>>>>>>> f637233b7fd001b5c98de05aae3d04bd769ea46f
        </div>
      </div>
    </div>
  `;
  }

  // (2) 채팅 목록 화면 렌더링
  function renderChatList() {
    const rooms = getChatRooms();

    // 메인 컨텐츠 영역을 채팅 목록으로 교체
    grid.style.display = 'block'; // grid 레이아웃 해제 (목록형으로 보기 위해)

    if (rooms.length === 0) {
      grid.innerHTML = '<div class="chat-list-container"><p style="text-align:center; color:#888;">개설된 채팅방이 없습니다.</p></div>';
    }
<<<<<<< HEAD
    else {
      const listHTML = rooms.map(room => `
        <div class="chat-room-item" onclick="alert('${room.title} 방으로 입장합니다 (웹소켓 연결 예정)')">
            <div>
                <div class="chat-room-title">
                    ${room.title} 
                    ${room.isNew ? '<span class="new-badge">N</span>' : ''}
                </div>
                <div class="chat-room-last-msg">${room.lastMessage}</div>
            </div>
            <div style="font-size:12px; color:#aaa;">${room.timestamp}</div>
        </div>
    `).join("");
      grid.innerHTML = `<div class="chat-list-container"><h2>💬 채팅 목록</h2>${listHTML}</div>`;
    }
    // 메뉴 활성화 상태 변경 (UI 효과)
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    if (chatMenuBtn) chatMenuBtn.classList.add('active');
  }

  // (3) 홈 화면(물품 목록) 렌더링 - 실제 서버 DB 연동 버전
  async function renderHome() {
    grid.style.display = 'grid'; // 다시 그리드 레이아웃으로 복귀

    try {
      // 서버에서 실제 물품 목록 가져오기
      const response = await fetch('/api/items');
      const items = await response.json();

      if (items.length === 0) {
        grid.style.display = 'block';
        grid.innerHTML = '<p style="text-align: center; color: #6A7282; padding: 50px;">등록된 물품이 없습니다. 첫 물품을 등록해보세요!</p>';
      } else {
        grid.style.display = 'grid';
        // 서버에서 받아온 items를 HTML 카드 형태로 변환하여 삽입
        const html = items.map(toCardHTML).join("");
        grid.innerHTML = html;
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      grid.innerHTML = '<p style="text-align: center; color: red;">서버 연결에 실패했습니다.</p>';
    }

    // 메뉴 활성화 상태 변경
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    if (homeMenuBtn) homeMenuBtn.classList.add('active');
  }
  // === 4. 이벤트 핸들러 및 초기화 ===

  // 전역 함수로 등록 (HTML onclick에서 호출하기 위함)
  window.handleChatClick = function (title, location) {
    if (confirm(`'${title}' 상품에 대한 1:1 채팅방을 만드시겠습니까?`)) {
      addChatRoom(title, location);
=======

    grid.querySelectorAll(".chat-btn[data-item-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const itemId = Number(btn.dataset.itemId);
        openChatList(itemId);
      });
    });


    menuItems.forEach((el) => el.classList.remove("active"));
    if (homeMenuBtn) homeMenuBtn.classList.add("active");
  }

  /* =========================
   * 채팅방 생성 → 목록 이동
   * ========================= */
  window.openChatList = async function (itemId) {
    if (itemId == null || Number.isNaN(Number(itemId))) {
      alert("itemId가 올바르지 않습니다. (프론트 렌더링/데이터 확인 필요)");
      return;
>>>>>>> f637233b7fd001b5c98de05aae3d04bd769ea46f
    }

    const res = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ itemId: Number(itemId) }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      alert("채팅방 생성 실패: " + (txt || res.status));
      return;
    }

    window.location.href = "/html/chat.html";
  };

<<<<<<< HEAD
  // 사이드바 메뉴 클릭 이벤트
  if (chatMenuBtn) {
    chatMenuBtn.addEventListener("click", (e) => {
      e.preventDefault(); // 링크 이동 방지
      renderChatList();
=======

  /* =========================
   * 삭제
   * ========================= */
  window.deleteItem = async function (id) {
    if (!confirm("삭제하시겠습니까?")) return;

    const res = await fetch(`/api/items/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
>>>>>>> f637233b7fd001b5c98de05aae3d04bd769ea46f
    });
  }

  if (homeMenuBtn) {
    homeMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      renderHome();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      if (!grid.style.display || grid.style.display === 'block') {
        menuItems.forEach(el => el.classList.remove('active'));
        if (homeMenuBtn) homeMenuBtn.classList.add('active');
        grid.style.display = 'grid';
      }

      const query = this.value.toLowerCase().trim();
      const filtered = window.POSTS.filter(p => p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query));

      if (filtered.length === 0) {
        grid.style.display = 'block';
        grid.innerHTML = '<p style="text-align: center; color: #6A7282; padding: 50px;">검색 결과가 없습니다.</p>';
      } else {
        grid.style.display = 'grid';
        grid.innerHTML = filtered.map(toCardHTML).join("");
      }
    });
  }

  renderHome();
})();
