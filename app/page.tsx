import { GitHubService } from "@/lib/github";
import StatsCard from "@/components/StatsCard";
import RepoCard from "@/components/RepoCard";
import { Users, Folder, Star, GitFork } from "lucide-react";
import Image from "next/image";

async function getDashboardData() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!username) {
    throw new Error(
      "GitHub username not configured. Please set NEXT_PUBLIC_GITHUB_USERNAME in your environment variables.",
    );
  }

  try {
    const [user, repos] = await Promise.all([
      GitHubService.getUser(username),
      GitHubService.getUserRepos(username),
    ]);

    return { user, repos };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    throw new Error(
      "Failed to fetch GitHub data. Please check your GitHub token and username configuration.",
    );
  }
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="text-center py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  try {
    const { user, repos } = await getDashboardData();

    const totalStars = repos.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0,
    );
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const recentRepos = repos.slice(0, 6);

    return (
      <div className="space-y-8">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 border">
          <div className="flex items-center space-x-6">
            <Image
              src={user.avatar_url}
              alt={user.name || user.login}
              className="w-24 h-24 rounded-full border-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-github-900">
                Welcome, {user.name || user.login}!
              </h1>
              {user.bio && <p className="text-github-600 mt-2">{user.bio}</p>}
              <div className="flex items-center space-x-4 mt-3 text-sm text-github-500">
                {user.location && <span>📍 {user.location}</span>}
                {user.company && <span>🏢 {user.company}</span>}
                {user.blog && (
                  <a
                    href={
                      user.blog.startsWith("http")
                        ? user.blog
                        : `https://${user.blog}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    🔗 {user.blog}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Public Repositories"
            value={user.public_repos}
            icon={Folder}
            color="bg-blue-500"
          />
          <StatsCard
            title="Followers"
            value={user.followers}
            icon={Users}
            color="bg-green-500"
          />
          <StatsCard
            title="Total Stars"
            value={totalStars}
            icon={Star}
            color="bg-yellow-500"
          />
          <StatsCard
            title="Total Forks"
            value={totalForks}
            icon={GitFork}
            color="bg-purple-500"
          />
        </div>

        {/* Recent Repositories */}
        <div>
          <h2 className="text-2xl font-bold text-github-900 mb-6">
            Recent Repositories
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <ErrorDisplay
        error={
          error instanceof Error ? error.message : "Unknown error occurred"
        }
      />
    );
  }
}
