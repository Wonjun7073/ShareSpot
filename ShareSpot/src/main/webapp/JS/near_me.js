/* near_me.js - 내 근처 페이지 전용 스크립트 */

// 문서가 로드된 후 실행되도록 설정 (안전성 확보)
document.addEventListener('DOMContentLoaded', function () {
  // 1. 지도 옵션 설정 (기본 위치: 시흥시 정왕동 근처)
  var mapOptions = {
    center: new naver.maps.LatLng(37.3514, 126.7431), // 기본 좌표
    zoom: 15,
  };

  // 2. 지도 생성 ('map'은 HTML의 div id와 일치해야 함)
  var map = new naver.maps.Map('map', mapOptions);

  // 3. 현재 내 위치 가져오기 (브라우저 기능)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude; // 위도
        var lng = position.coords.longitude; // 경도

        var myLocation = new naver.maps.LatLng(lat, lng);

        // 지도 중심을 내 위치로 이동
        map.setCenter(myLocation);

        // 내 위치 마커 표시
        var marker = new naver.maps.Marker({
          position: myLocation,
          map: map,
          title: '내 위치',
        });
      },
      function (error) {
        console.error('위치 정보를 가져올 수 없습니다.', error);
      }
    );
  } else {
    // 위치 정보를 지원하지 않거나 차단된 경우
    console.log('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
  }
});
