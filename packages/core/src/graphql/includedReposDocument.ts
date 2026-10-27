import type { TopLanguagesRepositoryFragment } from "./generated/top-languages.js";
import { graphqlDocument } from "./graphqlDocument.js";

type IncludedReposQuery = Record<
  `repo_${number}`,
  TopLanguagesRepositoryFragment | null
>;

/**
 * Build a query fetching the languages of extra repositories, one aliased
 * `repository` field each. The shape is only known at runtime.
 *
 * @param repos Repositories as `owner/name`; callers must validate them first.
 * @returns Document for `createGraphQLFetcher`.
 */
const buildIncludedReposDocument = (
  repos: Array<{ owner: string; name: string }>,
) => {
  const repoFields = repos
    .map(
      ({ owner, name }, idx) =>
        `repo_${idx}: repository(owner: "${owner}", name: "${name}") { ...TopLanguagesRepository }`,
    )
    .join("\n");

  // fragments must match queries/top-languages.graphql, which generates their types
  return graphqlDocument<IncludedReposQuery, Record<string, never>>(`
query includedRepos {
  ${repoFields}
}
fragment TopLanguage on LanguageEdge {
  size
  node {
    color
    name
  }
}
fragment TopLanguagesRepository on Repository {
  name
  languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
    edges {
      ...TopLanguage
    }
  }
}`);
};

export { buildIncludedReposDocument };
