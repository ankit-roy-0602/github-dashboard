import { GitHubService } from "@/lib/github";
import { Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

async function getSecurityData() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!username) {
    throw new Error("GitHub username not configured");
  }

  try {
    const repos = await GitHubService.getUserRepos(username);
    const securityData: Record<string, any> = {};

    // Fetch security data for each repository (limit to first 10 for performance)
    const reposToCheck = repos.slice(0, 10);

    await Promise.all(
      reposToCheck.map(async (repo: any) => {
        try {
          const [
            dependabotAlerts,
            codeScanningAlerts,
            secretScanningAlerts,
            securityAnalysis,
          ] = await Promise.all([
            GitHubService.getSecurityAlerts(username, repo.name),
            GitHubService.getCodeScanningAlerts(username, repo.name),
            GitHubService.getSecretScanningAlerts(username, repo.name),
            GitHubService.getRepoSecurityAndAnalysis(username, repo.name),
          ]);

          securityData[repo.name] = {
            dependabotAlerts,
            codeScanningAlerts,
            secretScanningAlerts,
            securityAnalysis,
          };
        } catch (error) {
          console.error(
            `Error fetching security data for ${repo.name}:`,
            error,
          );
          securityData[repo.name] = {
            dependabotAlerts: [],
            codeScanningAlerts: [],
            secretScanningAlerts: [],
            securityAnalysis: null,
          };
        }
      }),
    );

    return { repos, securityData };
  } catch (error) {
    console.error("Error fetching security data:", error);
    throw new Error("Failed to fetch security data");
  }
}

export default async function Security() {
  try {
    const { repos, securityData } = await getSecurityData();

    // Calculate totals
    const totalDependabotAlerts = Object.values(securityData).reduce(
      (sum: number, data: any) => sum + data.dependabotAlerts.length,
      0,
    );
    const totalCodeScanningAlerts = Object.values(securityData).reduce(
      (sum: number, data: any) => sum + data.codeScanningAlerts.length,
      0,
    );
    const totalSecretScanningAlerts = Object.values(securityData).reduce(
      (sum: number, data: any) => sum + data.secretScanningAlerts.length,
      0,
    );

    const getSeverityColor = (severity: string) => {
      switch (severity?.toLowerCase()) {
        case "critical":
          return "bg-red-100 text-red-800 border-red-200";
        case "high":
          return "bg-orange-100 text-orange-800 border-orange-200";
        case "medium":
        case "moderate":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "low":
          return "bg-blue-100 text-blue-800 border-blue-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const renderDependabotAlert = (alert: any, repoName: string) => (
      <div
        key={`${repoName}-${alert.number}`}
        className="bg-white rounded-lg shadow-md p-6 border"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Package className="h-6 w-6 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-github-900">
                {alert.security_advisory?.summary || "Security Advisory"}
              </h3>
              <p className="text-sm text-github-600 mt-1">
                {alert.dependency?.package?.name} in {repoName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(alert.security_advisory?.severity)}`}
            >
              {alert.security_advisory?.severity || "Unknown"}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                alert.state === "open"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {alert.state}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-github-700">
              {alert.security_advisory?.description ||
                "No description available"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-github-600">
                  Package:
                </span>
                <span className="text-sm text-github-900 font-mono">
                  {alert.dependency?.package?.ecosystem}/
                  {alert.dependency?.package?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-github-600">
                  Vulnerable Range:
                </span>
                <span className="text-sm text-github-900 font-mono">
                  {alert.security_vulnerability?.vulnerable_version_range ||
                    "Unknown"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {alert.security_advisory?.cve_id && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-github-600">
                    CVE:
                  </span>
                  <span className="text-sm text-github-900 font-mono">
                    {alert.security_advisory.cve_id}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-github-600">
                  Published:
                </span>
                <span className="text-sm text-github-900">
                  {alert.security_advisory?.published_at
                    ? formatDistanceToNow(
                        new Date(alert.security_advisory.published_at),
                        { addSuffix: true },
                      )
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">
          Repository Security Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-lg font-semibold text-github-900 mb-2">
              Dependabot Alerts
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {totalDependabotAlerts}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-lg font-semibold text-github-900 mb-2">
              Code Scanning Alerts
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {totalCodeScanningAlerts}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border">
            <div className="text-lg font-semibold text-github-900 mb-2">
              Secret Scanning Alerts
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {totalSecretScanningAlerts}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {repos.map((repo: any) => (
            <div
              key={repo.name}
              className="bg-gray-50 rounded-lg p-6 border border-github-100"
            >
              <h2 className="text-xl font-semibold mb-4">{repo.name}</h2>
              <div className="space-y-4">
                {securityData[repo.name]?.dependabotAlerts.length > 0 ? (
                  securityData[repo.name].dependabotAlerts.map((alert: any) =>
                    renderDependabotAlert(alert, repo.name),
                  )
                ) : (
                  <div className="text-github-500">No Dependabot alerts</div>
                )}
                {/* Add similar rendering for codeScanningAlerts and secretScanningAlerts if needed */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error.message || "Failed to load security data."}</p>
        </div>
      </div>
    );
  }
}
