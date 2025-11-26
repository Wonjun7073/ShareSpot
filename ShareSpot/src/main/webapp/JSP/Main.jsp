<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="com.example.model.Post" %>
<%
    // 데이터 생성 (보내주신 HTML의 내용을 반영)
    List<Post> postList = new ArrayList<>();
    
    postList.add(new Post("에어프라이어 나눔합니다", "나눔", "시흥시 정왕동", "나눔 🎁", "5분 전", 12, 8));
    postList.add(new Post("캠핑 텐트 빌려드립니다", "대여", "시흥시 배곧동", "10,000원", "1시간 전", 5, 15));
    postList.add(new Post("전동 드릴 공유해요", "대여", "시흥시 은행동", "5,000원", "3시간 전", 3, 6));
    postList.add(new Post("유아 책 교환해요", "교환", "시흥시 목감동", "나눔 🎁", "5시간 전", 8, 4));
    
    postList.add(new Post("파티용 접시세트 빌려드려요", "대여", "시흥시 신천동", "3,000원", "1일 전", 2, 11));
    postList.add(new Post("보드게임 여러개 나눔", "나눔", "시흥시 대야동", "나눔 🎁", "1일 전", 18, 23));
    postList.add(new Post("프로젝터 대여합니다", "대여", "시흥시 능곡동", "15,000원", "2일 전", 6, 19));
    postList.add(new Post("자전거 수리 공구 공유", "대여", "시흥시 정왕동", "2,000원", "2일 전", 4, 7));
    
    postList.add(new Post("아이 옷 교환해요", "교환", "시흥시 배곧동", "나눔 🎁", "3일 전", 10, 14));
    postList.add(new Post("고압세척기 빌려드립니다", "대여", "시흥시 은행동", "8,000원", "3일 전", 7, 12));
    postList.add(new Post("식물 나눔해요", "나눔", "시흥시 목감동", "나눔 🎁", "4일 전", 20, 31));
    postList.add(new Post("캠핑 의자 대여", "대여", "시흥시 신천동", "3,000원", "4일 전", 5, 9));
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>쉐어스팟</title>
    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/Css/style.css">
    </head>
<body>

    <div class="sidebar">
        <div class="brand">
            <div class="brand-icon">S</div>
            <div class="brand-text">
                <h1>쉐어스팟</h1>
                <p>시흥시 정왕동</p>
            </div>
        </div>
        
        <div class="menu">
            <a href="#" class="menu-item active">
                <span class="menu-icon">🏠</span> 홈
            </a>
            <a href="#" class="menu-item">
                <span class="menu-icon">🏘️</span> 동네생활
            </a>
            <a href="#" class="menu-item">
                <span class="menu-icon">📍</span> 내 근처
            </a>
            <a href="#" class="menu-item">
                <span class="menu-icon">💬</span> 채팅
                <span class="badge">3</span>
            </a>
            <a href="#" class="menu-item">
                <span class="menu-icon">👤</span> 나의 시흥
            </a>
        </div>
        
        <div class="logout">
            <span>🚪</span> 로그아웃
        </div>
    </div>

    <div class="main-content">
        
        <div class="top-header">
            <div class="search-bar">
                <span>🔍</span> 물품, 동네 이름 등을 검색해보세요
            </div>
            <div class="header-actions">
                <button class="write-btn">
                    <span>✏️</span> 글쓰기
                </button>
            </div>
        </div>

        <div class="content-wrapper">
            
            <div class="filter-bar">
                <div class="filter-buttons">
                    <button class="filter-btn active">전체</button>
                    <button class="filter-btn">나눔</button>
                    <button class="filter-btn">대여</button>
                    <button class="filter-btn">교환</button>
                </div>
                <div class="sort-dropdown">
                    정렬: 최신순 ▼
                </div>
            </div>

            <div class="item-grid">
            <% for (Post post : postList) { %>
                <div class="card">
                    <img src="https://placehold.co/413x413" class="card-img" alt="상품 이미지">
                    
                    <div class="card-body">
                        <div class="card-top">
                            <span class="badge-tag"><%= post.getCategory() %></span>
                            <span class="time-ago"><%= post.getTimeAgo() %></span>
                        </div>
                        
                        <h3 class="card-title"><%= post.getTitle() %></h3>
                        <p class="card-price"><%= post.getPrice() %></p>
                        
                        <div class="card-footer">
                            <span><%= post.getLocation() %></span>
                            <div class="card-stats">
                                <span>💬 <%= post.getChatCount() %></span>
                                <span>❤️ <%= post.getInterestCount() %></span>
                            </div>
                        </div>
                    </div>
                </div>
            <% } %>
            </div>
            
        </div>
    </div>

</body>
</html>