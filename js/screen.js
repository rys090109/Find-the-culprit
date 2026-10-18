const IMAGE_DIR = "../assets/image/";
const DEFAULT_IMAGE = IMAGE_DIR + "file.png";
const AUDIO_DIR = "../assets/audio/";

// ---------- 배경 이미지 매핑 ----------
// 키는 소문자, 값은 assets/image 안의 "실제 파일명" (대소문자 정확히)
const BACKGROUND_MAP = {
  radio: "radio.png",
  apartment: "apartment.png",
  icecream: "icecream.png",
  animal: "animal.png",
  festival: "festivities.png",

  workshop: "Workshop.png",
  ticket: "Ticket.png",
  yoga: "Yoga.png",
  flea_market: "Flea_Market.png",
  test: "test.png",
};

// ---------- 열쇠 아이콘 (공통 이미지 3종 재사용) ----------
const KEY_ICON_MAP = {
  key1: IMAGE_DIR + "key1.png",
  key2: IMAGE_DIR + "key2.png",
  key3: IMAGE_DIR + "key3.png",
};

// ---------- 용의자 아이콘 매핑 ----------
// 키: JSON의 suspects[].id 또는 suspects[].icon 값 (소문자로 적기)
const SUSPECT_ICON_MAP = {
  // level1 suspects[].id
  broadcast_member: "mike.png",
  teacher: "teacher.png",
  manager: "Laptop.png",
  cleaner: "broomstick.png",
  bike_neighbor: "mike.png",
  janitor: "broomstick.png",
  guard: "teacher.png",
  neighbor: "teacher.png",
  parttimer: "mike.png",
  store_owner: "teacher.png",
  delivery_man: "broomstick.png",
  regular_customer: "mike.png",
  staff_a: "mike.png",
  staff_b: "teacher.png",
  cafe_owner: "teacher.png",
  guest: "mike.png",
  staff: "teacher.png",
  village_head: "teacher.png",
  resident: "mike.png",
  host: "teacher.png",

  // level2 suspects[].id
  workshop1: "Workshop1.png",
  workshop2: "Workshop2.png",
  workshop3: "Workshop3.png",
  workshop4: "Workshop4.png",
  ticket1: "Ticket1.png",
  ticket2: "Ticket2.png",
  ticket3: "Ticket3.png",
  ticket4: "Ticket4.png",
  ticket5: "Ticket5.png",
  yoga1: "Yoga1.png",
  yoga2: "Yoga2.png",
  yoga3: "Yoga3.png",
  yoga4: "Yoga4.png",
  flea_market1: "Flea_Market1.png",
  flea_market2: "Flea_Market2.png",
  flea_market3: "Flea_Market3.png",
  flea_market4: "Flea_Market4.png",
  test1: "test1.png",
  test2: "test2.png",
  test3: "test3.png",
  test4: "test4.png",

  // 기존 icon 값 호환
  mike: "mike.png",
  laptop: "Laptop.png",
  broomstick: "broomstick.png",
  person_silhouette: "mike.png",
  guard: "teacher.png",
  couple: "teacher.png",
  parttimer: "mike.png",
  store_owner: "teacher.png",
  delivery: "broomstick.png",
  customer: "mike.png",
  staff_a: "mike.png",
  staff_b: "teacher.png",
  cafe_owner: "teacher.png",
  guest: "mike.png",
  staff: "teacher.png",
  village_head: "teacher.png",
  resident: "mike.png",
  host: "teacher.png",

  // 공방 사건 (JSON icon 값 → 실제 파일)
  workshop_t: "Workshop1.png",
  studenta: "Workshop2.png",
  studentb: "Workshop3.png",
  workshop_ceo: "Workshop4.png",

  // 티켓 위조 사건
  ticket_designer: "Ticket1.png",
  theater_manager: "Ticket2.png",
  employee: "Ticket3.png",
  theater_actor: "Ticket4.png",
  // 주의: 위의 staff(기존 사건)와 키가 겹치므로 티켓 사건 JSON의 icon 값은 "Ticket5"로 쓰는 걸 추천
  ticket5: "Ticket5.png",

  // 요가 매트 사건
  yoga1: "Yoga1.png",
  yoga2: "Yoga2.png",
  yoga3: "Yoga3.png",
  yoga4: "Yoga4.png",

  // 플리마켓 사건
  flea_market1: "Flea_Market1.png",
  flea_market2: "Flea_Market2.png",
  flea_market3: "Flea_Market3.png",
  flea_market4: "Flea_Market4.png",

  // 시험지 유출 사건
  test1: "test1.png",
  test2: "test2.png",
  test3: "test3.png",
  test4: "test4.png",
};

