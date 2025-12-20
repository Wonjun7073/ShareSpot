document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = document.getElementById("signupId").value.trim();
  const nickname = document.getElementById("signupNickname").value.trim();
  const pw = document.getElementById("signupPw").value.trim();
  const pw2 = document.getElementById("signupPwConfirm").value.trim();

  if (!userId || !nickname || !pw || !pw2) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  if (pw !== pw2) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const res = await Auth.register(userId, pw, nickname);

  if (!res.success) {
    alert(res.message || "회원가입 실패");
    return;
  }

  alert("회원가입이 완료되었습니다!");
  location.href = "./login.html";
});
