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

    // [변경] phoneInput 삭제, introduction 값 불러오기
    document.getElementById('introduction').value = me.introduction || '';

    // 이미지 관련 요소
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const profilePreview = document.getElementById('profilePreview');

    if (me.profileImageUrl) {
      avatarPlaceholder.style.display = 'none';
      profilePreview.src = me.profileImageUrl + '?t=' + new Date().getTime();
      profilePreview.style.display = 'block';
    } else {
      const initial = me.profileInitial || (me.nickname ? me.nickname[0] : '?');
      avatarPlaceholder.textContent = initial;
      avatarPlaceholder.style.display = 'flex';
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
    // [변경] phone 가져오기 삭제

    // [추가] 자기소개 가져오기
    const introduction = document.getElementById('introduction').value;

    const profileFile = document.getElementById('profileInput').files[0];

    if (!nickname) {
      alert('이름(닉네임)을 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('dong', dong);

    // [변경] phone append 삭제, introduction append 추가
    formData.append('introduction', introduction);

    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    const res = await fetch('/api/user/me', {
      method: 'PUT',
      credentials: 'include',
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
