document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = Number(params.get("id"));

  const chatBtn = document.getElementById("btnChat");
  const btnHeart = document.getElementById("btnHeart");

  // 뒤로가기
  document.getElementById("btnBack")?.addEventListener("click", () => {
    location.href = "/html/main.html";
  });

  if (!Number.isFinite(itemId)) {
    alert("잘못된 접근입니다.");
    location.href = "/html/main.html";
    return;
  }

  /* =========================
   * 관심(하트) 기능
   * ========================= */
  let isWished = false;

  function applyHeartUI() {
    if (!btnHeart) return;
    btnHeart.textContent = isWished ? "♥" : "♡";
    btnHeart.style.color = isWished ? "red" : "#6A7282";
  }

  async function syncWishStatus() {
    if (!btnHeart) return;
    try {
      const res = await fetch(`/api/wishlist/${itemId}/status`, {
        credentials: "include",
      });
      if (!res.ok) return applyHeartUI();
      const data = await res.json();
      isWished = !!data.wished;
      applyHeartUI();
    } catch (e) {
      console.error("관심 상태 조회 실패", e);
    }
  }

  btnHeart?.addEventListener("click", async () => {
    try {
      const method = isWished ? "DELETE" : "POST";
      const res = await fetch(`/api/wishlist/${itemId}`, {
        method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("관심 처리 실패");
      isWished = !isWished;
      applyHeartUI();
    } catch (e) {
      alert("관심 처리에 실패했습니다. 로그인 상태를 확인해 주세요.");
    }
  });

  /* =========================
   * 채팅 버튼
   * ========================= */
  if (chatBtn) {
    chatBtn.addEventListener("click", () => {
      if (typeof window.openChatList !== "function") {
        alert("채팅 기능 로딩 실패 (app.js 확인)");
        return;
      }
      window.openChatList(itemId);
    });
  }

  /* =========================
   * 게시글 로드
   * ========================= */
  try {
    const res = await fetch(`/api/items/${itemId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("게시글 조회 실패");
    const item = await res.json();

    renderItem(item);
    await syncWishStatus();

    // 내 글이면 채팅 버튼 숨김
    const me = window.Auth?.getUser?.() || window.Auth?.getSessionUser?.();
    if (me?.userId && item.ownerUserId === me.userId) {
      chatBtn && (chatBtn.style.display = "none");
    }

    // 거래 완료
    if (item.status === "SOLD" && chatBtn) {
      chatBtn.disabled = true;
      chatBtn.textContent = "거래완료";
    }
  } catch (err) {
    console.error(err);
    alert("게시글을 불러올 수 없습니다.");
  }

  function renderItem(item) {
    const imgEl = document.getElementById("postImage");
    imgEl.src = item.imageUrl || "/Images/logo.png";
    imgEl.onerror = () => (imgEl.src = "/Images/logo.png");

    document.getElementById("postAuthorName").textContent =
      item.ownerUserId || "알 수 없음";
    document.getElementById("postAuthorAvatar").textContent =
      (item.ownerUserId || "익")[0];
    document.getElementById("postLocation").textContent =
      item.location || "위치 정보 없음";
    document.getElementById("postCategory").textContent =
      item.category || "기타";
    document.getElementById("postTitle").textContent =
      item.title || "(제목 없음)";

    const d = new Date(item.createdAt);
    document.getElementById("postTime").textContent =
      isNaN(d.getTime()) ? "" : d.toLocaleDateString();

    document.getElementById("postDesc").textContent =
      item.description || "";

    const priceEl = document.getElementById("postPrice");
    if (item.category === "나눔" || Number(item.price) === 0) {
      priceEl.textContent = "나눔 🎁";
    } else {
      priceEl.textContent =
        Number(item.price || 0).toLocaleString() + "원";
    }
  }
});
