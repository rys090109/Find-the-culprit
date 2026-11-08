// ---------- 랭킹 점수 계산 ----------
function calculateRankingScore(correctCount, clueCount, clearTime = 0) {
  const score =
    Number(correctCount) * 1000 - Number(clueCount) * 50 - Number(clearTime);

  return Math.max(0, score);
}

// ---------- 게임 결과 저장 ----------
async function saveRanking({
  level,
  correctCount,
  totalCount,
  clueCount,
  clearTime,
}) {
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

  const score = calculateRankingScore(correctCount, clueCount, clearTime);

  // 현재 사용자의 해당 레벨 최고 기록 조회
  const { data: existingRanking, error: selectError } = await supabaseClient
    .from("rankings")
    .select("score, clear_time")
    .eq("user_id", user.id)
    .eq("level", Number(level))
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  // 타이머 적용 전 기록은 새 기록으로 한 번 갱신
  const hasNewTimerRecord =
    existingRanking && Number(existingRanking.clear_time) > 0;

  if (hasNewTimerRecord && Number(existingRanking.score) >= Number(score)) {
    return {
      saved: false,
      score,
      accuracy,
      clearTime,
      message: "기존 최고 점수가 더 높습니다.",
    };
  }

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
      clear_time: Number(clearTime),
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
    clearTime,
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
      clear_time,
      created_at
    `,
    )
    .eq("level", Number(level))
    .order("score", { ascending: false })
    .order("accuracy", { ascending: false })
    .order("clue_count", { ascending: true })
    .order("clear_time", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data.map((ranking, index) => ({
    rank: index + 1,
    ...ranking,
  }));
}
