document.addEventListener("DOMContentLoaded", () => {
    console.log("[upload] JS loaded");

    const $ = (s) => document.querySelector(s);

    // === [추가] 이미지 업로드 관련 요소 ===
    const imageInput = $('#imageInput');
    const imageUploadTrigger = $('#imageUploadTrigger');
    const imagePreviewList = $('#imagePreviewList');
    const photoCountText = $('#photoCountText');
    let selectedFiles = []; // 선택된 파일들을 담을 배열

    // === 1. 카테고리 토글 기능 ===
    const categoryButtons = document.querySelectorAll(".category-buttons button");
    categoryButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            categoryButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // === [추가] 2. 이미지 선택 및 미리보기 로직 ===
    if (imageUploadTrigger && imageInput) {
        imageUploadTrigger.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (selectedFiles.length + files.length > 10) {
                alert("사진은 최대 10장까지만 가능합니다.");
                return;
            }

            files.forEach(file => {
                selectedFiles.push(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.style.cssText = "position: relative; width: 80px; height: 80px; margin-right: 10px; margin-bottom: 10px;";
                    previewItem.innerHTML = `
                        <img src="${event.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                        <button type="button" class="delete-btn" style="position: absolute; top: -5px; right: -5px; background: #ff4d4f; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-weight: bold;">×</button>
                    `;
                    previewItem.querySelector('.delete-btn').addEventListener('click', () => {
                        previewItem.remove();
                        selectedFiles = selectedFiles.filter(f => f !== file);
                        photoCountText.innerText = `(${selectedFiles.length}/10)`;
                    });
                    imagePreviewList.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
            photoCountText.innerText = `(${selectedFiles.length}/10)`;
            imageInput.value = ""; 
        });
    }

    // === 3. 모달 및 공통 요소 핸들러 ===
    const modal = $("#confirmModal");
    const modalTitle = $("#modalTitle");
    const modalMessage = $("#modalMessage");
    const modalCancel = $("#modalCancel");
    const modalOk = $("#modalOk");
    const toast = $("#toast");
    const submitBtn = $(".btn-submit");
    const cancelBtn = $(".btn-cancel");

    let locking = false;

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

    // === 4. 버튼 동작 정의 ===
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

    // 등록하기 버튼 (FormData 적용 버전)
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
                        // === [중요] JSON 대신 FormData 사용 (사진 전송용) ===
                        const formData = new FormData();
                        formData.append("title", $("input[placeholder='물품 제목을 입력하세요']").value);
                        formData.append("category", $(".category-buttons button.active")?.innerText || "나눔");
                        formData.append("price", parseInt($("input[type='number']")?.value || 0));
                        formData.append("location", $("select").value);
                        formData.append("description", $("textarea").value);

                        // 선택된 이미지 파일들 추가
                        selectedFiles.forEach(file => {
                            formData.append("files", file); 
                        });

                        const response = await fetch("/api/items", {
                            method: "POST",
                            body: formData // headers를 설정하지 마세요 (브라우저가 자동 설정)
                        });

                        if (response.redirected) {
                            window.location.href = response.url;
                            return;
                        }

                        if (response.ok) {
                            showToast("물품이 등록되었습니다!");
                            setTimeout(() => { window.location.href = "./main.html"; }, 1000);
                        } else {
                            const errorText = await response.text();
                            console.error("서버 에러:", errorText);
                            alert("등록에 실패했습니다.");
                            locking = false;
                            submitBtn.disabled = false;
                        }
                    } catch (error) {
                        console.error("네트워크 에러:", error);
                        showToast("등록 처리가 완료되었습니다.");
                        setTimeout(() => { window.location.href = "./main.html"; }, 1000);
                    }
                }
            });
        });
    }
});