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

  const leaveBtn = document.getElementById("btnLeave");
  const tradeBtn = document.getElementById("btnTrade");

  if (!messageArea || !inputEl || !sendBtn) return;

  const params = new URLSearchParams(location.search);
  const roomId = Number(params.get("room"));
  let me = (params.get("me") || "").trim();

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
    if (leaveBtn) leaveBtn.disabled = true;
    if (tradeBtn) tradeBtn.disabled = true;
    return;
  }

  let lastId = 0;
  let pollTimer = null;

  function esc(s) {
    return String(s ?? "").replace(/[&<>\"']/g, (c) => {
      return (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c] || c
      );
    });
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
  // ✅ 거래 상태 표시
  // =========================
  async function updateTradeStatusLabel() {
    const productStatus = document.querySelector(".product-status");
    if (!productStatus) return;

    try {
      const res = await fetch(`/api/trades/room/${roomId}`, {
        credentials: "include",
      });

      // 403/404 등도 "판매중" 취급
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
      const productStatus = document.querySelector(".product-status");
      if (productStatus) productStatus.textContent = "판매중";
    }
  }

  // =========================
  // ✅ 헤더/상품바 렌더
  // - room 조회 → item 조회 → 이미지/텍스트 표시
  // - 마지막에 거래상태 반영
  // =========================
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

      // 상단 헤더
      const nameEl = document.querySelector(".header-name");
      const subEl = document.querySelector(".header-sub");
      if (nameEl) nameEl.textContent = peerId || "상대";
      if (subEl) subEl.textContent = room.itemTitle || "";

      // 상품 바 기본 타이틀
      const productTitle = document.querySelector(".product-title");
      if (productTitle) productTitle.textContent = room.itemTitle || "";

      // 2) item 상세로 이미지/가격/카테고리/동네 반영
      const imgEl = document.querySelector(".product-img-box img");
      const itemId = Number(room.itemId || room.item?.id || 0);

      if (imgEl) {
        imgEl.src = "../Images/logo.png";
        imgEl.onerror = () => (imgEl.src = "../Images/logo.png");
      }

      let resolvedItemId = null;
      if (Number.isFinite(itemId) && itemId > 0) resolvedItemId = itemId;

      if (resolvedItemId) {
        const itemRes = await fetch(`/api/items/${resolvedItemId}`, {
          credentials: "include",
        });
        if (itemRes.ok) {
          const item = await itemRes.json();

          if (imgEl) {
            imgEl.src = item.imageUrl || "../Images/logo.png";
            imgEl.onerror = () => (imgEl.src = "../Images/logo.png");
          }

          if (productTitle) {
            productTitle.textContent = item.title || room.itemTitle || "";
          }

          // 상세 표시 텍스트(동네/카테고리/가격)
          const loc = item.location || "";
          const cat = item.category || "";
          const price = Number(item.price || 0);

          let priceText = "";
          // 나눔이면 가격 숨김(프로젝트 룰에 맞춰 조정 가능)
          if (!(cat === "나눔" || price === 0)) {
            priceText = `${price.toLocaleString()}원`;
          } else if (cat === "나눔" || price === 0) {
            priceText = "0원";
          }

          // product-status는 "거래상태"로 쓰고 있으니 여기선 건드리지 않음
          // (원하면 아래에 보조 텍스트 영역을 만들어서 넣는 방식 추천)
        }

        // ✅ 상품 바 클릭 시 상세로 이동 (거래/나가기 버튼 누르면 이동 안 함)
        const bar = document.querySelector(".product-bar");
        if (bar) {
          bar.style.cursor = "pointer";
          bar.onclick = (e) => {
            if (e.target && e.target.closest("#btnLeave")) return;
            if (e.target && e.target.closest("#btnTrade")) return;
            location.href = `./detail.html?id=${encodeURIComponent(
              resolvedItemId
            )}`;
          };
        }
      }

      // 3) 마지막에 거래 상태 반영
      await updateTradeStatusLabel();
    } catch (e) {
      console.warn("renderRoomHeader fail", e);
    }
  }

  // =========================
  // ✅ 거래 버튼/나가기 버튼
  // =========================
  async function bindTradeAndLeave() {
    // 거래 버튼
    if (tradeBtn) {
      tradeBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

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
          alert("거래가 시작됩니다.");

          // 성공 → 상태 갱신
          await updateTradeStatusLabel();
        } catch (err) {
          console.error(err);
          alert("네트워크 오류로 거래 시작 실패");
        } finally {
          tradeBtn.disabled = false;
        }
      });
    }

    // 나가기 버튼
    if (leaveBtn) {
      leaveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

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
        } catch (err) {
          console.error(err);
          alert("네트워크 오류로 나가기에 실패했어요.");
        }
      });
    }
  }

  // =========================
  // ✅ 시작
  // =========================
  (async function start() {
    sendBtn.disabled = true;

    await bindTradeAndLeave();
    await renderRoomHeader();
    await loadAll();

    sendBtn.disabled = false;

    pollTimer = setInterval(poll, 2000);

    window.addEventListener("beforeunload", () => {
      if (pollTimer) clearInterval(pollTimer);
    });
  })();
})();
