/**
 * Calculates the exponential cdf.
 *
 * @param x The value.
 * @returns The exponential cdf.
 */
function exponential_cdf(x: number): number {
  return 1 - 2 ** -x;
}

/**
 * Calculates the log normal cdf.
 *
 * @param x The value.
 * @returns The log normal cdf.
 */
function log_normal_cdf(x: number): number {
  // approximation
  return x / (1 + x);
}

/**
 * Calculates the users rank.
 *
 * @param params Parameters on which the user's rank depends.
 * @param params.all_commits Whether `include_all_commits` was used.
 * @param params.commits Number of commits.
 * @param params.prs The number of pull requests.
 * @param params.issues The number of issues.
 * @param params.reviews The number of reviews.
 * @param params.repos Total number of repos (accepted for compatibility, unused in the calculation).
 * @param params.stars The number of stars.
 * @param params.followers The number of followers.
 * @param params.contributions All-time contributions. When greater than 0, the
 *   rank is based on activity only (contributions, commits, PRs, issues and
 *   reviews) and ignores stars and followers.
 * @returns The users rank.
 */
function calculateRank({
  all_commits,
  commits,
  prs,
  issues,
  reviews,
  stars,
  followers,
  contributions = 0,
}: {
  all_commits: boolean;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  repos: number;
  stars: number;
  followers: number;
  contributions?: number;
}): { level: string; percentile: number } {
  const COMMITS_MEDIAN = all_commits ? 1000 : 250,
    COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50,
    PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25,
    ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2,
    REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50,
    STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10,
    FOLLOWERS_WEIGHT = 1;
  const CONTRIBUTIONS_MEDIAN = 1000,
    CONTRIBUTIONS_WEIGHT = 6;

  const activityScore =
    COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
    PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN) +
    ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
    REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN);
  const activityWeight =
    COMMITS_WEIGHT + PRS_WEIGHT + ISSUES_WEIGHT + REVIEWS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  const rank =
    contributions > 0
      ? 1 -
        (CONTRIBUTIONS_WEIGHT *
          exponential_cdf(contributions / CONTRIBUTIONS_MEDIAN) +
          activityScore) /
          (CONTRIBUTIONS_WEIGHT + activityWeight)
      : 1 -
        (activityScore +
          STARS_WEIGHT * log_normal_cdf(stars / STARS_MEDIAN) +
          FOLLOWERS_WEIGHT * log_normal_cdf(followers / FOLLOWERS_MEDIAN)) /
          (activityWeight + STARS_WEIGHT + FOLLOWERS_WEIGHT);

  const level = LEVELS[THRESHOLDS.findIndex((t) => rank * 100 <= t)];
  if (level === undefined) {
    throw new Error("Unable to determine rank level");
  }

  return { level, percentile: rank * 100 };
}

export { calculateRank };
