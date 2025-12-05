(function () {
  const grid = document.getElementById("itemGrid");

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function toCardHTML(p) {
    return `
      <div class="card">
        <img src="https://placehold.co/413x413" class="card-img" alt="상품 이미지" />
        <div class="card-body">
          <div class="card-top">
            <span class="badge-tag">${escapeHTML(p.category)}</span>
            <span class="time-ago">${escapeHTML(p.timeAgo)}</span>
          </div>
          <h3 class="card-title">${escapeHTML(p.title)}</h3>
          <p class="card-price">${escapeHTML(p.price)}</p>
          <div class="card-footer">
            <span>${escapeHTML(p.location)}</span>
            <div class="card-stats">
              <span>💬 ${Number(p.chatCount) || 0}</span>
              <span>❤️ ${Number(p.interestCount) || 0}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    const html = (window.POSTS || []).map(toCardHTML).join("");
    grid.innerHTML = html;
  }

  render();
})();
