const rankingList = document.getElementById("ranking-list");
const levelButtons = document.querySelectorAll(".level-btn");

const queryParams = new URLSearchParams(location.search);
let selectedLevel = Number(queryParams.get("level")) || 1;

function createRankingItem(ranking, currentUserId) {
  const item = document.createElement("div");

  item.className = `ranking-item rank-${ranking.rank}`;

  if (ranking.user_id === currentUserId) {
    item.classList.add("current-user");
  }

  const rank = document.createElement("span");
  rank.className = "rank-number";

  if (ranking.rank === 1) {
    rank.textContent = "🥇";
  } else if (ranking.rank === 2) {
    rank.textContent = "🥈";
  } else if (ranking.rank === 3) {
    rank.textContent = "🥉";
  } else {
    rank.textContent = ranking.rank;
  }

  const nickname = document.createElement("span");
  nickname.className = "nickname";
  nickname.textContent = ranking.nickname || "익명";

  const score = document.createElement("span");
  score.className = "score";
  score.textContent = `${Number(ranking.score).toLocaleString()}점`;

  const accuracy = document.createElement("span");
  accuracy.textContent = `${Number(ranking.accuracy)}%`;

  const clueCount = document.createElement("span");
  clueCount.textContent = `${Number(ranking.clue_count)}개`;

  item.append(rank, nickname, score, accuracy, clueCount);

  return item;
}

async function loadRankings(level) {
  rankingList.innerHTML =
    '<p class="status-message">랭킹을 불러오고 있습니다.</p>';

  levelButtons.forEach((button) => {
    const buttonLevel = Number(button.dataset.level);
    button.classList.toggle("active", buttonLevel === level);
  });

  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const rankings = await getRankings(level);

    rankingList.innerHTML = "";

    if (rankings.length === 0) {
      rankingList.innerHTML =
        '<p class="status-message">아직 등록된 랭킹이 없습니다.</p>';
      return;
    }

    rankings.forEach((ranking) => {
      rankingList.appendChild(createRankingItem(ranking, user?.id));
    });
  } catch (error) {
    console.error("랭킹 조회 실패:", error);

    rankingList.innerHTML =
      '<p class="status-message">랭킹을 불러오지 못했습니다.</p>';
  }
}

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedLevel = Number(button.dataset.level);

    const newUrl = new URL(location.href);
    newUrl.searchParams.set("level", selectedLevel);
    history.replaceState(null, "", newUrl);

    loadRankings(selectedLevel);
  });
});

document.getElementById("back-btn").addEventListener("click", () => {
  location.href = "./difficulty_level.html";
});

document.addEventListener("DOMContentLoaded", () => {
  loadRankings(selectedLevel);
});