// ---------- 열쇠 위치 (JSON에 clue.position이 없을 때 쓰는 기본값) ----------
// 배경 이미지 기준 % 좌표. JSON에 position을 직접 넣으면 그쪽이 우선됨.
const CLUE_POSITION_MAP = {
  workshop: {
    key1: { top: "39%", left: "15%" },
    key2: { top: "31%", left: "55%" },
    key3: { top: "51%", left: "78%" },
  },
  ticket: {
    key1: { top: "29%", left: "12%" },
    key2: { top: "28%", left: "65%" },
    key3: { top: "52%", left: "80%" },
  },
  yoga: {
    key1: { top: "41%", left: "26%" },
    key2: { top: "31%", left: "59%" },
    key3: { top: "54%", left: "77%" },
  },
  flea_market: {
    key1: { top: "41%", left: "26%" },
    key2: { top: "31%", left: "59%" },
    key3: { top: "54%", left: "77%" },
  },
  test: {
    key1: { top: "30%", left: "13%" },
    key2: { top: "29%", left: "65%" },
    key3: { top: "53%", left: "78%" },
  },
};

let currentLevel = null;
let selectedSuspectId = null;
let bgmAudio = null;

// ---------- 경로 헬퍼 ----------
function getBackgroundPath(bgKey) {
  if (!bgKey) return DEFAULT_IMAGE;
  const mapped = BACKGROUND_MAP[String(bgKey).toLowerCase()];
  return mapped ? IMAGE_DIR + mapped : `${IMAGE_DIR}${bgKey}.png`;
}

function getSuspectIconPath(suspect) {
  const suspectKey = suspect?.id || suspect?.icon;
  if (!suspectKey) return IMAGE_DIR + "mike.png";

  const mapped = SUSPECT_ICON_MAP[String(suspectKey).toLowerCase()];
  return mapped ? IMAGE_DIR + mapped : IMAGE_DIR + "mike.png";
}

function getCluePosition(clue, bgKey) {
  if (clue.position) return clue.position;

  const bgPositions = CLUE_POSITION_MAP[String(bgKey).toLowerCase()];
  if (bgPositions && bgPositions[clue.id]) return bgPositions[clue.id];

  return { top: "50%", left: "50%" };
}

// 이미지가 깨지면 기본 이미지로 교체
function setImageWithFallback(imgEl, path) {
  imgEl.onerror = () => {
    console.warn(`이미지를 찾을 수 없음: ${path}`);
    imgEl.onerror = null; // 무한 반복 방지
    imgEl.src = DEFAULT_IMAGE;
  };
  imgEl.src = path;
}

// ---------- URL에서 level, title 읽기 ----------
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    level: params.get("level") || "1",
    title: params.get("title") || "",
  };
}

