Auth.guard();

/* ===== confirmModal 공통 ===== */
function openConfirmModal({ title, message, onOk }) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("modalTitle");
  const msgEl = document.getElementById("modalMessage");
  const cancelBtn = document.getElementById("modalCancel");
  const okBtn = document.getElementById("modalOk");

  if (!modal || !titleEl || !msgEl || !cancelBtn || !okBtn) return;

  titleEl.textContent = title || "확인";
  msgEl.textContent = message || "";

  const close = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    cancelBtn.onclick = null;
    okBtn.onclick = null;
  };

  cancelBtn.onclick = close;
  okBtn.onclick = () => {
    try {
      onOk && onOk();
    } finally {
      close();
    }
  };

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function bindLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openConfirmModal({
      title: "로그아웃",
      message: "정말 로그아웃 하시겠어요?",
      onOk: () => Auth.logout(),
    });
  });
}

/* ===== FAQ 클릭 시 간단 안내 (나중에 상세페이지로 바꿔도 됨) ===== */
const FAQ = {
  "how-register":
    "✏️ 글쓰기 버튼을 눌러 사진/제목/설명을 입력 후 등록하면 돼요.",
  "how-trade":
    "게시글 → 채팅 → 약속 장소/시간 결정 → 거래 완료 순서로 진행돼요.",
  "share-vs-rent": "나눔은 무료로 주는 것, 대여는 일정 기간 빌려주는 거래예요.",
  "how-chat": "게시글 상세에서 ‘채팅하기’를 누르면 상대와 채팅이 시작돼요.",
  scam: "피해가 의심되면 거래 중단 후 증거(채팅/계좌/게시글) 캡처를 남겨주세요.",
  trust:
    "거래 완료/감사/신고 없음 등이 누적되면 신뢰 지수가 상승하도록 설계돼요.",
  "delete-account": "나의 시흥 → 계정 설정 → 회원 탈퇴에서 진행할 수 있어요.",
};

function bindHelpItems() {
  document.querySelectorAll(".help-item-simple[data-key]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      const msg = FAQ[key] || "준비 중입니다.";
      openConfirmModal({
        title: "안내",
        message: msg,
        onOk: () => {},
      });
    });
  });
}

bindLogoutButton();
bindHelpItems();
