"use client";

import React, { useState, useEffect } from "react";
import { GitHubService, GitHubRepo } from "@/lib/github";
import RepoCard from "@/components/RepoCard";
import { Search, Calendar, Star, GitFork } from "lucide-react";

export default function Repositories() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "stars" | "forks" | "name">(
    "updated",
  );
  const [filterLanguage, setFilterLanguage] = useState("");

  useEffect(() => {
    async function fetchRepos() {
      const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

      if (!username) {
        setError(
          "GitHub username not configured. Please set NEXT_PUBLIC_GITHUB_USERNAME in your environment variables.",
        );
        setLoading(false);
        return;
      }

      try {
        const reposData = await GitHubService.getUserRepos(username);
        setRepos(reposData);
      } catch (err) {
        setError(
          "Failed to fetch repositories. Please check your GitHub token and username configuration.",
        );
        console.error("Error fetching repositories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-900 mx-auto"></div>
        <p className="mt-4 text-github-600">Loading repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Get unique languages
  const languages = Array.from(
    new Set(repos.map((repo) => repo.language).filter(Boolean)),
  );

  // Filter and sort repositories
  const filteredRepos = repos
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesLanguage =
        !filterLanguage || repo.language === filterLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "forks":
          return b.forks_count - a.forks_count;
        case "name":
          return a.name.localeCompare(b.name);
        case "updated":
        default:
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
      }
    });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-github-900 mb-6">
          Repositories
        </h1>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-github-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-github-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-github-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updated">Sort by Updated</option>
            <option value="stars">Sort by Stars</option>
            <option value="forks">Sort by Forks</option>
            <option value="name">Sort by Name</option>
          </select>

          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-4 py-2 border border-github-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        {/* Repository Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-github-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-github-600">
                Total Repositories
              </span>
            </div>
            <p className="text-2xl font-bold text-github-900">{repos.length}</p>
          </div>

          <div className="bg-github-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-github-600">
                Total Stars
              </span>
            </div>
            <p className="text-2xl font-bold text-github-900">
              {repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
            </p>
          </div>

          <div className="bg-github-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <GitFork className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium text-github-600">
                Total Forks
              </span>
            </div>
            <p className="text-2xl font-bold text-github-900">
              {repos.reduce((sum, repo) => sum + repo.forks_count, 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-github-600">
            {filteredRepos.length === 0
              ? "No repositories found matching your criteria"
              : `${filteredRepos.length} of ${repos.length} repositories`}
          </p>
        </div>
      </div>

      {/* Repository Grid */}
      {filteredRepos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-github-500">
              No repositories found matching your criteria.
            </p>
            {searchTerm || filterLanguage ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterLanguage("");
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
