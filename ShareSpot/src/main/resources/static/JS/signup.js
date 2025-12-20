document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("signupId").value.trim();
  const pw = document.getElementById("signupPw").value.trim();
  const pw2 = document.getElementById("signupPwConfirm").value.trim();

  if (!id || !pw || !pw2) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  if (pw !== pw2) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    // ✅ 서버 회원가입 호출
    const res = await Auth.register(id, pw);

    if (!res.success) {
      alert(res.message || "회원가입 실패");
      return;
    }

    alert("회원가입이 완료되었습니다!");
    window.location.href = "./login.html";
  } catch (e) {
    console.error(e);
    alert("서버 오류가 발생했습니다.");
  }
});
