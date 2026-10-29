function getDetectiveType(accuracy, averageClues) {
  if (accuracy >= 90 && averageClues <= 2) {
    return {
      english: "MASTER DETECTIVE",
      name: "천재 명탐정",
      description:
        "높은 정확도와 뛰어난 관찰력을 갖춘 최고의 탐정이에요. 작은 단서만으로도 사건의 핵심을 빠르게 파악합니다.",
    };
  }

  if (accuracy >= 80) {
    return {
      english: "CAREFUL ANALYST",
      name: "신중한 분석가",
      description:
        "여러 단서를 꼼꼼히 확인해 두려움 없이 범인을 찾아내는 타입이에요. 속도보다 정확도를 우선시하는 당신, 놓치는 단서가 없어요.",
    };
  }

  if (accuracy >= 60) {
    return {
      english: "PERSISTENT INVESTIGATOR",
      name: "집요한 수사관",
      description:
        "끝까지 포기하지 않고 사건을 해결하는 탐정이에요. 경험이 쌓일수록 더욱 날카로운 추리력을 발휘할 수 있어요.",
    };
  }

  return {
    english: "ROOKIE DETECTIVE",
    name: "성장하는 탐정",
    description:
      "이제 막 추리의 세계에 들어온 탐정이에요. 사건을 다시 살펴보며 단서를 활용하면 더욱 훌륭한 탐정으로 성장할 수 있어요.",
  };
}

async function initResultPage() {
  const savedResult = localStorage.getItem("gameResult");

  if (!savedResult) {
    alert("게임 결과를 찾을 수 없습니다.");
    location.href = "./difficulty_level.html";
    return;
  }

  const result = JSON.parse(savedResult);

  const { level, correctCount, totalCount, clueCount, caseCount } = result;

  const accuracy =
    totalCount > 0 ? Number(((correctCount / totalCount) * 100).toFixed(1)) : 0;

  const averageClues =
    caseCount > 0 ? Number((clueCount / caseCount).toFixed(1)) : 0;

  const score = calculateRankingScore(correctCount, clueCount);
  const detectiveType = getDetectiveType(accuracy, averageClues);

  document.getElementById("type-english").textContent = detectiveType.english;

  document.getElementById("detective-type").textContent = detectiveType.name;

  document.getElementById("type-description").textContent =
    detectiveType.description;

  document.getElementById("average-clues").textContent = `${averageClues}개`;

  document.getElementById("accuracy").textContent = `${accuracy}%`;

  document.getElementById("final-score").textContent =
    `${score.toLocaleString()}점`;

  const saveMessage = document.getElementById("save-message");

  try {
    const saveResult = await saveRanking({
      level,
      correctCount,
      totalCount,
      clueCount,
    });

    saveMessage.textContent = saveResult.message;
  } catch (error) {
    console.error("랭킹 저장 실패:", error);
    saveMessage.textContent =
      "결과를 저장하지 못했습니다. 로그인 상태를 확인해주세요.";
  }

  document.getElementById("confirm-btn").addEventListener("click", () => {
    location.href = "./difficulty_level.html";
  });

  document.getElementById("ranking-btn").addEventListener("click", () => {
    location.href = `./ranking.html?level=${level}`;
  });
}

document.addEventListener("DOMContentLoaded", initResultPage);
