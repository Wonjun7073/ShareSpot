// 간단한 동작만 연결 (원하는 페이지로 바꿔도 됨)
document.addEventListener("DOMContentLoaded", () => {
  const btnBack = document.getElementById("btnBack");
  const btnChat = document.getElementById("btnChat");
  const btnHeart = document.getElementById("btnHeart");

  btnBack?.addEventListener("click", () => history.back());

  btnChat?.addEventListener("click", () => {
    alert("채팅하기 클릭!");
    // location.href = "./chat.html";
  });

  btnHeart?.addEventListener("click", () => {
    btnHeart.textContent = btnHeart.textContent === "♡" ? "♥" : "♡";
  });
});
