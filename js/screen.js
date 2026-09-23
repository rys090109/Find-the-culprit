// 배경 이미지 경로 매핑
const BACKGROUND_MAP = {
    radio: "../assets/image/radio.png",
    apartment: "../assets/image/apartment.png",
    icecream: "../assets/image/icecream.png",
    animal: "../assets/image/animal.png",
    festival: "../assets/image/festival.png"
};

// 열쇠 아이콘 (공통 이미지 3종 재사용)
const KEY_ICON_MAP = {
    key1: "../assets/image/key1.png",
    key2: "../assets/image/key2.png",
    key3: "../assets/image/key3.png"
};

// 용의자 아이콘 매핑 (실제 파일명에 맞게 수정 필요)
const SUSPECT_ICON_MAP = {
    mike: "../assets/image/mike.png",
    teacher: "../assets/image/teacher.png",
    laptop: "../assets/image/laptop.png",
    broomstick: "../assets/image/broomstick.png",
    person_silhouette: "../assets/image/person_silhouette.png",
    guard: "../assets/image/guard.png",
    couple: "../assets/image/couple.png",
    parttimer: "../assets/image/parttimer.png",
    store_owner: "../assets/image/store_owner.png",
    delivery: "../assets/image/delivery.png",
    customer: "../assets/image/customer.png",
    staff_a: "../assets/image/staff_a.png",
    staff_b: "../assets/image/staff_b.png",
    cafe_owner: "../assets/image/cafe_owner.png",
    guest: "../assets/image/guest.png",
    staff: "../assets/image/staff.png",
    village_head: "../assets/image/village_head.png",
    resident: "../assets/image/resident.png",
    host: "../assets/image/host.png"
};

let currentLevel = null;
let selectedSuspectId = null;

// ---------- URL에서 level, title 읽기 ----------
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        level: params.get("level") || "1",
        title: params.get("title") || ""
    };
}

// ---------- 데이터 불러오기 ----------
async function loadLevelByTitle(targetTitle, level) {
    const res = await fetch(`../data/level${level}.json`);
    const dataList = await res.json();

    const found = dataList.find((item) => item.title === targetTitle);

    if (!found) {
        console.log("해당 제목의 사건을 찾을 수 없습니다.");
        return null;
    }

    return found;
}

// ---------- 1단계: 사건 설명 화면 ----------
function renderStoryScene(level) {
    document.getElementById("story-title").textContent = level.title;
    document.getElementById("story-text").textContent = level.story;

    document.getElementById("bg-image").src =
        BACKGROUND_MAP[level.background] || "../assets/image/file.png";

    renderClueMarkers(level.clues);
}

function renderClueMarkers(clues) {
    const container = document.getElementById("clue-markers");
    container.innerHTML = "";

    clues.forEach((clue) => {
        const pos = clue.position || { top: "50%", left: "50%" };

        const btn = document.createElement("button");
        btn.className = "clue-marker";
        btn.style.top = pos.top;
        btn.style.left = pos.left;
        btn.setAttribute("aria-label", clue.label);

        const img = document.createElement("img");
        img.src = KEY_ICON_MAP[clue.id] || "";
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
        img.src = SUSPECT_ICON_MAP[suspect.icon] || "";
        img.alt = suspect.name;

        const label = document.createElement("span");
        label.textContent = suspect.name;

        item.appendChild(img);
        item.appendChild(label);

        item.addEventListener("click", () => {
            document.querySelectorAll(".suspect-item").forEach((el) =>
                el.classList.remove("selected")
            );
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
    showResultPopup(
        isCorrect ? "정답입니다! 사건을 해결했습니다." : "오답입니다. 다시 추리해보세요."
    );
}

function showResultPopup(text) {
    document.getElementById("result-text").textContent = text;
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

// ---------- 초기 실행 ----------
async function init() {
    const { level, title } = getQueryParams();
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

    document.getElementById("clue-close").addEventListener("click", closeCluePopup);
    document.getElementById("result-close").addEventListener("click", closeResultPopup);
}

init();