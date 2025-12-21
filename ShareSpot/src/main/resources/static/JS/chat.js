/**
 * chat.js (DB + polling 버전)
 * URL: /html/chat_room.html?room=3&me=b&peer=c
 * - room: ChatRoom.id(Long)
 * - me: 내 userId (없으면 Auth에서 추출)
 * - peer: 상대 userId (없으면 서버 room 정보로도 계산 가능하지만 여기선 URL 사용)
 */

(function () {
  const messageArea = document.querySelector(".message-area");
  const inputEl = document.querySelector(".chat-input-bar input[type='text']");
  const sendBtn = document.querySelector(".chat-input-bar .send-btn");

  if (!messageArea || !inputEl || !sendBtn) return;

  const params = new URLSearchParams(location.search);
  const roomId = Number(params.get("room"));
  let me = (params.get("me") || "").trim();
  const peer = (params.get("peer") || "").trim();

  function tryMeFromAuth() {
    try {
      const s = window.Auth?.getSessionUser?.();
      const l = window.Auth?.getUser?.();
      return (s?.userId || l?.userId || "").toString().trim();
    } catch {
      return "";
    }
  }
  if (!me) me = tryMeFromAuth();

  if (!Number.isFinite(roomId)) {
    alert("room 파라미터가 올바르지 않습니다.");
    return;
  }

  let lastId = 0;
  let pollTimer = null;

  function esc(s) {
    return String(s ?? "").replace(
      /[&<>\"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }

  function toTimeLabel(dateLike) {
    try {
      const d = dateLike ? new Date(dateLike) : new Date();
      let h = d.getHours();
      const m = d.getMinutes();
      const ap = h >= 12 ? "오후" : "오전";
      h = h % 12;
      if (h === 0) h = 12;
      const mm = m < 10 ? "0" + m : "" + m;
      return `${ap} ${h}:${mm}`;
    } catch {
      return "";
    }
  }

  function appendMsg(m) {
    // m: ChatMessageResponse
    const isMe = m.senderUserId === me;

    const row = document.createElement("div");
    row.className = "message-row " + (isMe ? "sent" : "received");
    row.dataset.msgId = String(m.id);

    if (isMe) {
      const meta = document.createElement("div");
      meta.className = "msg-meta";

      const read = document.createElement("span");
      read.className = "read-check";
      // ✅ 카톡처럼: 상대가 안 읽었으면 "1", 읽었으면 빈값(또는 "읽음")
      read.textContent = m.readAt ? "" : "1";

      const time = document.createElement("span");
      time.className = "msg-time";
      time.textContent = toTimeLabel(m.createdAt);

      meta.appendChild(read);
      meta.appendChild(time);

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = esc(m.content);

      row.appendChild(meta);
      row.appendChild(bubble);
    } else {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = esc(m.content);

      const time = document.createElement("div");
      time.className = "msg-time";
      time.textContent = toTimeLabel(m.createdAt);

      row.appendChild(bubble);
      row.appendChild(time);
    }

    messageArea.appendChild(row);
    messageArea.scrollTop = messageArea.scrollHeight;

    lastId = Math.max(lastId, Number(m.id) || 0);
  }

  function updateMyReadBadges(messages) {
    // 서버에서 readAt이 채워진 메시지가 오면, 내 메시지의 "1"을 지움
    for (const m of messages) {
      if (m.senderUserId !== me) continue;
      const el = messageArea.querySelector(
        `.message-row.sent[data-msg-id="${m.id}"] .read-check`
      );
      if (el) el.textContent = m.readAt ? "" : "1";
    }
  }

  async function markRead() {
    await fetch(`/api/chat/rooms/${roomId}/read`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }

  async function loadAll() {
    const res = await fetch(`/api/chat/messages?roomId=${roomId}`, {
      credentials: "include",
    });
    if (!res.ok) return;

    const list = await res.json();
    messageArea.innerHTML = "";
    lastId = 0;

    for (const m of list) appendMsg(m);

    // 방 열었으니 읽음 처리
    await markRead();
  }

  async function poll() {
    const res = await fetch(
      `/api/chat/messages?roomId=${roomId}&afterId=${lastId}`,
      { credentials: "include" }
    );
    if (!res.ok) return;

    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) return;

    for (const m of list) appendMsg(m);

    // 내가 방을 보고 있으니까 상대가 보낸 건 즉시 읽음 처리
    // (서버에서 readAt 업데이트 → 다음 폴링 때 내 메시지의 readAt도 갱신되어 "1"이 사라짐)
    await markRead();
  }

  async function send() {
    const text = (inputEl.value || "").trim();
    if (!text) return;

    sendBtn.disabled = true;

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ roomId, content: text }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        alert("전송 실패: " + (t || res.status));
        return;
      }

      const msg = await res.json();
      appendMsg(msg);

      inputEl.value = "";
      inputEl.focus();
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  (async function start() {
    sendBtn.disabled = true;
    await renderRoomHeader();
    await loadAll();
    sendBtn.disabled = false;

    // 2초 폴링
    pollTimer = setInterval(poll, 2000);

    // 탭 닫힐 때 정리
    window.addEventListener("beforeunload", () => {
      if (pollTimer) clearInterval(pollTimer);
    });
    async function renderRoomHeader() {
      try {
        // 1) room 단건 조회
        const res = await fetch(`/api/chat/rooms/${roomId}`, {
          credentials: "include",
        });
        if (!res.ok) return;

        const room = await res.json();

        // 상대방 표시: buyer/seller 중에서 나 아닌 쪽
        const peerId =
          me === room.buyerUserId ? room.sellerUserId : room.buyerUserId;

        // 2) 상단 헤더
        const nameEl = document.querySelector(".header-name");
        const subEl = document.querySelector(".header-sub");
        if (nameEl) nameEl.textContent = peerId || "상대";
        if (subEl) subEl.textContent = room.itemTitle || "";

        // 3) 상품 바 텍스트(기본)
        const productTitle = document.querySelector(".product-title");
        const productStatus = document.querySelector(".product-status");
        if (productTitle) productTitle.textContent = room.itemTitle || "";
        if (productStatus) productStatus.textContent = "채팅중";

        // ✅ 4) 상품 이미지 + 상태를 item에서 가져와서 적용
        const imgEl = document.querySelector(".product-img-box img");

        // room에 itemId가 없을 수도 있으니 방어
        const itemId = Number(room.itemId || room.item?.id || 0);
        if (!imgEl) return;

        // 기본 이미지 먼저
        imgEl.src = "../Images/logo.png";
        imgEl.onerror = () => (imgEl.src = "../Images/logo.png");

        if (!Number.isFinite(itemId) || itemId <= 0) return;

        const itemRes = await fetch(`/api/items/${itemId}`, {
          credentials: "include",
        });
        if (!itemRes.ok) return;

        const item = await itemRes.json();

        // 이미지
        imgEl.src = item.imageUrl || "../Images/logo.png";
        imgEl.onerror = () => (imgEl.src = "../Images/logo.png");

        // 타이틀은 item이 더 정확할 수 있음
        if (productTitle)
          productTitle.textContent = item.title || room.itemTitle || "";

        // 상태(가격/카테고리/거래완료)
        const loc = item.location || "";
        const cat = item.category || "";

        // priceText 만들기
        let priceText = "";
        if (!(cat === "나눔" || Number(item.price) === 0)) {
          priceText = `${Number(item.price || 0).toLocaleString()}원`;
        }

        // SOLD 표시
        const soldText = item.status === "SOLD" ? " · 거래완료" : "";

        // 조각 모아서 중복 없이 join
        const parts = [];
        if (loc) parts.push(loc);
        if (cat) parts.push(cat);
        if (priceText) parts.push(priceText);

        if (productStatus) {
          productStatus.textContent = parts.join(" · ") + soldText;
        }

        // ✅ 상품 바 클릭 시 상세로 이동 (나가기 버튼 제외)
        const bar = document.querySelector(".product-bar");
        if (bar) {
          bar.style.cursor = "pointer";
          bar.onclick = (e) => {
            if (e.target && e.target.closest("#btnLeave")) return;
            location.href = `./detail.html?id=${encodeURIComponent(itemId)}`;
          };
        }
      } catch (e) {
        console.warn("renderRoomHeader fail", e);
      }
    }
  })();
})();
document.addEventListener("DOMContentLoaded", () => {
  const leaveBtn = document.getElementById("btnLeave");
  if (!leaveBtn) return;

  const params = new URLSearchParams(location.search);
  const roomId = Number(params.get("room"));

  // room이 없으면 버튼 비활성화
  if (!Number.isFinite(roomId)) {
    leaveBtn.disabled = true;
    return;
  }

  leaveBtn.addEventListener("click", async () => {
    // (선택) 확인창
    // if (!confirm("채팅방에서 나가시겠습니까?")) return;

    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/leave`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        alert("나가기 실패: " + (txt || res.status));
        return;
      }

      // ✅ 성공하면 목록으로 이동
      location.href = "/html/chat.html";
    } catch (e) {
      console.error(e);
      alert("네트워크 오류로 나가기에 실패했어요.");
    }
  });
});
