// src/main/webapp/JS/chat.js

document.addEventListener('DOMContentLoaded', () => {
    
    const chatLog = document.getElementById('chatLog');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatHeader = document.getElementById('chatHeader');
    
    // URL에서 roomId와 title을 추출 (openChatRoom에서 리다이렉트 시 넘겨준 파라미터)
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room'); 
    const itemTitle = urlParams.get('title');

    if (!roomId) {
        chatHeader.textContent = "오류: 채팅방 정보가 없습니다.";
        return;
    }
    
    // 1. 헤더 업데이트 및 현재 사용자 ID 설정 (임시)
    chatHeader.textContent = `[${itemTitle}] 채팅방`;
    const currentUserId = "user_" + Math.floor(Math.random() * 100); // 임시 사용자 ID

    // 2. 웹소켓 연결 수립
    // 서버 엔드포인트에 roomId를 쿼리 파라미터로 전송
    const chatSocket = new WebSocket(`ws://localhost:8080/sharespot/chat?roomId=${roomId}&userId=${currentUserId}`);

    // 3. 연결 이벤트 처리
    chatSocket.onopen = function(e) {
        console.log(`[WebSocket] 방 ${roomId}에 연결됨.`);
        // [TODO: 기존 채팅 기록을 서버에 요청하는 로직 추가]
    };

    // 4. 메시지 수신 처리
    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        displayMessage(data.sender, data.msg); // 화면에 메시지 표시
    };
    
    // 5. 메시지 전송 버튼 이벤트
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 6. 메시지 전송 함수
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message === "") return;

        const messageData = {
            sender: currentUserId,
            msg: message,
            roomId: roomId 
        };
        
        // 서버로 전송 (JSON 문자열)
        chatSocket.send(JSON.stringify(messageData));
        messageInput.value = ''; // 입력창 초기화
    }
    
    // 7. 메시지 화면 출력 함수
    function displayMessage(sender, msg) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(sender === currentUserId ? 'my-message' : 'other-message'); // CSS 클래스 추가
        messageElement.innerHTML = `<b>${sender}:</b> ${msg}`;
        chatLog.appendChild(messageElement);
        chatLog.scrollTop = chatLog.scrollHeight; // 스크롤을 맨 아래로 이동
    }
    
    // 8. 기타 연결 이벤트
    chatSocket.onclose = function(e) { console.warn("[WebSocket] 연결 종료."); };
    chatSocket.onerror = function(e) { console.error("[WebSocket] 오류 발생:", e); };
});