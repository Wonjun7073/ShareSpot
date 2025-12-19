const Auth = {
  STORAGE_KEY: "SS_USER",

  async login(id, pw) {
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) return false;

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ id, loginAt: Date.now() }));
      return true;
    } catch (e) {
      console.error("로그인 오류:", e);
      return false;
    }
  },

  async register(id, pw) {
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw }),
      });
      const data = await res.json();
      return data; // {success, message}
    } catch (e) {
      console.error("회원가입 오류:", e);
      return { success: false, message: "서버 오류" };
    }
  },



  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  },

  guard() {
    if (!this.getUser()) {
      alert("로그인이 필요합니다.");
      location.replace("./login.html");
    }
  }
};

window.Auth = Auth;

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
