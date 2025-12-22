/**
 * account_settings.js
 * - 계정 설정 페이지 전용 JS
 * - confirm-modal.html(기존 스타일) 재사용 (로그아웃/탈퇴만)
 * - 내 동네 드롭다운 모달 선택 + 저장 (저장 완료 알림 모달 없음)
 * - 회원 탈퇴(DELETE /api/user/me)
 */

/* =========================
   Confirm Modal (공용)
   - confirm-modal.html의 id 기준:
     confirmOverlay / confirmTitle / confirmMessage / confirmCancel / confirmOk
========================= */
function openConfirmModal({
  title = "확인",
  message = "",
  onOk,
  hideCancel = false,
  okText = "확인",
}) {
  const modal = document.getElementById("confirmOverlay");
  const titleEl = document.getElementById("confirmTitle");
  const messageEl = document.getElementById("confirmMessage");
  const btnCancel = document.getElementById("confirmCancel");
  const btnOk = document.getElementById("confirmOk");

  if (!modal || !titleEl || !messageEl || !btnCancel || !btnOk) {
    console.warn("confirm-modal.html 요소(id)가 없습니다.");
    return;
  }

  titleEl.textContent = title;
  messageEl.textContent = message;

  btnOk.textContent = okText;
  btnCancel.style.display = hideCancel ? "none" : "";

  // ✅ 혹시 form 안에 들어가도 submit 안 되게(안전)
  btnCancel.setAttribute("type", "button");
  btnOk.setAttribute("type", "button");

  // 열기
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  const close = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");

    // 원복
    btnCancel.style.display = "";
    btnOk.textContent = "확인";

    btnCancel.removeEventListener("click", onCancel);
    btnOk.removeEventListener("click", onConfirm);
    modal.removeEventListener("click", onBackdrop);
    document.removeEventListener("keydown", onEsc);
  };

  const onCancel = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    close();
  };

  const onConfirm = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
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
  if (document.getElementById("confirmOverlay")) {
    // 이미 confirmOverlay가 로드된 경우에는 더 이상 로드하지 않음
    return;
  }

  const root = document.getElementById("modal-root");
  if (!root) {
    console.warn("#modal-root가 없습니다.");
    return;
  }

  try {
    const res = await fetch("../Components/confirm-modal.html");
    if (!res.ok) {
      console.error("confirm-modal.html 로드 실패", res);
      return;
    }
    root.insertAdjacentHTML("beforeend", await res.text());
  } catch (e) {
    console.error("confirm-modal.html 로드 중 에러 발생", e);
  }
}

/* =========================
   서버에서 내 정보 불러오기
========================= */
async function fetchMe() {
  try {
    const res = await fetch("/api/user/me", { credentials: "include" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn("me 조회 실패", e);
    return null;
  }
}

function setTextForce(selector, value, fallback = "-") {
  const el = document.querySelector(selector);
  if (!el) return;
  const v = (value ?? "").toString().trim();
  el.textContent = v ? v : fallback;
}

/* =========================
   내 동네 드롭다운 모달
========================= */
function initDongModal() {
  const locationRow = document.getElementById("locationRow");
  const dongOverlay = document.getElementById("dongOverlay");
  const dongCloseBtn = document.getElementById("dongCloseBtn");
  const dongSelect = document.getElementById("dongSelect");
  const dongSaveBtn = document.getElementById("dongSaveBtn");

  if (
    !locationRow ||
    !dongOverlay ||
    !dongCloseBtn ||
    !dongSelect ||
    !dongSaveBtn
  ) {
    return;
  }

  function openDongModal() {
    dongOverlay.classList.add("show");
    dongOverlay.setAttribute("aria-hidden", "false");

    const current = (
      document.getElementById("locationText")?.textContent || ""
    ).trim();
    if (current && current !== "-") dongSelect.value = current;

    dongSaveBtn.disabled = !dongSelect.value;
  }

  function closeDongModal() {
    dongOverlay.classList.remove("show");
    dongOverlay.setAttribute("aria-hidden", "true");
  }

  locationRow.addEventListener("click", openDongModal);
  dongCloseBtn.addEventListener("click", closeDongModal);

  dongOverlay.addEventListener("click", (e) => {
    if (e.target === dongOverlay) closeDongModal();
  });

  dongSelect.addEventListener("change", () => {
    dongSaveBtn.disabled = !dongSelect.value;
  });

  // ✅ 저장 완료 알림 모달 없음: 성공하면 바로 반영하고 닫기
  dongSaveBtn.addEventListener("click", async () => {
    const dong = dongSelect.value;
    if (!dong) return;

    try {
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dong }),
      });

      if (!res.ok) {
        alert("내 동네 저장에 실패했습니다.");
        return;
      }

      const locEl = document.getElementById("locationText");
      if (locEl) locEl.textContent = dong;

      closeDongModal();
    } catch (e) {
      console.error(e);
      alert("네트워크 오류로 저장에 실패했습니다.");
    }
  });
}

