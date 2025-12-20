/**
 * auth.js
 * 인증 관련 공통 모듈
 */

const Auth = {
  STORAGE_KEY: "SS_USER",

  /* =========================
   * 로그인
   * ========================= */
  async login(userId, password) {
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("LOGIN NON-JSON RESPONSE:", text);
        return false;
      }

      if (!res.ok || !data.success) return false;

      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          userId,
          loginAt: Date.now(),
        })
      );

      return true;
    } catch (e) {
      console.error("로그인 네트워크 오류:", e);
      return false;
    }
  },

  /* =========================
   * 회원가입
   * ========================= */
  async register(userId, password) {
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const text = await res.text(); // ✅ 에러도 그대로 받기
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("REGISTER NON-JSON RESPONSE:", text);
        return {
          success: false,
          message: "서버 응답이 올바르지 않습니다.",
        };
      }

      if (!res.ok) {
        console.error("REGISTER HTTP ERROR:", res.status, data);
        return {
          success: false,
          message: `HTTP ${res.status} 오류`,
        };
      }

      return data;
    } catch (e) {
      console.error("회원가입 네트워크 오류:", e);
      return {
        success: false,
        message: "서버 연결 오류",
      };
    }
  },

  /* =========================
   * 로그아웃
   * ========================= */
  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /* =========================
   * 현재 로그인 유저
   * ========================= */
  getUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /* =========================
   * 로그인 가드
   * ========================= */
  guard() {
    if (!this.getUser()) {
      alert("로그인이 필요합니다.");
      location.replace("./login.html");
    }
  },
};

window.Auth = Auth;
