// upload.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("[upload] JS loaded");

    // 💡 변수명 통일: base64Images (복수형)
    let base64Images = []; 

    // ===== 요소 선택 =====
    const $ = (s) => document.querySelector(s);
    const categoryButtons = document.querySelectorAll(".category-buttons button");
    const imageTrigger = $("#imageTrigger");     
    const realFileInput = $("#realFileInput");   
    const preview = $("#imagePreview");          
    const photoCount = $("#photoCount");         

    const modal = $("#confirmModal");
    const modalTitle = $("#modalTitle");
    const modalMessage = $("#modalMessage");
    const modalCancel = $("#modalCancel");
    const modalOk = $("#modalOk");
    const toast = $("#toast");

    // ===== 카테고리 토글 =====
    categoryButtons.forEach((btn) =>
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            categoryButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        })
    );

    // ===== 💡 사진 등록 로직 (오타 수정됨) =====
    if (imageTrigger && realFileInput) {
        imageTrigger.addEventListener("click", () => {
            if (base64Images.length >= 10) {
                alert("사진은 최대 10장까지 등록 가능합니다.");
                return;
            }
            realFileInput.click();
        });

        realFileInput.addEventListener("change", (e) => {
            const files = Array.from(e.target.files);
            
            files.forEach(file => {
                if (base64Images.length >= 10) return;

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const b64 = ev.target.result;
                    base64Images.push(b64); // 💡 변수명 base64Images로 통일

                    const imgContainer = document.createElement("div");
                    imgContainer.style.display = "inline-block";
                    imgContainer.style.position = "relative";
                    imgContainer.style.marginRight = "10px";
                    
                    imgContainer.innerHTML = `
                        <img src="${b64}" style="width:80px; height:80px; object-fit:cover; border-radius:8px; margin-top:10px;">
                        <span class="remove-btn" style="position:absolute; top:5px; right:-5px; background:rgba(255,0,0,0.8); color:white; border-radius:50%; width:20px; height:20px; text-align:center; cursor:pointer; font-size:14px; line-height:20px;">×</span>
                    `;

                    imgContainer.querySelector(".remove-btn").onclick = () => {
                        imgContainer.remove();
                        base64Images = base64Images.filter(img => img !== b64);
                        if (photoCount) photoCount.innerText = `(${base64Images.length}/10)`;
                    };

                    if (preview) preview.appendChild(imgContainer);
                    if (photoCount) photoCount.innerText = `(${base64Images.length}/10)`;
                };
                reader.readAsDataURL(file);
            });
            realFileInput.value = "";
        });
    }

    // ===== 모달/토스트 핸들러 =====
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
            close();
            onOk && onOk();
        };

        modalOk.addEventListener("click", okHandler);
        modalCancel.addEventListener("click", close);
    }

    function showToast(text = "완료되었습니다!") {
        if (!toast) return;
        toast.textContent = text;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 1600);
    }

    // ===== 폼 읽기/검증/저장 =====
    function readForm() {
        const title = $("#title")?.value.trim() ?? "";
        const description = $("#description")?.value.trim() ?? "";
        const location = $("#location")?.value.trim() ?? "";
        const active = $(".category-buttons button.active");
        const category = active ? active.textContent.trim() : "";
        const price = 0; 

        // 💡 중요: 첫 번째 사진을 imageUrl 필드에 담아 서버로 전송
        const representativeImage = base64Images.length > 0 ? base64Images[0] : "";
        
        return { 
            title, 
            category, 
            price, 
            location, 
            description, 
            imageUrl: representativeImage // 👈 이 필드가 있어야 app.js에서 읽습니다.
        };
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
    const cancelBtn = $(".btn-cancel");
    const submitBtn = $(".btn-submit");

    if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openConfirm({
                title: "작성 취소",
                message: "작성을 취소하시겠습니까?",
                onOk: () => { window.location.href = "/html/main.html"; },
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
                onOk: async () => {
                    const data = readForm(); // 💡 여기서 imageUrl이 포함됩니다.
                    const err = validateForm(data);
                    if (err) return showToast(err);

                    locking = true;
                    submitBtn.disabled = true;

                    try {
                        await saveItem(data);
                        showToast("물품이 등록되었습니다!");
                        setTimeout(() => { window.location.href = "/html/main.html"; }, 900);
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