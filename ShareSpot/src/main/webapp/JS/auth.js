// 간단한 프론트엔드 인증 유틸 (LocalStorage)
const Auth = {
  STORAGE_KEY: "SS_USER",

  // 데모 계정 검증 (실서비스는 서버 API 호출로 교체)
  async login(id, pw) {
    const isValid = id === "user" && pw === "1234";
    if (!isValid) return false;

    const profile = { id, nickname: "김시흥", dong: "시흥시 정왕동", loginAt: Date.now() };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    return true;
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  // 페이지 접근 가드: 로그인 안 되어 있으면 로그인 페이지로 보냄
  guard() {
    if (!this.getUser()) {
      alert("로그인이 필요합니다.");
      location.replace("./login.html");
    }
  }
};

// 전역 노출
window.Auth = Auth;

// 모든 페이지 공통: 사이드바의 로그아웃 버튼(#logoutBtn)이 있다면 동작 부여
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.logout();
      location.href = "./login.html";
    });
  }
});
