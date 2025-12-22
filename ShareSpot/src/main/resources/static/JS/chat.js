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
    const isMe = m.senderUserId === me;

    const row = document.createElement("div");
    row.className = "message-row " + (isMe ? "sent" : "received");
    row.dataset.msgId = String(m.id);

    if (isMe) {
      const meta = document.createElement("div");
      meta.className = "msg-meta";

      const read = document.createElement("span");
      read.className = "read-check";
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

  // =========================
  // ✅ 거래 상태 표시/생성
  // =========================
  async function updateTradeStatusLabel() {
    const productStatus = document.querySelector(".product-status");
    if (!productStatus) return;

    try {
      const res = await fetch(`/api/trades/room/${roomId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        productStatus.textContent = "판매중";
        return;
      }

      const trade = await res.json();
      if (!trade) {
        productStatus.textContent = "판매중";
      } else if (trade.status === "COMPLETED") {
        productStatus.textContent = "거래완료";
      } else {
        productStatus.textContent = "거래중";
      }
    } catch {
      productStatus.textContent = "판매중";
    }
  }

  async function renderRoomHeader() {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}`, {
        credentials: "include",
      });
      if (!res.ok) return;

      const room = await res.json();

      const peerId =
        me === room.buyerUserId ? room.sellerUserId : room.buyerUserId;

      const nameEl = document.querySelector(".header-name");
      const subEl = document.querySelector(".header-sub");
      if (nameEl) nameEl.textContent = peerId || "상대";
      if (subEl) subEl.textContent = room.itemTitle || "";

      const productTitle = document.querySelector(".product-title");
      if (productTitle) productTitle.textContent = room.itemTitle || "";

      // ✅ 들어오자마자 거래상태 반영
      await updateTradeStatusLabel();
    } catch (e) {
      console.warn("renderRoomHeader fail", e);
    }
  }

  (async function start() {
    sendBtn.disabled = true;
    await renderRoomHeader();
    await loadAll();
    sendBtn.disabled = false;

    pollTimer = setInterval(poll, 2000);

    window.addEventListener("beforeunload", () => {
      if (pollTimer) clearInterval(pollTimer);
    });
  })();
})();

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const roomId = Number(params.get("room"));

  const leaveBtn = document.getElementById("btnLeave");
  const tradeBtn = document.getElementById("btnTrade");

  if (!Number.isFinite(roomId)) {
    if (leaveBtn) leaveBtn.disabled = true;
    if (tradeBtn) tradeBtn.disabled = true;
    return;
  }

  // ✅ 거래 버튼 클릭: 거래 생성(이미 있으면 그대로 반환)
  if (tradeBtn) {
  tradeBtn.addEventListener("click", async () => {
    tradeBtn.disabled = true;
    try {
      const res = await fetch(`/api/trades/from-room/${roomId}`, {
        method: "POST",
        credentials: "include",
      });

      const ct = res.headers.get("content-type") || "";
      const body = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        alert("거래 시작 실패: " + (body?.message || body || res.status));
        return;
      }

      alert("거래 시작 성공!");
      const statusEl = document.querySelector(".product-status");
      if (statusEl) statusEl.textContent = "거래중";
    } catch (e) {
      console.error(e);
      alert("네트워크 오류로 거래 시작 실패");
    } finally {
      tradeBtn.disabled = false;
    }
  });
}

  if (!leaveBtn) return;

  leaveBtn.addEventListener("click", async () => {
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

      location.href = "/html/chat.html";
    } catch (e) {
      console.error(e);
      alert("네트워크 오류로 나가기에 실패했어요.");
    }
  });
});