// ---------- 데이터 불러오기 ----------
async function loadLevelByTitle(targetTitle, level) {
  try {
    const res = await fetch(`../data/level${level}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const dataList = await res.json();
    const found = dataList.find((item) => item.title === targetTitle);

    if (!found) {
      console.log("해당 제목의 사건을 찾을 수 없습니다.");
      return null;
    }
    return found;
  } catch (err) {
    console.error("사건 데이터를 불러오지 못했습니다:", err);
    return null;
  }
}

// ---------- 1단계: 사건 설명 화면 ----------
function renderStoryScene(level) {
  document.getElementById("story-title").textContent = level.title;
  document.getElementById("story-text").textContent = level.story;

  setImageWithFallback(
    document.getElementById("bg-image"),
    getBackgroundPath(level.background),
  );

  renderClueMarkers(level.clues, level.background);
}

function renderClueMarkers(clues, bgKey) {
  const container = document.getElementById("clue-markers");
  container.innerHTML = "";

  clues.forEach((clue) => {
    // 열쇠 아이콘이 없는 clue(예: key4)는 화면에 표시할 수 없으므로 건너뜀
    if (!KEY_ICON_MAP[clue.id]) {
      console.warn(`열쇠 아이콘이 없는 clue 건너뜀: ${clue.id}`);
      return;
    }

    const pos = getCluePosition(clue, bgKey);

    const btn = document.createElement("button");
    btn.className = "clue-marker";
    btn.style.top = pos.top;
    btn.style.left = pos.left;
    btn.setAttribute("aria-label", clue.label);

    const img = document.createElement("img");
    img.src = KEY_ICON_MAP[clue.id];
    img.alt = clue.label;

    btn.appendChild(img);
    btn.addEventListener("click", () => showCluePopup(clue.text));

    container.appendChild(btn);
  });
}

function showCluePopup(text) {
  document.getElementById("clue-text").textContent = text;
  document.getElementById("clue-popup").classList.remove("hidden");
}

function closeCluePopup() {
  document.getElementById("clue-popup").classList.add("hidden");
}

// ---------- 2단계: 범인 선택 화면 ----------
function renderSuspectScene(level) {
  selectedSuspectId = null;

  const grid = document.getElementById("suspect-grid");
  grid.innerHTML = "";

  level.suspects.forEach((suspect) => {
    const item = document.createElement("button");
    item.className = "suspect-item";
    item.dataset.id = suspect.id;

    const img = document.createElement("img");
    img.alt = suspect.name;
    setImageWithFallback(img, getSuspectIconPath(suspect));

    const label = document.createElement("span");
    label.textContent = suspect.name;

    item.appendChild(img);
    item.appendChild(label);

    item.addEventListener("click", () => {
      document
        .querySelectorAll(".suspect-item")
        .forEach((el) => el.classList.remove("selected"));
      item.classList.add("selected");
      selectedSuspectId = suspect.id;
    });

    grid.appendChild(item);
  });
}

function checkAnswer(level) {
  if (!selectedSuspectId) {
    showResultPopup("범인을 먼저 선택해주세요.");
    return;
  }

  const isCorrect = selectedSuspectId === level.answer;

  if (isCorrect) {
    let message = "정답입니다! 사건을 해결했습니다.";
    if (level.explanation) message += `\n\n${level.explanation}`;
    showResultPopup(message);
  } else {
    showResultPopup("오답입니다. 다시 추리해보세요.");
  }
}

function showResultPopup(text) {
  const el = document.getElementById("result-text");
  el.textContent = text;
  el.style.whiteSpace = "pre-line"; // 줄바꿈(\n) 표시
  document.getElementById("result-popup").classList.remove("hidden");
}

function closeResultPopup() {
  document.getElementById("result-popup").classList.add("hidden");
}

// ---------- 화면 전환 ----------
function switchScene(fromId, toId) {
  document.getElementById(fromId).classList.remove("active");
  document.getElementById(toId).classList.add("active");
}
// ---------- 레벨별 배경음악 ----------
function initBgm(level) {
  const bgmButton = document.getElementById("bgm-toggle");

  // level이 1~5가 아니면 기본적으로 1단계 음악 사용
  const validLevels = ["1", "2", "3", "4", "5"];
  const selectedBgmLevel = validLevels.includes(String(level))
    ? String(level)
    : "1";

  bgmAudio = new Audio(`${AUDIO_DIR}level${selectedBgmLevel}.mp3`);

  bgmAudio.loop = true;
  bgmAudio.volume = 0.25;

  // 이전에 사용자가 음악을 껐다면 꺼진 상태 유지
  const bgmEnabled = localStorage.getItem("bgmEnabled") !== "false";

  function updateBgmButton() {
    if (bgmAudio.paused) {
      bgmButton.textContent = "🔇";
      bgmButton.setAttribute("aria-label", "배경음악 켜기");
    } else {
      bgmButton.textContent = "🔊";
      bgmButton.setAttribute("aria-label", "배경음악 끄기");
    }
  }

  if (bgmEnabled) {
    bgmAudio
      .play()
      .then(updateBgmButton)
      .catch(() => {
        // 브라우저가 자동 재생을 막으면 사용자가 버튼을 눌러야 재생됨
        updateBgmButton();
      });
  }

  bgmButton.addEventListener("click", async () => {
    if (bgmAudio.paused) {
      try {
        await bgmAudio.play();
        localStorage.setItem("bgmEnabled", "true");
      } catch (error) {
        console.error("배경음악을 재생할 수 없습니다:", error);
      }
    } else {
      bgmAudio.pause();
      localStorage.setItem("bgmEnabled", "false");
    }

    updateBgmButton();
  });

  updateBgmButton();
}

// ---------- 초기 실행 ----------
async function init() {
  const { level, title } = getQueryParams();

  initBgm(level);
  const levelData = await loadLevelByTitle(title, level);

  if (!levelData) {
    console.log("사건 데이터를 불러오지 못했습니다.");
    return;
  }

  currentLevel = levelData;
  renderStoryScene(levelData);

  document.getElementById("next-btn").addEventListener("click", () => {
    renderSuspectScene(currentLevel);
    switchScene("scene-story", "scene-suspects");
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    switchScene("scene-suspects", "scene-story");
  });

  document.getElementById("check-btn").addEventListener("click", () => {
    checkAnswer(currentLevel);
  });

  document
    .getElementById("clue-close")
    .addEventListener("click", closeCluePopup);
  document
    .getElementById("result-close")
    .addEventListener("click", closeResultPopup);
}

init();
