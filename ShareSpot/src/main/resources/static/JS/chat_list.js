(function () {
    const listEl = document.querySelector(".chat-list");
    if (!listEl) return;

    const me = window.Auth?.getUser?.()?.userId || window.Auth?.getSessionUser?.()?.userId || null;

    function esc(s) {
        return String(s ?? "").replace(/[&<>\"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
        }[c]));
    }

    function timeAgo(dt) {
        if (!dt) return "";
        const t = new Date(dt).getTime();
        if (!t) return "";
        const diff = Math.floor((Date.now() - t) / 1000);
        if (diff < 60) return "방금 전";
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        return `${Math.floor(diff / 86400)}일 전`;
    }

    function peerOf(room) {
        // ChatRoomResponse: buyerUserId, sellerUserId
        if (!me) return room.buyerUserId || room.sellerUserId || "";
        return me === room.buyerUserId ? room.sellerUserId : room.buyerUserId;
    }

    function toRow(room) {
        const peer = peerOf(room);
        const title = room.itemTitle || "";
        const lastMsg = room.lastMessage || "(대화를 시작해보세요)";
        const t = timeAgo(room.lastMessageAt || room.createdAt);

        const href =
            `chat_room.html?room=${encodeURIComponent(room.id)}&me=${encodeURIComponent(me || "")}&peer=${encodeURIComponent(peer || "")}`;

        return `
      <div class="chat-item" data-href="${href}">
        <div class="chat-avatar">
          <img src="https://placehold.co/64x64" alt="프로필" />
        </div>
        <div class="chat-info">
          <div class="chat-header-row">
            <div class="user-meta">
              <span class="username">${esc(peer || "상대")}</span>
              <span class="location"></span>
            </div>
            <span class="time">${esc(t)}</span>
          </div>
          <div class="chat-preview">${esc(title)}</div>
          <div class="chat-last-msg-row">
            <span class="last-msg">${esc(lastMsg)}</span>
          </div>
        </div>
      </div>
    `;
    }

    async function render() {
        try {
            const res = await fetch("/api/chat/rooms", { credentials: "include" });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                listEl.innerHTML = `<div style="padding:20px;color:#888;">목록 불러오기 실패: ${esc(txt || res.status)}</div>`;
                return;
            }

            const rooms = await res.json();

            if (!Array.isArray(rooms) || rooms.length === 0) {
                listEl.innerHTML = `<div style="padding:20px;color:#888;">채팅방이 없습니다.</div>`;
                return;
            }

            listEl.innerHTML = rooms.map(toRow).join("");

        } catch (e) {
            console.error(e);
            listEl.innerHTML = `<div style="padding:20px;color:#888;">네트워크 오류</div>`;
        }
    }

    // 클릭 이동 (하드코딩 onclick 제거용)
    listEl.addEventListener("click", (e) => {
        const item = e.target.closest(".chat-item[data-href]");
        if (!item) return;
        location.href = item.dataset.href;
    });

    render();
})();
