const IMAGE_DIR = "../assets/image/";
const DEFAULT_IMAGE = IMAGE_DIR + "file.png";
const AUDIO_DIR = "../assets/audio/";

// ---------- 배경 이미지 매핑 ----------
const BACKGROUND_MAP = {
  radio: "radio.png",
  apartment: "apartment.png",
  icecream: "icecream.png",
  animal: "animal.png",
  festivities: "festivities.png",
  festival: "festivities.png",
  d: "elevator.png",

  workshop: "Workshop.png",
  ticket: "Ticket.png",
  yoga: "Yoga.png",
  flea_market: "Flea_Market.png",
  test: "test.png",
};

// ---------- 용의자 아이콘 매핑 ----------
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
  couple: "teacher.png",
  icecream1: "mike.png",
  icecream2: "teacher.png",
  icecream3: "mike.png",
  icecream4: "teacher.png",
  apartment1: "mike.png",
  apartment2: "teacher.png",
  apartment3: "mike.png",
  apartment4: "teacher.png",
  delivery: "broomstick.png",
  customer: "mike.png",

  // 사건별 별칭
  workshop_t: "Workshop1.png",
  studenta: "Workshop2.png",
  studentb: "Workshop3.png",
  workshop_ceo: "Workshop4.png",
  ticket_designer: "Ticket1.png",
  theater_manager: "Ticket2.png",
  employee: "Ticket3.png",
  theater_actor: "Ticket4.png",
};

// ---------- 게임 진행 상태 ----------
let currentLevel = null;
let levelDataList = [];
let currentScenarioIndex = 0;

let selectedSuspectId = null;
let bgmAudio = null;

let correctCount = 0;
let totalAttempts = 0;
let totalClueCount = 0;
let openedClueIds = new Set();

let shouldMoveNext = false;

let timerInterval = null;

// ---------- 경로 헬퍼 ----------
function getBackgroundPath(bgKey) {
  if (!bgKey) return DEFAULT_IMAGE;
  const value = String(bgKey).trim();
  const mapped = BACKGROUND_MAP[value.toLowerCase()];
  return mapped ? IMAGE_DIR + mapped : `${IMAGE_DIR}${value}.png`;
}

// 용의자 이미지 후보를 우선순위대로 만든다. (앞에서부터 시도하고, 파일이 없으면 다음 후보로 넘어감)
//  1) JSON의 icon 값과 같은 이름의 파일  예) "person_silhouette" -> person_silhouette.png
//  2) 매핑표에 등록된 파일 (대소문자가 다른 파일명, 임시 대체 이미지용)
//  3) id와 같은 이름의 파일, 매핑표
//  4) 마지막으로 기본 이미지
function getSuspectIconCandidates(suspect) {
  const icon = suspect?.icon ? String(suspect.icon).trim() : "";
  const id = suspect?.id ? String(suspect.id).trim() : "";
  const candidates = [];

  if (icon) {
    candidates.push(`${IMAGE_DIR}${icon.replace(/\.png$/i, "")}.png`);
    const mapped = SUSPECT_ICON_MAP[icon.toLowerCase()];
    if (mapped) candidates.push(IMAGE_DIR + mapped);
  }

  if (id) {
    candidates.push(`${IMAGE_DIR}${id.replace(/\.png$/i, "")}.png`);
    const mapped = SUSPECT_ICON_MAP[id.toLowerCase()];
    if (mapped) candidates.push(IMAGE_DIR + mapped);
  }

  candidates.push(IMAGE_DIR + "mike.png");

  return [...new Set(candidates)];
}

// 경로 하나 또는 후보 배열을 받아서, 이미지가 없으면 다음 후보로 넘어감
function setImageWithFallback(imgEl, paths) {
  const list = (Array.isArray(paths) ? paths : [paths]).filter(Boolean);
  let index = 0;

  imgEl.onerror = () => {
    console.warn(`이미지를 찾을 수 없음: ${list[index]}`);
    index += 1;
    if (index < list.length) {
      imgEl.src = list[index];
    } else {
      imgEl.onerror = null; // 무한 반복 방지
      imgEl.src = DEFAULT_IMAGE;
    }
  };
  imgEl.src = list[0] || DEFAULT_IMAGE;
}

