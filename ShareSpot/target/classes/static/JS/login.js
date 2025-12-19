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

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 간단 검증
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

    // 데모: 아무 값이나 통과
    // 필요 시 여기에 실제 인증 API 연동
    localStorage.setItem(
      "shareSpotUser",
      JSON.stringify({
        id: idEl.value.trim(),
        ts: Date.now(),
      })
    );

    showToast("로그인되었습니다!");
    setTimeout(() => {
      window.location.href = "./main.html";
    }, 900);
  });

  // 입력 중 에러 문구 제거
  [idEl, pwEl].forEach((el) =>
    el.addEventListener("input", () => setError(el, ""))
  );
});
