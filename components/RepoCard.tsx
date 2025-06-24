import React from "react";
import Link from "next/link";
import { Star, GitFork, Eye, AlertCircle, Calendar } from "lucide-react";
import { GitHubRepo } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";

interface RepoCardProps {
  repo: GitHubRepo;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            href={repo.html_url}
            target="_blank"
            className="text-lg font-semibold text-blue-600 hover:text-blue-800"
          >
            {repo.name}
          </Link>
          <p className="text-github-600 text-sm mt-1">
            {repo.description || "No description available"}
          </p>
        </div>
        {repo.language && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {repo.language}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4 text-sm text-github-600">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4" />
          <span>{repo.stargazers_count}</span>
        </div>
        <div className="flex items-center space-x-1">
          <GitFork className="h-4 w-4" />
          <span>{repo.forks_count}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="h-4 w-4" />
          <span>{repo.watchers_count}</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>{repo.open_issues_count}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs text-github-500">
        <Calendar className="h-3 w-3 mr-1" />
        Updated{" "}
        {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
      </div>
    </div>
  );
};

export default RepoCard;
