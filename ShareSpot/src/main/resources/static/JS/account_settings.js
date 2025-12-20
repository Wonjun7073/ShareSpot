/**
 * account_settings.js
 * - 계정 설정 페이지 전용 JS
 * - 기존 confirmModal 재사용
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

  if (!modal) {
    console.warn("confirmModal이 없습니다.");
    return;
  }

  titleEl.textContent = title;
  messageEl.textContent = message;

  // 모달 열기
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  // 닫기 처리
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
   페이지 초기화
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // 1️⃣ 로그인 가드
  if (window.Auth && typeof Auth.guard === "function") {
    Auth.guard();
  }

  // 2️⃣ 사용자 정보 표시
  const me = window.Auth?.getUser?.();
  if (me) {
    const setText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el && value) el.textContent = value;
    };

    setText("#userIdText", me.id || "");
    setText("#emailText", me.email || "");
    setText("#phoneText", me.phone || "");
    setText("#locationText", me.dong || "");
  }

  // 3️⃣ 로그아웃 (계정 설정 페이지)
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
            // fallback
            localStorage.removeItem("user");
            location.href = "./login.html";
          }
        },
      });
    });
  }

  // 4️⃣ 회원 탈퇴 (아직 서버 안 붙였으면 막아둠)
  const withdrawBtn = document.getElementById("withdrawBtn");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      openConfirmModal({
        title: "회원 탈퇴",
        message:
          "탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠어요?",
        onOk: () => {
          // 나중에 실제 탈퇴 API로 교체
          alert("⚠️ 아직 탈퇴 기능은 구현되지 않았습니다.");
        },
      });
    });
  }

  // 5️⃣ 항목 클릭 (페이지 이동용 – 필요하면 수정)
  bindNav(".as-row[data-go='password']", "./edit_password.html");
  bindNav(".as-row[data-go='email']", "./edit_email.html");
  bindNav(".as-row[data-go='phone']", "./edit_phone.html");
  bindNav(".as-row[data-go='location']", "./edit_location.html");
});

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
