function getCurrentQuestionForTeam(teamIdOrOptions, roundOrId, submissionsOverride) {
  let teamId;
  let round;
  let submissions;

  if (teamIdOrOptions && typeof teamIdOrOptions === 'object') {
    ({ teamId, round, submissions } = teamIdOrOptions);
  } else {
    teamId = teamIdOrOptions;
    round = roundOrId;
    submissions = submissionsOverride || [];
  }

  if (!round || !Array.isArray(round.questionIds)) {
    return null;
  }

  const solvedQuestionIds = new Set(
    (submissions || [])
      .filter((submission) => submission.teamId?.toString() === teamId?.toString())
      .filter((submission) => submission.isCorrect)
      .map((submission) => submission.questionId?.toString())
  );

  for (const questionId of round.questionIds) {
    if (!solvedQuestionIds.has(questionId.toString())) {
      return questionId.toString();
    }
  }

  return null;
}

module.exports = { getCurrentQuestionForTeam };
