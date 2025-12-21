/**
 * account_settings.js
 * - 계정 설정 페이지 전용 JS
 * - confirm-modal.html(기존 스타일) 재사용
 * - Auth.js 기반
 */

/* =========================
   Confirm Modal (공용)
========================= */
function openConfirmModal({ title = "확인", message = "", onOk }) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("modalTitle");
  const messageEl = document.getElementById("modalMessage");
  const btnCancel = document.getElementById("modalCancel");
  const btnOk = document.getElementById("modalOk");

  if (!modal || !titleEl || !messageEl || !btnCancel || !btnOk) {
    console.warn(
      "confirmModal 요소가 없습니다. (confirm-modal.html이 로드되었는지 확인)"
    );
    return;
  }

  titleEl.textContent = title;
  messageEl.textContent = message;

  // 모달 열기
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  const close = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    btnCancel.removeEventListener("click", onCancel);
    btnOk.removeEventListener("click", onConfirm);
    modal.removeEventListener("click", onBackdrop);
    document.removeEventListener("keydown", onEsc);
  };

  const onCancel = () => close();

  const onConfirm = () => {
    close();
    if (typeof onOk === "function") onOk();
  };

  const onBackdrop = (e) => {
    if (e.target === modal) close();
  };

  const onEsc = (e) => {
    if (e.key === "Escape") close();
  };

  btnCancel.addEventListener("click", onCancel);
  btnOk.addEventListener("click", onConfirm);
  modal.addEventListener("click", onBackdrop);
  document.addEventListener("keydown", onEsc);

  btnOk.focus();
}

/* =========================
   confirm-modal.html 마운트
========================= */
async function mountConfirmModal() {
  // 이미 있으면 중복 로드 방지
  if (document.getElementById("confirmModal")) return;

  const root = document.getElementById("modal-root");
  if (!root) {
    console.warn("#modal-root가 없습니다.");
    return;
  }

  try {
    const res = await fetch("../Components/confirm-modal.html");
    root.insertAdjacentHTML("beforeend", await res.text());
  } catch (e) {
    console.warn("confirm-modal.html 로드 실패", e);
  }
}

/* =========================
   공통 네비게이션 헬퍼
========================= */
function bindNav(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.addEventListener("click", () => {
    location.href = url;
  });
}

/* =========================
   페이지 초기화
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // 0️⃣ 모달 먼저 로드 (⭐ 중요)
  await mountConfirmModal();

  // 1️⃣ 로그인 가드
  if (window.Auth && typeof Auth.guard === "function") {
    Auth.guard();
  }

  // 2️⃣ 사용자 정보 표시
  async function loadMe() {
    const res = await fetch("/api/user/me", { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  }

  const serverMe = await loadMe();
  if (serverMe) {
    const setTextForce = (selector, value, fallback = "-") => {
      const el = document.querySelector(selector);
      if (!el) return;
      const v = (value ?? "").toString().trim();
      el.textContent = v ? v : fallback;
    };

    setTextForce("#userIdText", serverMe.userId);
    setTextForce("#phoneText", serverMe.phone);
    setTextForce("#locationText", serverMe.dong);
  }

  // 3️⃣ 로그아웃
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      openConfirmModal({
        title: "로그아웃",
        message: "정말 로그아웃 하시겠어요?",
        onOk: () => {
          if (window.Auth && typeof Auth.logout === "function") {
            Auth.logout();
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            location.href = "./login.html";
          }
        },
      });
    });
  }

  // 4️⃣ 회원 탈퇴
  const withdrawBtn = document.getElementById("withdrawBtn");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      openConfirmModal({
        title: "회원 탈퇴",
        message:
          "탈퇴 시 내가 올린 글/채팅/관심목록 등 모든 정보가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠어요?",
        onOk: async () => {
          try {
            const res = await fetch("/api/user/me", {
              method: "DELETE",
              credentials: "include",
            });

            // 서버가 실제로 실패 응답을 준 경우만 실패 처리
            if (!res.ok) {
              alert("탈퇴 처리 중 오류가 발생했습니다.");
              return;
            }

            // ✅ 성공이면 replace로 이동(뒤로가기 방지)
            location.replace("./login.html");
          } catch (e) {
            // ✅ 이동/세션종료 타이밍으로 fetch가 중단되어도(Abort) 탈퇴는 성공했을 수 있음
            // 실패 alert 띄우지 말고 그냥 로그인으로 보내기
            location.replace("./login.html");
          }
        },
      });
    });
  }

  // 5️⃣ 항목 클릭(네가 필요하면 다시 켜)
  // bindNav(".as-row[data-go='password']", "./edit_password.html");
  // bindNav(".as-row[data-go='email']", "./edit_email.html");
  // bindNav(".as-row[data-go='phone']", "./edit_phone.html");
  // bindNav(".as-row[data-go='location']", "./edit_location.html");
});
