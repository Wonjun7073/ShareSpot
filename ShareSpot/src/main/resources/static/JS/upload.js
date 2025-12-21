document.addEventListener('DOMContentLoaded', () => {
  console.log('[upload] JS loaded');

  // 1. 사진 등록 핸들러
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

  // 2. 카테고리 & 가격 토글
  const categoryButtons = document.querySelectorAll('.category-buttons button');
  const priceSection = document.getElementById('price-section');
  const priceInput = document.getElementById('price');

  categoryButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      categoryButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (btn.innerText.trim() === '대여') {
        priceSection.classList.remove('hidden');
        priceInput.focus();
      } else {
        priceSection.classList.add('hidden');
        priceInput.value = '';
      }
    })
  );

  // 3. 모달 & 토스트
  const $ = (s) => document.querySelector(s);
  const modal = $('#confirmModal');
  const toast = $('#toast');

  function openConfirm({ title, message, onOk }) {
    $('#modalTitle').textContent = title;
    $('#modalMessage').textContent = message;
    modal.classList.add('show');

    const close = () => modal.classList.remove('show');
    $('#modalOk').onclick = () => {
      close();
      onOk && onOk();
    };
    $('#modalCancel').onclick = close;
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }

  // 4. 전송 로직 (FormData 사용)
  const submitBtn = document.querySelector('.btn-submit');
  const cancelBtn = document.querySelector('.btn-cancel');

  if (cancelBtn) {
    cancelBtn.addEventListener(
      'click',
      () => (location.href = '/html/main.html')
    );
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const title = $('#title').value.trim();
      const desc = $('#description').value.trim();
      const loc = $('#location').value;
      const category = $('.category-buttons button.active').innerText.trim();

      let price = 0;
      if (category === '대여') {
        price = parseInt($('#price').value.trim()) || 0;
      }

      if (!title) return showToast('제목을 입력하세요.');
      if (category === '대여' && price <= 0)
        return showToast('가격을 입력하세요.');
      if (!desc) return showToast('설명을 입력하세요.');

      openConfirm({
        title: '등록',
        message: '물품을 등록하시겠습니까?',
        onOk: async () => {
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
              body: formData,
            });

            if (res.ok) {
              showToast('등록 성공!');
              setTimeout(() => (location.href = '/html/main.html'), 900);
            } else {
              throw new Error(await res.text());
            }
          } catch (err) {
            console.error(err);
            showToast('등록 실패: ' + err.message);
            submitBtn.disabled = false;
          }
        },
      });
    });
  }
});
