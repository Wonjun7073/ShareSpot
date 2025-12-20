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
  document.getElementById('statShared').textContent = state.shared;
  document.getElementById('statThanks').textContent = state.thanks;
  document.getElementById('statTrust').textContent = state.trust + '%';
  document.getElementById('chipHistory').textContent = state.history;
  document.getElementById('chipWish').textContent = state.wish;
  document.getElementById('trustCount').textContent = state.thanks;

  // 이벤트 예시: 프로필 수정 버튼
  // 이벤트 예시: 프로필 수정 버튼 클릭 시 이동
  const editBtn = document.getElementById('btnEditProfile');
  if (editBtn) {
    editBtn.addEventListener('click', function () {
      // 경고창 대신 진짜 페이지 이동 코드로 변경!
      location.href = 'edit_profile.html';
    });
  }
})();
