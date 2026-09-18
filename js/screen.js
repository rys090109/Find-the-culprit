async function loadLevelByTitle(targetTitle) {
    const res = await fetch("../data/level1.json");
    const dataList = await res.json();

    const found = dataList.find((item) => item.title === targetTitle);

    if (!found) {
        console.log("해당 제목의 사건을 찾을 수 없습니다.");
        return;
    }

    console.log(found);
    return found;
}

function renderStoryScene(level) {
    document.getElementById("story-title").textContent = level.title;
    document.getElementById("story-text").textContent = level.story;
}

async function init() {
    const level = await loadLevelByTitle("라디오 사연 유출 사건");
    if (!level) {
        return;
    }
    renderStoryScene(level);
}

init();