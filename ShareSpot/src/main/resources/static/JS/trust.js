// src/main/resources/static/JS/trust.js (전체 교체)
// ✅ 판매자(등록자)로서 완료된 거래만 카운트/점수 표시
(function () {
  function clamp(n, min, max) {
    n = Number(n);
    if (!Number.isFinite(n)) n = 0;
    return Math.max(min, Math.min(max, n));
  }

  function gradeByPercent(p) {
    if (p >= 80) return "우수";
    if (p >= 60) return "양호";
    if (p >= 40) return "보통";
    return "주의";
  }

  async function fetchMe() {
    const res = await fetch("/api/user/me", { credentials: "include" });
    if (!res.ok) throw new Error("GET /api/user/me failed: " + res.status);
    return await res.json();
  }

  async function fetchMyTrades() {
    const res = await fetch("/api/trades/my", { credentials: "include" });
    if (!res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  }

  async function main() {
    const percentEl = document.getElementById("trustPercent");
    const gradeEl = document.getElementById("trustGrade");
    const barEl = document.getElementById("trustBarFill");
    const scoreEl = document.getElementById("trustScoreText");

    const cntEl = document.getElementById("completeCount");
    const ptEl = document.getElementById("completePoint");

    if (!percentEl || !gradeEl || !barEl || !scoreEl) return;

    const me = await fetchMe();

    // ===== 상단 점수/퍼센트/게이지 =====
    const score = clamp(me?.trustScore ?? 0, 0, 100);
    const percent = Math.round((score / 100) * 100);

    percentEl.textContent = `${percent}%`;
    gradeEl.textContent = `신뢰 지수 - ${gradeByPercent(percent)}`;
    barEl.style.width = `${percent}%`;
    scoreEl.textContent = `총 ${score}점 / 100점`;

    // ===== 하단 "거래 완료" (판매자만 표시) =====
    if (cntEl && ptEl) {
      const trades = await fetchMyTrades();

      // ✅ 등록자(판매자)로서 COMPLETED 된 것만 카운트
      const completedAsSeller = trades.filter((t) => {
        const st = String(t?.status || "");
        const role = String(t?.myRole || t?.role || ""); // 프로젝트에 따라 myRole/role 둘 다 대응
        return st === "COMPLETED" && role === "SELLER";
      }).length;

      if (completedAsSeller <= 0) {
        // ✅ 구매자는 여기서 0이므로 아예 숨김
        const row =
          cntEl.closest(".activity-item") || cntEl.closest(".activity-row");
        if (row) row.style.display = "none";
      } else {
        const MAX_TRADES_FOR_SCORE = 10;
        const effectiveTrades = Math.min(
          completedAsSeller,
          MAX_TRADES_FOR_SCORE
        );
        const earnedPoints = effectiveTrades * 10;

        // 거래 횟수 표시 (원하면 10회+ 로 바꿀 수 있음)
        cntEl.textContent =
          completedAsSeller > MAX_TRADES_FOR_SCORE
            ? `${MAX_TRADES_FOR_SCORE}회+`
            : `${completedAsSeller}회`;

        ptEl.textContent = `+${earnedPoints}점`;
      }
    }
  }

  main().catch(console.error);
})();
