let selectedLevel = null;

const IMAGE_DIR = "../assets/image/";
const DEFAULT_IMAGE = IMAGE_DIR + "file.png";

// ---------- 폴더(난이도) 선택 ----------
function initFolderSelection() {
    const items = document.querySelectorAll(".difficulty-item");
    items.forEach((item) => {
        item.addEventListener("click", () => {
            items.forEach((el) => el.classList.remove("selected"));
            item.classList.add("selected");
            selectedLevel = parseInt(item.dataset.level, 10);
        });
    });
}

// ---------- 배경 이미지 경로 ----------
// 키는 전부 소문자로 적는다. (JSON의 background 값은 대소문자 상관없이 매칭됨)
// 값은 assets/image 안의 "실제 파일명"과 대소문자까지 똑같이 적는다.
const BACKGROUND_MAP = {
    // 레벨 1
    radio: "radio.png",
    icecream: "icecream.png",
    festival: "festivities.png",
    animal: "animal.png",
    apartment: "apartment.png",
    
    // 레벨 2
    workshop: "Workshop.png",
    ticket: "Ticket.png",
    yoga: "Yoga.png",
    flea_market: "Flea_Market.png",
    test: "test.png"
};

function getBackgroundPath(bgKey) {
    if (!bgKey) return DEFAULT_IMAGE;

    // 1순위: 맵에 등록된 파일명
    const mapped = BACKGROUND_MAP[String(bgKey).toLowerCase()];
    if (mapped) return IMAGE_DIR + mapped;

    // 2순위: 맵에 없으면 background 값을 그대로 파일명으로 사용
    return `${IMAGE_DIR}${bgKey}.png`;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- 룰렛 ----------
// 룰렛에 넣을 아이템 배열 만들기 (마지막이 뽑힌 사건이 되도록)
function buildReelList(dataList, chosenScenario, totalItems = 24) {
    const reel = [];
    for (let i = 0; i < totalItems - 1; i++) {
        const random = dataList[Math.floor(Math.random() * dataList.length)];
        reel.push(random);
    }
    reel.push(chosenScenario); // 마지막 칸에 뽑힌 사건 고정
    return reel;
}

function renderReel(reelList, chosenScenario) {
    const track = document.getElementById("roulette-track");
    track.innerHTML = "";
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";

    reelList.forEach((scenario, index) => {
        const item = document.createElement("div");
        item.className = "roulette-item";

        const path = getBackgroundPath(scenario.background);
        item.style.backgroundImage = `url("${path}")`;

        // 이미지 파일이 없으면 기본 이미지로 대체
        const testImg = new Image();
        testImg.onerror = () => {
            console.warn(`배경 이미지를 찾을 수 없음: ${path} (background: ${scenario.background})`);
            item.style.backgroundImage = `url("${DEFAULT_IMAGE}")`;
        };
        testImg.src = path;

        // 마지막 칸이 뽑힌 사건이므로 index로 판별 (같은 사건이 중복돼도 안전)
        if (index === reelList.length - 1) {
            item.classList.add("chosen");
        }
        track.appendChild(item);
    });
}

function spinReel() {
    return new Promise((resolve) => {
        const track = document.getElementById("roulette-track");
        const viewport = document.querySelector(".roulette-viewport");

        const itemWidth = 420 + 16; // CSS의 width + margin-right와 반드시 일치
        const totalItems = track.children.length;
        const viewportWidth = viewport.offsetWidth;

        const targetX =
            -(totalItems - 1) * itemWidth + viewportWidth / 2 - itemWidth / 2;

        requestAnimationFrame(() => {
            track.style.transition =
                "transform 5.5s cubic-bezier(0.08, 0.82, 0.17, 1)";
            track.style.transform = `translateX(${targetX}px)`;
        });

        setTimeout(resolve, 5600);
    });
}

function fadeLabel(el, text) {
    return new Promise((resolve) => {
        el.style.opacity = 0;
        setTimeout(() => {
            el.textContent = text;
            el.style.opacity = 0.85;
            resolve();
        }, 300);
    });
}

async function playRevealAnimation(dataList, chosenScenario, level) {
    const overlay = document.getElementById("reveal-overlay");
    const labelEl = document.getElementById("reveal-label");
    const underlineEl = document.querySelector(".reveal-underline");

    overlay.classList.remove("hidden");
    underlineEl.classList.remove("grow");
    labelEl.textContent = "사건을 조회하는 중";
    labelEl.style.opacity = 0.85;

    const reelList = buildReelList(dataList, chosenScenario);
    renderReel(reelList, chosenScenario);

    await wait(150);
    await spinReel();

    await fadeLabel(labelEl, `배정된 사건 · ${chosenScenario.title}`);
    underlineEl.classList.add("grow");

    await wait(1100);

    window.location.href = `../pages/screen.html?level=${level}&title=${encodeURIComponent(chosenScenario.title)}`;
}

// ---------- "사건 파일 열기" 버튼 ----------
function initOpenFileButton() {
    const openBtn = document.querySelector(".open-file-btn");
    let isLoading = false; // 연타 방지

    openBtn.addEventListener("click", async () => {
        if (isLoading) return;

        if (!selectedLevel) {
            alert("난이도를 먼저 선택해주세요.");
            return;
        }

        isLoading = true;
        try {
            const res = await fetch(`../data/level${selectedLevel}.json`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const dataList = await res.json();
            if (!Array.isArray(dataList) || dataList.length === 0) {
                alert("이 난이도에는 아직 사건이 없어요.");
                isLoading = false;
                return;
            }

            const chosenScenario =
                dataList[Math.floor(Math.random() * dataList.length)];

            await playRevealAnimation(dataList, chosenScenario, selectedLevel);
        } catch (err) {
            console.error("사건 데이터를 불러오지 못했습니다:", err);
            alert("사건 데이터를 불러오지 못했어요. 파일 경로를 확인해주세요.");
            isLoading = false;
        }
    });
}

// ---------- 초기 실행 ----------
document.addEventListener("DOMContentLoaded", () => {
    initFolderSelection();
    initOpenFileButton();
});