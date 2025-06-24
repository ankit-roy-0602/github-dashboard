import { GitHubService } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, Clock, User, Tag } from "lucide-react";
import Image from "next/image";

async function getIssuesData() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!username) {
    throw new Error("GitHub username not configured");
  }

  try {
    const repos = await GitHubService.getUserRepos(username);
    const reposWithIssues = repos
      .filter((repo) => repo.open_issues_count > 0)
      .slice(0, 10);

    const allIssues = await Promise.all(
      reposWithIssues.map(async (repo) => {
        try {
          const issues = await GitHubService.getRepoIssues(username, repo.name);
          return { repo: repo.name, issues };
        } catch (error) {
          console.error(`Error fetching issues for ${repo.name}:`, error);
          return { repo: repo.name, issues: [] };
        }
      }),
    );

    return { repos, allIssues };
  } catch (error) {
    console.error("Error fetching issues data:", error);
    throw new Error("Failed to fetch issues data");
  }
}

export default async function Issues() {
  try {
    const { allIssues } = await getIssuesData();

    const flatIssues = allIssues.flatMap((item) =>
      item.issues.map((issue) => ({ ...issue, repoName: item.repo })),
    );

    const openIssues = flatIssues.filter(
      (issue) => issue.state === "open",
    ).length;
    const closedIssues = flatIssues.filter(
      (issue) => issue.state === "closed",
    ).length;

    const getStateIcon = (state: string) => {
      return state === "open" ? (
        <AlertCircle className="h-5 w-5 text-green-500" />
      ) : (
        <CheckCircle className="h-5 w-5 text-purple-500" />
      );
    };

    const getStateColor = (state: string) => {
      return state === "open"
        ? "bg-green-100 text-green-800"
        : "bg-purple-100 text-purple-800";
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-github-900 mb-6">
            Issues & Pull Requests
          </h1>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Open Issues
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">{openIssues}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">
                  Closed Issues
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {closedIssues}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  Total Issues
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {flatIssues.length}
              </p>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {flatIssues.length > 0 ? (
          <div className="space-y-4">
            {flatIssues.map((issue) => (
              <div
                key={`${issue.repoName}-${issue.id}`}
                className="bg-white rounded-lg shadow-md p-6 border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStateIcon(issue.state)}
                    <div>
                      <h3 className="text-lg font-semibold text-github-900">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-github-600">
                        #{issue.number} opened by {issue.user.login} in{" "}
                        {issue.repoName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(issue.state)}`}
                  >
                    {issue.state}
                  </span>
                </div>

                {issue.body && (
                  <p className="text-github-700 mb-4 line-clamp-3">
                    {issue.body.length > 200
                      ? `${issue.body.substring(0, 200)}...`
                      : issue.body}
                  </p>
                )}

                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="h-4 w-4 text-github-500" />
                    <div className="flex flex-wrap gap-2">
                      {issue.labels
                        .slice(0, 5)
                        .map((label: any, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `#${label.color}20`,
                              color: `#${label.color}`,
                              borderColor: `#${label.color}40`,
                              border: "1px solid",
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-github-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <Image
                        src={issue.user.avatar_url}
                        alt={issue.user.login}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{issue.user.login}</span>
                    </div>
                  </div>
                  <span>
                    Updated{" "}
                    {formatDistanceToNow(new Date(issue.updated_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-github-500">No issues found.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : "Failed to load issues"}
          </p>
        </div>
      </div>
    );
  }
}
