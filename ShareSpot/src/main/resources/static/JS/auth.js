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

      // 🔥 userId는 서버 응답 없어도 무조건 저장
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          userId: data.userId ?? userId,
          nickname: data.nickname ?? null,
          dong: data.dong ?? null,
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
  async register(userId, password, nickname) {
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          password,
          nickname, // ✅ 닉네임 추가
        }),
      });

      const text = await res.text();
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

      if (!res.ok || !data.success) {
        console.error("REGISTER ERROR:", data);
        return {
          success: false,
          message: data.message || "회원가입 실패",
        };
      }

      return {
        success: true,
      };
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
    location.href = "/html/login.html";
  },

  /* =========================
   * 현재 로그인 유저
   * ========================= */
  getUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("[Auth] SS_USER parse error:", raw, e);
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  },


  /* =========================
   * 로그인 가드
   * ========================= */
  /* =========================
 * 로그인 가드 (세션 기반)
 * ========================= */
  async guard() {
    console.log("[GUARD] page =", location.href);
    console.log("[GUARD] SS_USER raw =", localStorage.getItem(this.STORAGE_KEY));
    console.log("[GUARD] getUser() =", this.getUser());

    // 1) localStorage 있으면 통과
    if (this.getUser()) return true;

    // 2) 없으면 서버 세션으로 확인 (/api/user/me)
    try {
      const res = await fetch("/api/user/me", {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) throw new Error("not logged in");
      const me = await res.json();

      // 세션이 살아있으면 로컬에도 심어두기(선택)
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          userId: me.userId,
          nickname: me.nickname ?? null,
          dong: me.dong ?? null,
          loginAt: Date.now(),
        })
      );

      return true;
    } catch (e) {
      alert("로그인이 필요합니다.");
      location.replace("/html/login.html");
      return false;
    }
  },

};

window.Auth = Auth;
