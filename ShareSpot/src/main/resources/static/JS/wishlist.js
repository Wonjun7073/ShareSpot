document.addEventListener("DOMContentLoaded", () => {
  const btnBack = document.getElementById("btnBack");
  const grid = document.getElementById("wishGrid");
  const countEl = document.getElementById("wishCount");

  // 뒤로가기: my.html로 돌아가게(원하면 history.back()으로 바꿔도 됨)
  btnBack?.addEventListener("click", () => {
    history.back();
    // location.href = "./my.html";
  });

  // 하트 토글
  grid?.addEventListener("click", (e) => {
    const btn = e.target.closest(".wl-heart-btn");
    if (!btn) return;

    btn.classList.toggle("is-on");
    btn.textContent = btn.classList.contains("is-on") ? "♥" : "♡";
    btn.setAttribute(
      "aria-label",
      btn.classList.contains("is-on") ? "관심 해제" : "관심 등록"
    );

    // 개수 갱신 (현재 화면 기준)
    const onCount = grid.querySelectorAll(".wl-heart-btn.is-on").length;
    if (countEl) countEl.textContent = `${onCount}개`;
  });

  // 카드 클릭 시 상세로 이동(하트 누른 경우 제외)
  grid?.addEventListener("click", (e) => {
    if (e.target.closest(".wl-heart-btn")) return;

    const card = e.target.closest(".wl-card");
    if (!card) return;

    const id = card.dataset.id;
    // 상세페이지 경로에 맞게 수정
    location.href = `./detail.html?id=${encodeURIComponent(id)}`;
  });
});
