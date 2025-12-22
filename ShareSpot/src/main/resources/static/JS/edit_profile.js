// [static/JS/edit_profile.js]

// 1. 내 정보 불러오기
async function loadMeForEdit() {
  try {
    const res = await fetch('/api/user/me');
    if (!res.ok) {
      console.error('me api failed:', res.status);
      return;
    }
    const me = await res.json();

    // 텍스트 정보 채우기
    document.getElementById('nicknameInput').value =
      me.nickname || me.userId || '';
    document.getElementById('dongSelect').value = me.dong || '시흥시 정왕동';
    document.getElementById('phoneInput').value = me.phone || '';

    // 이미지 관련 요소
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const profilePreview = document.getElementById('profilePreview');

    // [핵심] 이미 저장된 사진이 있으면 보여주기 (캐시 방지용 시간값 추가)
    if (me.profileImageUrl) {
      avatarPlaceholder.style.display = 'none';
      profilePreview.src = me.profileImageUrl + '?t=' + new Date().getTime();
      profilePreview.style.display = 'block';
    } else {
      // 사진 없으면 이니셜 보여주기
      const initial = me.profileInitial || (me.nickname ? me.nickname[0] : '?');
      avatarPlaceholder.textContent = initial;
      avatarPlaceholder.style.display = 'flex'; // CSS에 맞게 조정
      profilePreview.style.display = 'none';
    }
  } catch (e) {
    console.error('loadMeForEdit error', e);
  }
}

// 2. 저장하기 (이 함수가 하나만 있어야 합니다!)
async function saveProfile() {
  try {
    const nickname = document.getElementById('nicknameInput').value.trim();
    const dong = document.getElementById('dongSelect').value;
    const phone = document.getElementById('phoneInput').value.trim();
    // 파일 입력창에서 파일 가져오기
    const profileFile = document.getElementById('profileInput').files[0];

    if (!nickname) {
      alert('이름(닉네임)을 입력해주세요.');
      return;
    }

    // [중요] JSON이 아니라 FormData로 보내야 파일이 날아갑니다.
    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('dong', dong);
    formData.append('phone', phone);

    // 사진을 선택했을 때만 추가
    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    const res = await fetch('/api/user/me', {
      method: 'PUT',
      credentials: 'include',
      // 주의: Content-Type 헤더를 직접 적으면 안 됩니다! (브라우저가 자동 설정)
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      alert('저장 실패: ' + errorText);
      return;
    }

    alert('수정되었습니다.');
    location.href = 'my.html';
  } catch (e) {
    console.error('saveProfile error', e);
    alert('서버 오류');
  }
}

// 3. 이벤트 연결
document.addEventListener('DOMContentLoaded', () => {
  loadMeForEdit();

  const cameraBtn = document.getElementById('cameraBtn');
  const profileInput = document.getElementById('profileInput');
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  const profilePreview = document.getElementById('profilePreview');

  // 카메라 버튼 누르면 파일 선택창 열기
  cameraBtn.addEventListener('click', () => profileInput.click());

  // 파일 선택하면 미리보기(Preview) 갱신
  profileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPlaceholder.style.display = 'none';
        profilePreview.src = event.target.result;
        profilePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // 저장 버튼 연결
  document.getElementById('saveBtn').addEventListener('click', saveProfile);
});
