// login.js
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const idEl = $("#loginId");
  const pwEl = $("#loginPw");
  const form = $("#loginForm");
  const toast = $("#toast");

  function showToast(text) {
    toast.textContent = text || "로그인되었습니다!";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1400);
  }

  function setError(el, msg) {
    const help = el.parentElement.querySelector(".field-help");
    help.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let ok = true;
    if (!idEl.value.trim()) {
      setError(idEl, "아이디를 입력해주세요.");
      ok = false;
    } else setError(idEl, "");

    if (!pwEl.value.trim()) {
      setError(pwEl, "비밀번호를 입력해주세요.");
      ok = false;
    } else setError(pwEl, "");

    if (!ok) return;

    const id = idEl.value.trim();
    const pw = pwEl.value.trim();

    // ✅ 여기서 서버 로그인 호출
    const success = await window.Auth.login(id, pw);

    if (!success) {
      showToast("아이디 또는 비밀번호가 잘못되었습니다.");
      return;
    }

    showToast("로그인되었습니다!");
    setTimeout(() => {
      window.location.href = "./main.html";
    }, 900);
  });

  [idEl, pwEl].forEach((el) =>
    el.addEventListener("input", () => setError(el, ""))
  );
});
