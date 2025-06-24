"use client";

import React, { useState, useEffect } from "react";
import { GitHubService, GitHubRepo } from "@/lib/github";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Code, Star, GitFork } from "lucide-react";

export default function Analytics() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
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
        console.error("Error fetching analytics data:", err);
        setError(
          "Failed to fetch analytics data. Please check your GitHub token and username configuration.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-github-900 mx-auto"></div>
        <p className="mt-4 text-github-600">Loading analytics data...</p>
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

  // Prepare data for charts
  const languageData = repos.reduce(
    (acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const languageChartData = Object.entries(languageData)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const starsData = repos
    .filter((repo) => repo.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((repo) => ({
      name:
        repo.name.length > 15 ? repo.name.substring(0, 15) + "..." : repo.name,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));

  const reposByMonth = repos.reduce(
    (acc, repo) => {
      const month = new Date(repo.created_at).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const timelineData = Object.entries(reposByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      repositories: count,
    }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#FF7C7C",
    "#8DD1E1",
    "#D084D0",
  ];

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0,
  );
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const avgStarsPerRepo =
    repos.length > 0 ? (totalStars / repos.length).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-github-900 mb-6">
          Repository Analytics
        </h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Repositories</p>
                <p className="text-3xl font-bold">{repos.length}</p>
              </div>
              <Code className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Total Stars</p>
                <p className="text-3xl font-bold">{totalStars}</p>
              </div>
              <Star className="h-12 w-12 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Forks</p>
                <p className="text-3xl font-bold">{totalForks}</p>
              </div>
              <GitFork className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Avg Stars/Repo</p>
                <p className="text-3xl font-bold">{avgStarsPerRepo}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-github-900 mb-4">
            Language Distribution
          </h2>
          {languageChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ language, percent }) =>
                    `${language} ${(percent ?? 0 * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {languageChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-github-500">
              No language data available
            </div>
          )}
        </div>

        {/* Top Repositories by Stars */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-github-900 mb-4">
            Top Repositories by Stars
          </h2>
          {starsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={starsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stars" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-github-500">
              No starred repositories found
            </div>
          )}
        </div>
      </div>

      {/* Repository Creation Timeline */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-github-900 mb-4">
          Repository Creation Timeline
        </h2>
        {timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="repositories"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ fill: "#0088FE", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-github-500">
            No timeline data available
          </div>
        )}
      </div>

      {/* Language Statistics Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-github-900 mb-4">
          Language Statistics
        </h2>
        {languageChartData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-github-200">
              <thead className="bg-github-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-github-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-github-500 uppercase tracking-wider">
                    Repositories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-github-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-github-200">
                {languageChartData.map((item, index) => (
                  <tr key={item.language}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-sm font-medium text-github-900">
                          {item.language}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-github-900">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-github-900">
                      {((item.count / repos.length) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-github-500">
            No language statistics available
          </div>
        )}
      </div>

      {/* Repository Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-github-900 mb-4">
          Repository Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {repos.filter((r) => !r.archived).length}
            </div>
            <div className="text-github-600">Active Repositories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {repos.filter((r) => r.archived).length}
            </div>
            <div className="text-github-600">Archived Repositories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {repos.filter((r) => r.private).length}
            </div>
            <div className="text-github-600">Private Repositories</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-github-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          {repos
            .sort(
              (a, b) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime(),
            )
            .slice(0, 5)
            .map((repo) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 bg-github-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <h3 className="font-medium text-github-900">{repo.name}</h3>
                    <p className="text-sm text-github-600">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-github-600">
                  <span className="flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>{repo.stargazers_count}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <GitFork className="h-4 w-4" />
                    <span>{repo.forks_count}</span>
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
