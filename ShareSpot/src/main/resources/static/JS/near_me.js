document.addEventListener('DOMContentLoaded', function () {
  // 1. 지도 옵션 설정 (기본 위치: 시흥시 정왕동 근처)
  var mapOptions = {
    center: new naver.maps.LatLng(37.3514, 126.7431), // 기본 좌표
    zoom: 15,
  };

  // 2. 지도 생성 ('map'은 HTML의 div id와 일치해야 함)
  var map = new naver.maps.Map('map', mapOptions);

  // 3. 위치 정보 옵션 (정확도 향상)
  var locationOptions = {
    enableHighAccuracy: true, // 배터리를 더 소모하더라도 GPS 등으로 정확한 위치 요청
    maximumAge: 0, // 캐시된(저장된) 옛날 위치를 사용하지 않고 즉시 새로 조회
    timeout: 10000, // 10초 안에 위치를 못 잡으면 에러 처리 (기존 5초에서 넉넉하게 변경)
  };

  // 4. 현재 내 위치 가져오기
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // 성공 시 실행할 함수
      function (position) {
        var lat = position.coords.latitude; // 위도
        var lng = position.coords.longitude; // 경도

        var myLocation = new naver.maps.LatLng(lat, lng);

        // 지도 중심을 내 위치로 이동
        map.setCenter(myLocation);

        // 내 위치 마커 표시
        new naver.maps.Marker({
          position: myLocation,
          map: map,
          title: '내 위치',
        });
      },
      // 실패 시 실행할 함수
      function (error) {
        console.error('위치 정보를 가져올 수 없습니다.', error);
        // 에러 발생 시 사용자에게 알림 (선택 사항)
        // alert('현재 위치를 가져올 수 없습니다. GPS 설정을 확인해주세요.');
      },
      // 옵션 적용
      locationOptions
    );
  } else {
    // 위치 정보를 지원하지 않거나 차단된 경우
    console.log('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
  }
});
