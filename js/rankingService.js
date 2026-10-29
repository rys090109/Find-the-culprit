// ---------- 랭킹 점수 계산 ----------
function calculateRankingScore(correctCount, clueCount) {
  const score = correctCount * 1000 - clueCount * 50;
  return Math.max(0, score);
}

// ---------- 게임 결과 저장 ----------
async function saveRanking({ level, correctCount, totalCount, clueCount }) {
  // 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  const nickname =
    user.user_metadata?.nickname || user.user_metadata?.username || "익명";

  const accuracy =
    totalCount > 0 ? Number(((correctCount / totalCount) * 100).toFixed(2)) : 0;

  const score = calculateRankingScore(correctCount, clueCount);

  // 이 사용자의 해당 레벨 기존 기록 확인
  const { data: existingRanking, error: selectError } = await supabaseClient
    .from("rankings")
    .select("score")
    .eq("user_id", user.id)
    .eq("level", level)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  // 기존 최고 점수보다 낮거나 같으면 저장하지 않음
  if (existingRanking && existingRanking.score >= score) {
    return {
      saved: false,
      score,
      accuracy,
      message: "기존 최고 점수가 더 높습니다.",
    };
  }

  // 기록이 없으면 추가하고, 있으면 최고 점수로 수정
  const { error: saveError } = await supabaseClient.from("rankings").upsert(
    {
      user_id: user.id,
      nickname,
      level: Number(level),
      score,
      correct_count: Number(correctCount),
      total_count: Number(totalCount),
      accuracy,
      clue_count: Number(clueCount),
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,level",
    },
  );

  if (saveError) {
    throw saveError;
  }

  return {
    saved: true,
    score,
    accuracy,
    message: "최고 기록이 저장되었습니다.",
  };
}

// ---------- 레벨별 랭킹 조회 ----------
async function getRankings(level, limit = 100) {
  const { data, error } = await supabaseClient
    .from("rankings")
    .select(
      `
            user_id,
            nickname,
            level,
            score,
            correct_count,
            total_count,
            accuracy,
            clue_count,
            created_at
        `,
    )
    .eq("level", Number(level))
    .order("score", { ascending: false })
    .order("clue_count", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  // 순위 번호를 추가해서 반환
  return data.map((ranking, index) => ({
    rank: index + 1,
    ...ranking,
  }));
}
