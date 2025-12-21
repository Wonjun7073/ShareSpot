document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const itemIdStr = params.get("id");
  const itemId = Number(itemIdStr);

  const chatBtn = document.getElementById("btnChat");

  // 뒤로가기
  document.getElementById("btnBack")?.addEventListener("click", () => {
    location.href = "/html/main.html";
  });

  if (!Number.isFinite(itemId)) {
    alert("잘못된 접근입니다.");
    location.href = "/html/main.html";
    return;
  }

  // ✅ 채팅 버튼: main의 openChatList 재사용
  if (chatBtn) {
    chatBtn.addEventListener("click", () => {
      if (typeof window.openChatList !== "function") {
        alert("채팅 기능 로딩에 실패했습니다. (app.js 확인)");
        return;
      }
      window.openChatList(itemId);
    });
  }

  try {
    const res = await fetch(`/api/items/${itemId}`, { credentials: "include" });
    if (!res.ok) throw new Error("게시글 조회 실패");
    const item = await res.json();

    renderItem(item);

    // ✅ 내 글이면 채팅 버튼 숨김
    const me = window.Auth?.getUser?.() || window.Auth?.getSessionUser?.();
    const myUserId = me?.userId ?? null;
    if (myUserId && item.ownerUserId === myUserId) {
      chatBtn && (chatBtn.style.display = "none");
    }

    // ✅ (선택) 거래완료면 채팅 비활성화
    if (item.status === "SOLD") {
      if (chatBtn) {
        chatBtn.disabled = true;
        chatBtn.textContent = "거래완료";
      }
    }
  } catch (err) {
    console.error(err);
    alert("게시글을 불러올 수 없습니다.");
  }

  function renderItem(item) {
    const imgEl = document.getElementById("postImage");
    imgEl.src = item.imageUrl ? item.imageUrl : "/Images/logo.png";

    document.getElementById("postAuthorName").textContent =
      item.ownerUserId || "알 수 없음";
    document.getElementById("postAuthorAvatar").textContent =
      (item.ownerUserId || "익")[0];
    document.getElementById("postLocation").textContent =
      item.location || "위치 정보 없음";
    document.getElementById("postCategory").textContent =
      item.category || "기타";
    document.getElementById("postTitle").textContent = item.title || "";
    document.getElementById("postTime").textContent = new Date(
      item.createdAt
    ).toLocaleDateString();
    document.getElementById("postDesc").innerText =
      item.description || item.content || "";

    const priceEl = document.getElementById("postPrice");
    if (item.category === "나눔" || Number(item.price) === 0) {
      priceEl.textContent = "나눔 🎁";
    } else {
      priceEl.textContent = Number(item.price || 0).toLocaleString() + "원";
    }
  }

  // 하트 버튼
  const btnHeart = document.getElementById("btnHeart");
  btnHeart?.addEventListener("click", () => {
    const current = btnHeart.textContent;
    btnHeart.textContent = current === "♡" ? "♥" : "♡";
    btnHeart.style.color = current === "♡" ? "red" : "#6A7282";
  });
});
