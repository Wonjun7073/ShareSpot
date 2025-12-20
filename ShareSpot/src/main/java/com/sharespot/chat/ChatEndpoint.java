package com.sharespot.chat;

import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

// 1. 웹소켓 엔드포인트 정의 (jakarta.websocket 사용)
@ServerEndpoint("/chat")
public class ChatEndpoint {

    // 1.1. 방 ID별 세션 목록을 저장 (Key: 채팅방 ID, Value: 해당 방의 Set<Session>)
    private static final Map<String, Set<Session>> roomSessions = 
        new ConcurrentHashMap<>();

    // 1.2. 세션 ID별 방 ID를 저장 (연결 종료 시 어느 방에서 나갔는지 알기 위해)
    private static final Map<String, String> sessionRoomMap = 
        new ConcurrentHashMap<>();
        
    // 쿼리 문자열에서 roomId= 값을 추출하기 위한 패턴
    private static final Pattern ROOM_ID_PATTERN = Pattern.compile("roomId=([^&]+)");


    // 클라이언트가 연결되었을 때 (jakarta.websocket 사용)
    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {
        String queryString = session.getQueryString();
        String roomId = extractRoomId(queryString);
        
        if (roomId != null && !roomId.isEmpty()) {
            // 해당 방 ID에 세션을 추가하고 맵에 기록
            roomSessions.computeIfAbsent(roomId, k -> Collections.synchronizedSet(new HashSet<>())).add(session);
            sessionRoomMap.put(session.getId(), roomId);
            
            System.out.println("방 [" + roomId + "]에 클라이언트 연결: " + session.getId());
            
            // 사용자 입장 메시지 전송 (선택 사항)
            broadcast(roomId, "시스템: 새로운 사용자가 입장했습니다.");
        }
    }

    // 클라이언트로부터 메시지를 수신했을 때 (jakarta.websocket 사용)
    @OnMessage
    public void onMessage(String message, Session session) {
        // 어느 방에서 온 메시지인지 확인
        String roomId = sessionRoomMap.get(session.getId());
        
        if (roomId != null) {
            // 2. 받은 메시지를 해당 방의 모든 사용자에게 전송 (1:1 채팅이므로 최대 2명)
            broadcast(roomId, message);
            
            // [TODO: 데이터베이스에 메시지 내용을 영구 저장하는 로직 필요]
        }
    }

    // 클라이언트 연결이 닫혔을 때 (jakarta.websocket 사용)
    @OnClose
    public void onClose(Session session) {
        String roomId = sessionRoomMap.remove(session.getId());
        
        if (roomId != null) {
            Set<Session> sessions = roomSessions.get(roomId);
            if (sessions != null) {
                sessions.remove(session);
                System.out.println("방 [" + roomId + "]에서 클라이언트 연결 종료: " + session.getId());
                
                // 해당 방에 남은 세션이 없다면 방 정보 제거
                if (sessions.isEmpty()) {
                    roomSessions.remove(roomId);
                    System.out.println("방 [" + roomId + "]이 비어 제거되었습니다.");
                }
            }
        }
    }
    
    // 오류 발생 시 (jakarta.websocket 사용)
    @OnError
    public void onError(Session session, Throwable throwable) {
        System.err.println("웹소켓 오류 발생: " + throwable.getMessage());
        onClose(session); // 오류 시 연결 종료 로직 재사용
    }

    /** 해당 방의 모든 세션에 메시지를 브로드캐스트합니다. */
    private void broadcast(String roomId, String message) {
        Set<Session> sessions = roomSessions.get(roomId);
        if (sessions != null) {
            sessions.forEach(s -> {
                if (s.isOpen()) {
                    try {
                        // 클라이언트에게 메시지 전송
                        s.getBasicRemote().sendText(message);
                    } catch (IOException e) {
                        System.err.println("메시지 전송 오류: " + e.getMessage());
                    }
                }
            });
        }
    }
    
    /** URL 쿼리 문자열에서 roomId 값을 추출하는 헬퍼 함수 */
    private String extractRoomId(String queryString) {
        if (queryString == null) return null;
        
        Matcher matcher = ROOM_ID_PATTERN.matcher(queryString);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}