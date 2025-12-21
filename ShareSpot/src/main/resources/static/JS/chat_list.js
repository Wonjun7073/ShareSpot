document.addEventListener("DOMContentLoaded", async () => {
    const listEl = document.getElementById("chatList");
    if (!listEl) return;

    try {
        const res = await fetch("/api/chat/rooms", {
            credentials: "same-origin",
        });

        if (!res.ok) {
            listEl.innerHTML = `<p style="padding:20px;color:red;">채팅방을 불러오지 못했습니다.</p>`;
            return;
        }

        const rooms = await res.json();

        if (!Array.isArray(rooms) || rooms.length === 0) {
            listEl.innerHTML = `
        <p style="padding:20px;color:#888;text-align:center;">
          아직 채팅방이 없습니다.
        </p>`;
            return;
        }

        listEl.innerHTML = rooms.map(renderRoom).join("");
    } catch (e) {
        console.error(e);
        listEl.innerHTML = `<p style="padding:20px;color:red;">서버 오류</p>`;
    }
});

function renderRoom(room) {
    const title = room.lastMessage || "채팅방이 생성되었습니다.";
    const time = room.lastMessageAt
        ? new Date(room.lastMessageAt).toLocaleString()
        : "";

    return `
    <div class="chat-item" onclick="enterRoom(${room.id})">
        <div class="chat-avatar">
        <img src="https://placehold.co/64x64" />
        </div>
        <div class="chat-info">
        <div class="chat-header-row">
            <div class="user-meta">
            <span class="username">${escapeHTML(room.itemTitle)}</span>
            </div>
            <span class="time">${time}</span>
        </div>
        <div class="chat-last-msg-row">
            <span class="last-msg">${escapeHTML(title)}</span>
        </div>
        </div>
    </div>
    `;
}

function enterRoom(roomId) {
    // 다음 단계: chat_room.html?roomId=...
    location.href = `/html/chat_room.html?roomId=${roomId}`;
}

function escapeHTML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