/* =========================
   페이지 초기화
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // 0) confirm 모달 로드
  await mountConfirmModal();
  const passwordRow = document.getElementById("passwordRow");
  const pwModal = document.getElementById("passwordModal");

  passwordRow?.addEventListener("click", () => {
    pwModal?.classList.add("show");
    pwModal?.setAttribute("aria-hidden", "false");
  });

  // 버튼이 submit 되지 않게 강제
  document.getElementById("pwCancel")?.setAttribute("type", "button");
  document.getElementById("pwSave")?.setAttribute("type", "button");

  document.getElementById("pwCancel")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pwModal?.classList.remove("show");
    pwModal?.setAttribute("aria-hidden", "true");
  });

  document.getElementById("pwSave")?.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPw = document.getElementById("currentPw")?.value.trim() || "";
    const newPw = document.getElementById("newPw")?.value.trim() || "";
    const confirmPw =
      document.getElementById("newPwConfirm")?.value.trim() || "";

    if (!currentPw || !newPw || !confirmPw) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg =
          typeof data === "string"
            ? data
            : data?.message || "비밀번호 변경 실패";
        alert(msg);
        return;
      }

      // success 필드가 없을 수도 있으니 안전하게 처리
      if (typeof data === "object" && data?.success === false) {
        alert(data.message || "비밀번호 변경 실패");
        return;
      }
      await mountConfirmModal();

      // ✅ 성공 처리
      openConfirmModal({
        title: "변경 완료",
        message: "비밀번호가 변경되었습니다.",
        hideCancel: true,
        okText: "확인",
        onOk: () => {
          // 입력 초기화
          const a = document.getElementById("currentPw");
          const b = document.getElementById("newPw");
          const c = document.getElementById("newPwConfirm");
          if (a) a.value = "";
          if (b) b.value = "";
          if (c) c.value = "";

          // 비밀번호 변경 모달 닫기
          pwModal?.classList.remove("show");
          pwModal?.setAttribute("aria-hidden", "true");
        },
      });

      // 입력 초기화 + 모달 닫기
      document.getElementById("currentPw").value = "";
      document.getElementById("newPw").value = "";
      document.getElementById("newPwConfirm").value = "";

      pwModal?.classList.remove("show");
      pwModal?.setAttribute("aria-hidden", "true");
    } catch (err) {
      console.error(err);
      alert("네트워크 오류가 발생했습니다.");
    }
  });

  // 1) 로그인 가드 (기존 Auth 사용)
  if (window.Auth && typeof Auth.guard === "function") {
    Auth.guard();
  }

  // 2) 내 정보 표시(서버 기준)
  const me = await fetchMe();
  if (me) {
    setTextForce("#userIdText", me.userId || me.id);
    setTextForce("#phoneText", me.phone);
    setTextForce("#locationText", me.dong);
  }

  // 3) 로그아웃
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openConfirmModal({
        title: "로그아웃",
        message: "정말 로그아웃 하시겠어요?",
        okText: "로그아웃",
        onOk: () => {
          if (window.Auth && typeof Auth.logout === "function") {
            Auth.logout();
          } else {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            location.replace("./login.html");
          }
        },
      });
    });
  }

  // 4) 회원 탈퇴
  const withdrawBtn = document.getElementById("withdrawBtn");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", () => {
      openConfirmModal({
        title: "회원 탈퇴",
        message:
          "탈퇴 시 내가 올린 글/채팅/관심목록 등 모든 정보가 삭제되며 복구할 수 없습니다.\n정말 탈퇴하시겠어요?",
        okText: "탈퇴",
        onOk: async () => {
          try {
            const res = await fetch("/api/user/me", {
              method: "DELETE",
              credentials: "include",
            });

            if (!res.ok) {
              openConfirmModal({
                title: "탈퇴 실패",
                message: "탈퇴 처리 중 오류가 발생했습니다.",
                hideCancel: true,
              });
              return;
            }

            // ✅ 성공 시 바로 이동(추가 알림 없이)
            location.replace("./login.html");
          } catch (e) {
            // 요청이 중단되어도(Abort) 탈퇴는 성공했을 수 있으니 로그인으로 이동
            location.replace("./login.html");
          }
        },
      });
    });
  }

  // 5) 내 동네 드롭다운 모달 초기화
  initDongModal();
});
