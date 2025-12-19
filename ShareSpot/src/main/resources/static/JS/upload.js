// upload.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("[upload] JS loaded");

  // 카테고리 토글
  const categoryButtons = document.querySelectorAll(".category-buttons button");
  categoryButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    })
  );

  // ===== 모달/토스트 핸들러 =====
  const $ = (s) => document.querySelector(s);
  const modal = $("#confirmModal");
  const modalTitle = $("#modalTitle");
  const modalMessage = $("#modalMessage");
  const modalCancel = $("#modalCancel");
  const modalOk = $("#modalOk");
  const toast = $("#toast");

  function openConfirm({
    title,
    message,
    okText = "확인",
    cancelText = "취소",
    onOk,
  }) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalOk.textContent = okText;
    modalCancel.textContent = cancelText;
    modal.classList.add("show");

    const close = () => modal.classList.remove("show");

    const okHandler = () => {
      modalOk.removeEventListener("click", okHandler);
      modalCancel.removeEventListener("click", close);
      window.removeEventListener("keydown", escHandler);
      close();
      onOk && onOk();
    };

    const escHandler = (e) => {
      if (e.key === "Escape") {
        close();
        window.removeEventListener("keydown", escHandler);
      }
    };

    modalOk.addEventListener("click", okHandler);
    modalCancel.addEventListener("click", close);
    window.addEventListener("keydown", escHandler);
    // 오버레이 클릭 닫기 (박스 외 영역)
    modal.addEventListener(
      "click",
      (e) => {
        if (e.target === modal) close();
      },
      { once: true }
    );
  }

  function showToast(text = "완료되었습니다!") {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  }

  // ===== 버튼 동작 =====
  const cancelBtn = document.querySelector(".btn-cancel");
  const submitBtn = document.querySelector(".btn-submit");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openConfirm({
        title: "작성 취소",
        message: "작성을 취소하시겠습니까?",
        okText: "확인",
        onOk: () => {
          window.location.href = "./main.html";
        },
      });
    });
  }

  if (submitBtn) {
    let locking = false; // 더블클릭 방지
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (locking) return;

      openConfirm({
        title: "등록 확인",
        message: "입력한 내용으로 물품을 등록하시겠습니까?",
        okText: "확인",
        onOk: async () => {
          locking = true;
          submitBtn.disabled = true;

          // TODO: 실제 저장 로직 (fetch/axios) 자리
          // await fetch("/api/items", { method:"POST", body: ... });

          showToast("물품이 등록되었습니다!");
          setTimeout(() => {
            window.location.href = "./main.html";
          }, 900);
        },
      });
    });
  }
});
