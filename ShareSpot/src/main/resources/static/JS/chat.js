/**
 * chat.js (for existing chat_room.html DOM)
 * - chat_room.html 수정 없이 1:1 실시간 송/수신
 * - URL: /html/chat_room.html?me=user1&peer=user2
 *   (me/peer 없으면 Auth(STORAGE_KEY)에서 me 추출 시도)
 */

(function () {
  console.log("chat.js loaded (chat_room compatible)");

  // ===== DOM (chat_room.html 기준) =====
  const messageArea = document.querySelector(".message-area");
  const inputEl = document.querySelector(".chat-input-bar input[type='text']");
  const sendBtn = document.querySelector(".chat-input-bar .send-btn");

  if (!messageArea || !inputEl || !sendBtn) {
    console.warn("Chat elements not found", { messageArea, inputEl, sendBtn });
    return;
  }

  // ===== Query params =====
  const params = new URLSearchParams(location.search);
  const peer = (params.get("peer") || "").trim();
  let me = (params.get("me") || "").trim();
  let room = (params.get("room") || "").trim();



  function loadMsgList(key)
  {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  function saveMsgList(key,store) {
    localStorage.setItem(key, JSON.stringify(store));
  }
  // ===== Auth에서 me 자동 추출 (가능하면) =====
  // auth.js에 STORAGE_KEY="SS_USER"가 있다고 했었음 (네 프로젝트 기준)
  // 구조가 다를 수 있으니 안전하게 여러 키를 시도
  function tryGetMeFromAuth(perSession) {
    try {
      if (window.Auth && Auth.STORAGE_KEY) {

        let raw = ""
        if(perSession == true)
        {
          raw = sessionStorage.getItem(Auth.STORAGE_KEY);
        }else
        {
          raw = localStorage.getItem(Auth.STORAGE_KEY);
        }

      
        if (!raw) return "";
        const obj = JSON.parse(raw);
        // 흔한 케이스들 다 시도
        return (
          (obj && (obj.userId || obj.userid || obj.id || obj.username || obj.email)) ||
          ""
        ).toString().trim();
      }
    } catch (e) {}
    return "";
  }

  if (!me) me = tryGetMeFromAuth(true);

  // if (!me || !peer) {
  //   // chat_room.html은 수정 안 하니까, 최소 안내만 콘솔로 찍고 종료
  //   console.warn("Need me & peer. Use: /html/chat_room.html?me=user1&peer=user2");
  //   // 입력/전송 막기
  //   inputEl.placeholder = "URL에 me, peer가 필요합니다. 예) ?me=user1&peer=user2";
  //   inputEl.disabled = true;
  //   sendBtn.disabled = true;
  //   return;
  // }

    if(room != "")
  {
    //localStorage.removeItem(room);
    
    let msgList = loadMsgList(room);
    displayMsgList(msgList);
  }


  // ===== 컨텍스트 경로 자동 =====
  // 예) /ShareSpot/html/chat_room.html -> basePath=/ShareSpot
  const basePath = (() => {
    const p = location.pathname;
    const idx = p.indexOf("/html/");
    if (idx >= 0) return p.substring(0, idx);
    return "";
  })();

  // ===== roomId =====
  const roomId = [me, peer].sort().join("__");

  console.log("[CHAT]", { me, peer, roomId, basePath: basePath || "/" });

  // ===== UI append helpers =====
  function esc(s) {
    return String(s).replace(/[&<>\"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  function toTimeLabel(dateLike) {
    // createdAt: "2025-12-21T12:34:56"
    // 화면은 대충 "오후 3:24" 형태
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

  function appendMsg({ sender, receiver, content, createdAt }) {
    const isMe = sender === me;
    const row = document.createElement("div");
    row.className = "message-row " + (isMe ? "sent" : "received");

    if (isMe) {
      // sent 구조: msg-meta + bubble
      const meta = document.createElement("div");
      meta.className = "msg-meta";

      const read = document.createElement("span");
      read.className = "read-check";
      read.textContent = ""; // 읽음 처리 로직은 나중에 (HTML 수정 없이 비워둠)

      const time = document.createElement("span");
      time.className = "msg-time";
      time.textContent = toTimeLabel(createdAt);

      meta.appendChild(read);
      meta.appendChild(time);

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = esc(content);

      row.appendChild(meta);
      row.appendChild(bubble);
    } else {
      // received 구조: bubble + msg-time
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = esc(content);

      const time = document.createElement("div");
      time.className = "msg-time";
      time.textContent = toTimeLabel(createdAt);

      row.appendChild(bubble);
      row.appendChild(time);
    }

    messageArea.appendChild(row);
    messageArea.scrollTop = messageArea.scrollHeight;
  }

  async function loadHistory() {
    const url = `${basePath}/api/chat/history?roomId=${encodeURIComponent(roomId)}`;
    console.log("[HISTORY] GET", url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("history http " + res.status);
      const list = await res.json();

      // 기존 더미 메시지(하드코딩) 제거하고 싶으면 여기서 비우면 됨.
      // chat_room.html 수정은 안 하더라도, JS로 화면 내용 비우는 건 OK.
      // ✅ 필요하면 주석 해제:
      messageArea.innerHTML = "";

      list.forEach(appendMsg);
    } catch (e) {
      console.warn("[HISTORY] load fail:", e);
    }
  }

  // ===== STOMP connect =====
  let stompClient = null;

  // function connect() {
  //   const wsUrl = `${basePath}/ws`;
  //   console.log("[WS] connect:", wsUrl);

  //   const sock = new SockJS(wsUrl);
  //   stompClient = Stomp.over(sock);
  //   stompClient.debug = null;

  //   stompClient.connect({}, async () => {
  //     console.log("[WS] connected");
  //     sendBtn.disabled = false;

  //     stompClient.subscribe(`/topic/room/${roomId}`, (frame) => {
  //       console.log("[RECV]", frame.body);
  //       try {
  //         const msg = JSON.parse(frame.body);
  //         appendMsg(msg);
  //       } catch (e) {
  //         console.warn("[RECV] parse fail:", e);
  //       }
  //     });

  //     await loadHistory();
  //   }, (err) => {
  //     console.warn("[WS] error:", err);
  //     sendBtn.disabled = true;
  //     setTimeout(connect, 1500);
  //   });
  // }

  var socket = null;

  function connect() {
      socket = io("http://localhost:10001");

      socket.on("connect",()=> {
        socket.emit("joinRoom", room);
      });

      socket.on("receiveMessage",(msg)=>{
          displayMsg(msg.message,true);
      });
  }

  // function send() {
  //   const text = (inputEl.value || "").trim();
  //   if (!text) return;

  //   if (!stompClient || !stompClient.connected) {
  //     console.warn("[SEND] not connected");
  //     return;
  //   }

  //   const payload = {
  //     roomId,
  //     sender: me,
  //     receiver: peer,
  //     content: text
  //   };

  //   console.log("[SEND]", payload);
  //   stompClient.send("/app/chat.send", {}, JSON.stringify(payload));

  //   inputEl.value = "";
  //   inputEl.focus();
  // }

  function send()
  {
     const text = (inputEl.value || "").trim();
     if (!text) return;


    if(!socket.connected) return;




     const payload = {
       tid : crypto.randomUUID(),
       roomId : room,
       sender: me,
       receiver: peer,
       content: text,
       ts : Date.now(),
     };

     console.log("[SEND]", payload);
  //   stompClient.send("/app/chat.send", {}, JSON.stringify(payload));
     socket.emit("chat",  {roomId:room,message:JSON.stringify(payload)});

     inputEl.value = "";
     inputEl.focus();
  }

  // 이벤트 바인딩
  sendBtn.addEventListener("click", send);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });





  function makeMyMsg(msgData)
  {
      let msgRow = document.createElement("div");
      msgRow.classList.add("message-row","sent");

      let msgMeta = document.createElement("div");
      msgMeta.className = "msg-meta";

      let msgRead = document.createElement("span");
      msgRead.className = "read-check";
      msgRead.textContent = "읽음";

      let msgTime = document.createElement("span");
      msgTime.className ="msg-time";
      msgTime.textContent = getKoreanTime();


      let message = document.createElement("div");
      message.className = "bubble";
      message.textContent = msgData.content;

      msgMeta.appendChild(msgRead);
      msgMeta.appendChild(msgTime);


      msgRow.appendChild(msgMeta);
      msgRow.appendChild(message);

      return msgRow;
  }


  function makePeerMsg(msgData)
  {
    let msgRow = document.createElement("div");
    msgRow.classList.add("message-row","received");

    let message = document.createElement("div");
    message.className = "bubble";
    message.textContent = msgData.content;

    let msgTime = document.createElement("div");
    msgTime.className = "msg-time";
    msgTime.textContent = getKoreanTime();

    msgRow.appendChild(message);
    msgRow.appendChild(msgTime);

    return msgRow;

  }

  function displayMsgList(list)
  {
    list.forEach(msg => {
      displayMsg(msg,false);
    });
  }

  function displayMsg(msg, needAddMsg)
  {
      if (msg == null) return;

      let chatList = document.getElementsByClassName("message-area")[0];

      let msgData = JSON.parse(msg);

      if(msgData.sender == me)
      {
        chatList.appendChild(makeMyMsg(msgData));

      }else
      {
        chatList.appendChild(makePeerMsg(msgData));
      }    

      if(!needAddMsg) return;


      addMessage(msg);

  }

  function addMessage(message)
  {
    let msgList = loadMsgList(room);
    if (!msgList) msgList = [];

    if (msgList.some(m => m.tid && m.tid === message.tid))  
    {
      return;
    }


    msgList.push(message)

    msgList.sort((a, b) => a.ts - b.ts);

    let json = JSON.stringify(msgList);

    saveMsgList(room,msgList);
  }



  function getKoreanTime() {
  const now = new Date();

  let hours = now.getHours(); // 0~23
  const minutes = now.getMinutes(); // 0~59

  const ampm = hours >= 12 ? "오후" : "오전";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const minStr = minutes.toString().padStart(2, "0");

  return `${ampm} ${hours}:${minStr}`;
}


  // 시작
  sendBtn.disabled = true;
  connect();
})();
