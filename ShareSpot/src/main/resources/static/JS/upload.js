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

    function openConfirm({ title, message, okText = "확인", cancelText = "취소", onOk }) {
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

    // ===== 폼 읽기/검증/저장 =====
    function readForm() {
        const title = document.querySelector("#title")?.value.trim() ?? "";
        const description = document.querySelector("#description")?.value.trim() ?? "";
        const location = document.querySelector("#location")?.value.trim() ?? "";

        const active = document.querySelector(".category-buttons button.active");
        const category = active ? active.textContent.trim() : "";

        const price = category === "나눔" ? 0 : 0; // 가격 UI 없으니 일단 0

        return { title, category, price, location, description };
    }

    function validateForm(d) {
        if (!d.title) return "제목을 입력하세요.";
        if (!d.category) return "카테고리를 선택하세요.";
        if (!d.location) return "거래 희망 장소를 선택하세요.";
        if (!d.description) return "설명을 입력하세요.";
        return null;
    }

    async function saveItem(data) {
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error("등록 실패: " + txt);
        }
        return await res.json();
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
                    window.location.href = "/html/main.html";
                },
            });
        });
    }

    if (submitBtn) {
        let locking = false;
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (locking) return;

            openConfirm({
                title: "등록 확인",
                message: "입력한 내용으로 물품을 등록하시겠습니까?",
                okText: "확인",
                onOk: async () => {
                    const data = readForm();
                    const err = validateForm(data);
                    if (err) return showToast(err);

                    locking = true;
                    submitBtn.disabled = true;

                    try {
                        console.log("[upload] before saveItem", data);
                        const saved = await saveItem(data);
                        console.log("[upload] saveItem done", saved);
                        showToast("물품이 등록되었습니다!");
                        setTimeout(() => {
                            window.location.href = "/html/main.html";
                        }, 900);
                    } catch (e) {
                        console.error(e);
                        showToast("등록 중 오류가 발생했습니다.");
                        locking = false;
                        submitBtn.disabled = false;
                    }
                },
            });
        });
    }
});