// ---------- 실시간 타이머 기능 ----------
function startTimer() {
  let startTime = sessionStorage.getItem("startTime");

  if (!startTime) {
    startTime = Date.now();
    sessionStorage.setItem("startTime", startTime);
  }

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - Number(startTime)) / 1000);

    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
    const seconds = String(elapsedTime % 60).padStart(2, "0");
    const timeString = `${minutes}:${seconds}`;

    // 1단계(story-time)와 2단계(suspect-time) 두 텍스트 영역 모두 업데이트
    const storyTimer = document.getElementById("story-time");
    const suspectTimer = document.getElementById("suspect-time");

    if (storyTimer) storyTimer.innerText = timeString;
    if (suspectTimer) suspectTimer.innerText = timeString;
  }, 1000);
}

// ---------- URL에서 level, title 읽기 ----------
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    level: params.get("level") || "1",
    title: params.get("title") || "",
  };
}

// ---------- 해당 레벨의 모든 사건 불러오기 ----------
async function loadLevelScenarios(targetTitle, level) {
  try {
    const res = await fetch(`../data/level${level}.json`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const dataList = await res.json();

    if (!Array.isArray(dataList) || dataList.length === 0) {
      return [];
    }

    // 룰렛에서 선택된 사건을 첫 번째 문제로 배치
    const selectedScenario = dataList.find(
      (item) => item.title === targetTitle,
    );

    // 나머지 사건은 무작위 순서로 섞기
    const otherScenarios = dataList
      .filter((item) => item.title !== targetTitle)
      .sort(() => Math.random() - 0.5);

    if (selectedScenario) {
      return [selectedScenario, ...otherScenarios];
    }

    return [...dataList].sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("사건 데이터를 불러오지 못했습니다:", error);
    return [];
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

  renderClueMarkers(level.clues);
}

// ---------- 힌트 구역 층을 "화면에 실제로 보이는 이미지"와 똑같은 크기/위치로 맞춤 ----------
// 배경 이미지는 object-fit: cover 로 표시하고, 힌트 구역 층만 이미지가 실제로
// 그려진 영역에 겹쳐 놓음. 그래서 창 크기가 달라져도 구역이 항상 같은 물건 위에 있음.
// (position의 % 값은 "화면"이 아니라 "이미지 자체" 기준)
function layoutClueLayer() {
  const img = document.getElementById("bg-image");
  const layer = document.getElementById("clue-markers");
  if (!img || !layer || !img.naturalWidth) return;

  const area = img.parentElement;
  if (layer.parentElement !== area) area.appendChild(layer);

  const W = area.clientWidth;
  const H = area.clientHeight;
  if (!W || !H) return; // 다른 화면이 켜져 있어서 크기를 잴 수 없을 때

  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  layer.style.position = "absolute";
  layer.style.width = w + "px";
  layer.style.height = h + "px";
  layer.style.left = (W - w) / 2 + "px";
  layer.style.top = (H - h) / 2 + "px";
}

function renderClueMarkers(clues) {
  const container = document.getElementById("clue-markers");
  container.innerHTML = "";

  clues.forEach((clue) => {
    // JSON 내부 position 사용
    const pos = clue.position || {
      top: "50%",
      left: "50%",
      width: "80px",
      height: "80px",
    };

    const btn = document.createElement("button");
    btn.className = "clue-marker";

    // 위치 및 너비/높이 동적 할당
    btn.style.top = pos.top;
    btn.style.left = pos.left;
    btn.style.width = pos.width || "80px";
    btn.style.height = pos.height || "80px";

    // 물건 모양대로 구역을 깎고 싶을 때: position에 "shape": "polygon(...)" 추가
    if (pos.shape) btn.style.clipPath = pos.shape;

    // title 속성을 쓰면 브라우저 기본 말풍선이 떠서 쓰지 않음
    if (clue.label) btn.setAttribute("aria-label", clue.label);

    btn.addEventListener("click", () => {
      // 같은 사건에서 동일한 단서를 여러 번 눌러도 한 번만 계산
      if (!openedClueIds.has(clue.id)) {
        openedClueIds.add(clue.id);
        totalClueCount += 1;
      }

      showCluePopup(clue.text);
    });

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

// ---------- 좌표 측정 도구 ----------
// 사용법: 사건 화면 주소 끝에 &debug=1 을 붙여서 열고,
//        이미지에서 힌트로 쓸 물건 위를 마우스로 드래그해서 사각형을 그리면
//        화면 위쪽에 "position" 값이 나타나고 클립보드에도 복사됩니다.
//        그 값을 JSON의 해당 clue 안에 붙여넣으면 끝.
function enableClueDebug() {
  const stage = document.getElementById("clue-markers");
  const area = document.querySelector(".scene-bg");

  const box = document.createElement("div");
  box.style.cssText =
    "position:absolute;border:2px dashed #00e5ff;background:rgba(0,229,255,.25);" +
    "pointer-events:none;z-index:999;display:none";
  stage.appendChild(box);

  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;" +
    "background:#000;color:#0ff;font:13px/1.5 monospace;padding:8px 14px;" +
    "border-radius:8px;max-width:92vw;user-select:text;";
  panel.textContent = "좌표 측정 모드: 물건 위를 드래그해 보세요";
  document.body.appendChild(panel);

  let startX = 0,
    startY = 0,
    drawing = false,
    moved = false;

  const pointIn = (e) => {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  area.addEventListener(
    "mousedown",
    (e) => {
      if (e.target.closest(".arrow-btn, .story-box")) return;
      e.preventDefault();
      const p = pointIn(e);
      startX = p.x;
      startY = p.y;
      drawing = true;
      moved = false;
      box.style.display = "block";
      box.style.left = startX + "px";
      box.style.top = startY + "px";
      box.style.width = "0px";
      box.style.height = "0px";
    },
    true,
  );

  window.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    moved = true;
    const p = pointIn(e);
    box.style.left = Math.min(startX, p.x) + "px";
    box.style.top = Math.min(startY, p.y) + "px";
    box.style.width = Math.abs(p.x - startX) + "px";
    box.style.height = Math.abs(p.y - startY) + "px";
  });

  window.addEventListener("mouseup", () => {
    if (!drawing) return;
    drawing = false;
    if (!moved) return;

    const r = stage.getBoundingClientRect();
    const pct = (v, total) => ((v / total) * 100).toFixed(1) + "%";
    const text =
      `"position": { "top": "${pct(parseFloat(box.style.top), r.height)}", ` +
      `"left": "${pct(parseFloat(box.style.left), r.width)}", ` +
      `"width": "${pct(parseFloat(box.style.width), r.width)}", ` +
      `"height": "${pct(parseFloat(box.style.height), r.height)}" }`;

    panel.textContent = text;
    console.log(text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  });

  // 드래그 직후 힌트 팝업이 열리지 않게 막기
  area.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    },
    true,
  );
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
    setImageWithFallback(img, getSuspectIconCandidates(suspect));

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
    shouldMoveNext = false;
    showResultPopup("범인을 먼저 선택해주세요.", "확인");
    return;
  }

  // 정답 확인 버튼을 누를 때마다 시도 횟수 증가
  totalAttempts += 1;

  const isCorrect = selectedSuspectId === level.answer;

  if (isCorrect) {
    correctCount += 1;
    shouldMoveNext = true;

    let message = "정답입니다! 사건을 해결했습니다.";

    if (level.explanation) {
      message += `\n\n${level.explanation}`;
    }

    const isLastScenario = currentScenarioIndex === levelDataList.length - 1;

    showResultPopup(message, isLastScenario ? "결과 보기" : "다음 사건");
  } else {
    shouldMoveNext = false;
    showResultPopup(
      "오답입니다. 단서를 다시 확인하고 추리해보세요.",
      "다시 추리하기",
    );
  }
}

function showResultPopup(text, buttonText = "확인") {
  const resultText = document.getElementById("result-text");
  const resultClose = document.getElementById("result-close");

  resultText.textContent = text;
  resultText.style.whiteSpace = "pre-line";
  resultClose.textContent = buttonText;

  document.getElementById("result-popup").classList.remove("hidden");
}

function closeResultPopup() {
  document.getElementById("result-popup").classList.add("hidden");

  if (!shouldMoveNext) {
    return;
  }

  shouldMoveNext = false;
  moveToNextScenario();
}

// ---------- 현재 사건 표시 ----------
function showCurrentScenario() {
  currentLevel = levelDataList[currentScenarioIndex];
  selectedSuspectId = null;
  openedClueIds = new Set();

  renderStoryScene(currentLevel);

  document
    .querySelectorAll(".suspect-item")
    .forEach((item) => item.classList.remove("selected"));
}

// ---------- 다음 사건으로 이동 ----------
function moveToNextScenario() {
  const isLastScenario = currentScenarioIndex >= levelDataList.length - 1;

  if (isLastScenario) {
    finishLevel();
    return;
  }

  currentScenarioIndex += 1;
  showCurrentScenario();

  switchScene("scene-suspects", "scene-story");
}

// ---------- 레벨 완료 ----------
function finishLevel() {
  const { level } = getQueryParams();

  // 게임 시작부터 레벨 완료까지 걸린 시간(초)
  const startTime = Number(sessionStorage.getItem("startTime"));
  const clearTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

  // 타이머 종료 및 초기화
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  sessionStorage.removeItem("startTime");

  const gameResult = {
    level: Number(level),
    correctCount,
    totalCount: totalAttempts,
    clueCount: totalClueCount,
    caseCount: levelDataList.length,
    clearTime,
  };

  localStorage.setItem("gameResult", JSON.stringify(gameResult));

  if (bgmAudio) {
    bgmAudio.pause();
  }

  location.href = "./result.html";
}

// ---------- 화면 전환 ----------
function switchScene(fromId, toId) {
  document.getElementById(fromId).classList.remove("active");
  document.getElementById(toId).classList.add("active");

  // 숨겨져 있던 사건 화면이 다시 보일 때 힌트 구역 층 크기를 다시 계산
  layoutClueLayer();
}

// ---------- 레벨별 배경음악 ----------
function initBgm(level) {
  const bgmButton = document.getElementById("bgm-toggle");
  if (!bgmButton) return;

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

  levelDataList = await loadLevelScenarios(title, level);

  if (levelDataList.length === 0) {
    alert("사건 데이터를 불러오지 못했습니다.");
    return;
  }

  currentScenarioIndex = 0;
  correctCount = 0;
  totalAttempts = 0;
  totalClueCount = 0;

  // 이미지가 로드되거나 창 크기가 바뀔 때마다 힌트 구역 층을 이미지에 다시 맞춤
  document.getElementById("bg-image").addEventListener("load", layoutClueLayer);
  window.addEventListener("resize", layoutClueLayer);

  startTimer();
  showCurrentScenario();
  layoutClueLayer(); // 이미 캐시된 이미지일 때 대비

  // 주소 끝에 &debug=1 이 있으면 좌표 측정 도구 켜기
  if (new URLSearchParams(location.search).get("debug") === "1") {
    enableClueDebug();
  }

  document.getElementById("next-btn").addEventListener("click", () => {
    renderSuspectScene(currentLevel);
    switchScene("scene-story", "scene-suspects");
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    switchScene("scene-suspects", "scene-story");
    layoutClueLayer();
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