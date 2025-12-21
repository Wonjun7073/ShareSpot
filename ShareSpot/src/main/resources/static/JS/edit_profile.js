async function loadMeForEdit() {
  try {
    const res = await fetch("/api/user/me");
    if (!res.ok) {
      console.error("me api failed:", res.status);
      return;
    }



    const me = await res.json();

    const nickname = me.nickname || me.userId || "";
    document.getElementById("nicknameInput").value = nickname;
    document.getElementById("dongSelect").value = me.dong || "시흥시 정왕동";

    document.getElementById("phoneInput").value = me.phone || "";

    const initial = me.profileInitial || (nickname ? nickname[0] : "?");

    document.getElementById("avatarPlaceholder").textContent = initial;
  } catch (e) {
    console.error("loadMeForEdit error", e);
  }
}

async function saveProfile() {
  try {
    const nickname = document.getElementById("nicknameInput").value.trim();
    const dong = document.getElementById("dongSelect").value;
    const phone = document.getElementById("phoneInput").value.trim();

    if (!nickname) {
      alert("이름(닉네임)을 입력해주세요.");
      return;
    }

    const res = await fetch("/api/user/me", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, dong, phone }),
    });

    const text = await res.text();
    if (!res.ok) {
      alert(text); // ✅ 서버가 준 에러 그대로 보기
      return;
    }

    if (!res.ok) {
      alert("프로필 저장 실패");
      return;
    }

    location.href = "my.html";
  } catch (e) {
    console.error("saveProfile error", e);
    alert("서버 오류");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMeForEdit();
  document.getElementById("saveBtn").addEventListener("click", saveProfile);
});
