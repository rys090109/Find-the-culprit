let selectedLevel = null;

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

// 배경 키 → 실제 이미지 경로 매핑 (시나리오가 늘어날 때마다 여기 추가)
// 배경 키 → 실제 이미지 경로 매핑
const BACKGROUND_MAP = {
    radio: "../assets/image/radio.png",
    icecream: "../assets/image/icecream.png",
    festival: "../assets/image/festival.png",
    animal: "../assets/image/animal.png",
    apartment: "../assets/image/apartment.png"
};

function getBackgroundPath(bgKey) {
    return BACKGROUND_MAP[bgKey] || "../assets/image/file.png";
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 룰렛에 넣을 아이템 배열 만들기 (마지막이 뽑힌 사건이 되도록)
function buildReelList(dataList, chosenScenario, totalItems = 24) {
    const reel = [];
    for (let i = 0; i < totalItems - 1; i++) {
        const random = dataList[Math.floor(Math.random() * dataList.length)];
        reel.push(random);
    }
    reel.push(chosenScenario); // 마지막 칸에 정답 고정
    return reel;
}

function renderReel(reelList, chosenScenario) {
    const track = document.getElementById("roulette-track");
    track.innerHTML = "";
    track.style.transition = "none";
    track.style.transform = "translateX(0px)";

    reelList.forEach((scenario) => {
        const item = document.createElement("div");
        item.className = "roulette-item";
        item.style.backgroundImage = `url(${getBackgroundPath(scenario.background)})`;
        if (scenario === chosenScenario) {
            item.classList.add("chosen");
        }
        track.appendChild(item);
    });
}

function spinReel() {
    return new Promise((resolve) => {
        const track = document.getElementById("roulette-track");
        const viewport = document.querySelector(".roulette-viewport");

        const itemWidth = 420 + 16; // width + margin-right (위에서 바꾼 값과 반드시 일치시켜야 함)
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
    openBtn.addEventListener("click", async () => {
        if (!selectedLevel) {
            alert("난이도를 먼저 선택해주세요.");
            return;
        }

        const res = await fetch(`../data/level${selectedLevel}.json`);
        const dataList = await res.json();
        const chosenScenario =
            dataList[Math.floor(Math.random() * dataList.length)];

        playRevealAnimation(dataList, chosenScenario, selectedLevel);
    });
}

// ---------- 초기 실행 ----------
document.addEventListener("DOMContentLoaded", () => {
    initFolderSelection();
    initOpenFileButton();
});