document.addEventListener('DOMContentLoaded', () => {
  console.log('[upload] JS loaded');

  // ===== 1. 사진 등록 기능 =====
  const photoBox = document.getElementById('photoBox');
  const fileInput = document.getElementById('fileInput');
  const photoCount = document.getElementById('photoCount');

  if (photoBox && fileInput) {
    photoBox.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        photoCount.textContent = '(1/1)';
        showToast('사진이 선택되었습니다.');
      } else {
        photoCount.textContent = '(0/1)';
      }
    });
  }

  // ===== 2. 카테고리 버튼 토글 (대여 가격 표시 로직 포함) =====
  const categoryButtons = document.querySelectorAll('.category-buttons button');
  const priceSection = document.getElementById('price-section');
  const priceInput = document.getElementById('price');

  categoryButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // 1) 모든 버튼 비활성화
      categoryButtons.forEach((b) => b.classList.remove('active'));
      // 2) 클릭한 버튼 활성화
      btn.classList.add('active');

      // 3) '대여'인지 확인하여 가격창 보이기/숨기기
      if (btn.innerText.trim() === '대여') {
        priceSection.classList.remove('hidden');
        priceInput.focus();
      } else {
        priceSection.classList.add('hidden');
        priceInput.value = ''; // 다른거 누르면 가격 초기화
      }
    })
  );

  // ===== 3. 모달/토스트 핸들러 =====
  const $ = (s) => document.querySelector(s);
  const modal = $('#confirmModal');
  const modalTitle = $('#modalTitle');
  const modalMessage = $('#modalMessage');
  const modalCancel = $('#modalCancel');
  const modalOk = $('#modalOk');
  const toast = $('#toast');

  function openConfirm({
    title,
    message,
    okText = '확인',
    cancelText = '취소',
    onOk,
  }) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalOk.textContent = okText;
    modalCancel.textContent = cancelText;
    modal.classList.add('show');

    const close = () => modal.classList.remove('show');
    const okHandler = () => {
      modalOk.removeEventListener('click', okHandler);
      modalCancel.removeEventListener('click', close);
      close();
      onOk && onOk();
    };
    modalOk.addEventListener('click', okHandler);
    modalCancel.addEventListener('click', close);
  }

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }

  // ===== 4. 폼 데이터 읽기 & 전송 =====
  const cancelBtn = document.querySelector('.btn-cancel');
  const submitBtn = document.querySelector('.btn-submit');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      openConfirm({
        title: '작성 취소',
        message: '작성을 취소하시겠습니까?',
        onOk: () => (location.href = '/html/main.html'),
      });
    });
  }

  if (submitBtn) {
    let locking = false;
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (locking) return;

      // -- 데이터 읽기 --
      const title = document.querySelector('#title').value.trim();
      const desc = document.querySelector('#description').value.trim();
      const loc = document.querySelector('#location').value;

      // 활성화된 카테고리 찾기
      const activeBtn = document.querySelector(
        '.category-buttons button.active'
      );
      const category = activeBtn ? activeBtn.innerText.trim() : '나눔';

      // 가격 처리: 대여일 때만 값 읽음 (나머지는 0)
      let price = 0;
      if (category === '대여') {
        const val = document.querySelector('#price').value.trim();
        price = val ? parseInt(val, 10) : 0;
      }

      // -- 유효성 검사 --
      if (!title) return showToast('제목을 입력하세요.');
      if (category === '대여' && price <= 0)
        return showToast('대여 가격을 올바르게 입력하세요.');
      if (!desc) return showToast('설명을 입력하세요.');

      // -- 전송 확인 --
      openConfirm({
        title: '등록 확인',
        message: '입력한 내용으로 물품을 등록하시겠습니까?',
        onOk: async () => {
          locking = true;
          submitBtn.disabled = true;

          try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category);
            formData.append('price', price);
            formData.append('location', loc);
            formData.append('description', desc);

            if (fileInput.files.length > 0) {
              formData.append('imageFile', fileInput.files[0]);
            }

            const res = await fetch('/api/items', {
              method: 'POST',
              body: formData, // Content-Type은 브라우저가 자동 설정
            });

            if (res.ok) {
              showToast('물품이 등록되었습니다!');
              setTimeout(() => {
                window.location.href = '/html/main.html';
              }, 900);
            } else {
              const errTxt = await res.text();
              throw new Error(errTxt || '등록 실패');
            }
          } catch (err) {
            console.error(err);
            showToast('오류가 발생했습니다: ' + err.message);
            locking = false;
            submitBtn.disabled = false;
          }
        },
      });
    });
  }
});
