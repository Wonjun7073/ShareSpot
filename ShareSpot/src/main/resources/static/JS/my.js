// 마이페이지 전용 스크립트 (기본 분리)
(function () {
  // 더미 데이터 (필요시 서버/스토리지 연동으로 교체 가능)
  const state = {
    shared: 8,
    thanks: 15,
    trust: 92,
    history: 3,
    wish: 12,
  };

  // 값 바인딩
  document.getElementById("statShared").textContent = state.shared;
  document.getElementById("statThanks").textContent = state.thanks;
  document.getElementById("statTrust").textContent = state.trust + "%";
  document.getElementById("chipHistory").textContent = state.history;
  document.getElementById("chipWish").textContent = state.wish;
  document.getElementById("trustCount").textContent = state.thanks;

  // 이벤트 예시: 프로필 수정 버튼
  document
    .getElementById("btnEditProfile")
    .addEventListener("click", function () {
      alert("프로필 수정 모달(또는 페이지)로 이동하도록 연결하세요.");
    });
})();
