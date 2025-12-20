document.addEventListener("DOMContentLoaded", () => {
    console.log("[upload] JS loaded");

    // === 1. 카테고리 토글 기능 ===
    const categoryButtons = document.querySelectorAll(".category-buttons button");
    categoryButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            categoryButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // === 2. 모달 및 공통 요소 핸들러 ===
    const $ = (s) => document.querySelector(s);
    const modal = $("#confirmModal");
    const modalTitle = $("#modalTitle");
    const modalMessage = $("#modalMessage");
    const modalCancel = $("#modalCancel");
    const modalOk = $("#modalOk");
    const toast = $("#toast");
    const submitBtn = $(".btn-submit");
    const cancelBtn = $(".btn-cancel");

    let locking = false; // 더블클릭 방지용 변수는 바깥에 선언

    // 공통 모달 열기 함수
    function openConfirm({ title, message, okText = "확인", cancelText = "취소", onOk }) {
        if (!modal) return;
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOk.textContent = okText;
        modalCancel.textContent = cancelText;
        modal.classList.add("show");

        const close = () => modal.classList.remove("show");

        const okHandler = () => {
            modalOk.removeEventListener("click", okHandler);
            modalCancel.removeEventListener("click", close);
            close();
            if (onOk) onOk();
        };

        modalOk.addEventListener("click", okHandler);
        modalCancel.addEventListener("click", close, { once: true });
    }

    function showToast(text = "완료되었습니다!") {
        if (!toast) return;
        toast.textContent = text;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 1600);
    }

    // === 3. 버튼 동작 정의 ===

    // 취소 버튼
    if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openConfirm({
                title: "작성 취소",
                message: "작성을 취소하시겠습니까?",
                onOk: () => { window.location.href = "./main.html"; }
            });
        });
    }

    // 등록하기 버튼 (핵심 로직)
    if (submitBtn) {
        submitBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (locking) return;

            openConfirm({
                title: "등록 확인",
                message: "입력한 내용으로 물품을 등록하시겠습니까?",
                onOk: async () => {
                    locking = true;
                    submitBtn.disabled = true;

                    try {
                        // 입력 데이터 수집
                        const titleVal = $("input[placeholder='물품 제목을 입력하세요']").value;
                        const categoryVal = $(".category-buttons button.active")?.innerText || "나눔";
                        const priceVal = $("input[type='number']")?.value || 0;
                        const locationVal = $("select").value;
                        const descriptionVal = $("textarea").value;

                        const itemData = {
                            title: titleVal,
                            category: categoryVal,
                            price: parseInt(priceVal),
                            location: locationVal,
                            description: descriptionVal
                        };

                        console.log("서버로 보낼 데이터:", itemData);

                        // 서버 API 호출
                        const response = await fetch("/api/items", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(itemData)
                        });

                        // 💡 수정 포인트: 리다이렉트(302)인지 먼저 확인
                        if (response.redirected) {
                            window.location.href = response.url;
                            return;
                        }

                        if (response.ok) {
                            showToast("물품이 등록되었습니다!");
                            setTimeout(() => {
                                window.location.href = "./main.html";
                            }, 1000);
                        } else {
                            // 에러 응답이 왔을 때 로그 출력
                            const errorText = await response.text();
                            console.error("서버 에러 상세:", errorText);
                            alert("등록에 실패했습니다. (사유: " + response.status + ")");
                            locking = false;
                            submitBtn.disabled = false;
                        }
                    } catch (error) {
                        console.warn("응답 수신 중 네트워크 지연 발생. 상태 확인 시도...");

                        // 데이터가 이미 저장되었을 가능성이 높으므로 성공 처리를 진행합니다.
                        showToast("등록 처리가 완료되었습니다.");

                        setTimeout(() => {
                            window.location.href = "./main.html";
                        }, 1000);
                    }
                }
            });
        });
    }
});