import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  bio: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  draft: boolean;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
  };
  mergeable: boolean;
  mergeable_state: string;
  merged: boolean;
  merged_at: string | null;
  merge_commit_sha: string | null;
  requested_reviewers: Array<{
    login: string;
    avatar_url: string;
  }>;
  requested_teams: Array<{
    name: string;
    slug: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  milestone: {
    title: string;
    number: number;
  } | null;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  diff_url: string;
  patch_url: string;
}

export interface SecurityAlert {
  number: number;
  state: string;
  dependency: {
    package: {
      ecosystem: string;
      name: string;
    };
    manifest_path: string;
    scope: string;
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string;
    summary: string;
    description: string;
    severity: string;
    identifiers: Array<{
      value: string;
      type: string;
    }>;
    references: Array<{
      url: string;
    }>;
    published_at: string;
    updated_at: string;
    withdrawn_at: string | null;
    vulnerabilities: Array<{
      package: {
        ecosystem: string;
        name: string;
      };
      severity: string;
      vulnerable_version_range: string;
      first_patched_version: {
        identifier: string;
      } | null;
    }>;
  };
  security_vulnerability: {
    package: {
      ecosystem: string;
      name: string;
    };
    severity: string;
    vulnerable_version_range: string;
    first_patched_version: {
      identifier: string;
    } | null;
  };
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  dismissed_at: string | null;
  dismissed_by: {
    login: string;
    avatar_url: string;
  } | null;
  dismissed_reason: string | null;
  dismissed_comment: string | null;
  fixed_at: string | null;
}

export interface CodeScanningAlert {
  number: number;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  state: string;
  fixed_at: string | null;
  dismissed_by: {
    login: string;
    avatar_url: string;
  } | null;
  dismissed_at: string | null;
  dismissed_reason: string | null;
  dismissed_comment: string | null;
  rule: {
    id: string;
    name: string;
    severity: string;
    security_severity_level: string;
    description: string;
    full_description: string;
    tags: string[];
    help: string;
  };
  tool: {
    name: string;
    guid: string | null;
    version: string;
  };
  most_recent_instance: {
    ref: string;
    analysis_key: string;
    category: string;
    environment: string;
    location: {
      path: string;
      start_line: number;
      end_line: number;
      start_column: number;
      end_column: number;
    };
    message: {
      text: string;
    };
  };
}

export interface SecretScanningAlert {
  number: number;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  locations_url: string;
  state: string;
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: {
    login: string;
    avatar_url: string;
  } | null;
  resolution_comment: string | null;
  secret_type: string;
  secret_type_display_name: string;
  secret: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
  };
  push_protection_bypassed: boolean;
  push_protection_bypassed_by: {
    login: string;
    avatar_url: string;
  } | null;
  push_protection_bypassed_at: string | null;
}

export interface WebhookEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  repository?: string;
  sender?: string;
  deliveryId?: string;
}

// GitHub API service functions
export class GitHubService {
  static async getUser(username: string): Promise<GitHubUser> {
    const { data } = await octokit.rest.users.getByUsername({
      username,
    });
    return data as GitHubUser;
  }

  static async getUserRepos(username: string): Promise<GitHubRepo[]> {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      sort: "updated",
      per_page: 100,
    });
    return data as GitHubRepo[];
  }

  static async getRepoIssues(
    owner: string,
    repo: string,
  ): Promise<GitHubIssue[]> {
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "all",
      per_page: 50,
    });
    return data as GitHubIssue[];
  }

  static async getRepoCommits(
    owner: string,
    repo: string,
  ): Promise<GitHubCommit[]> {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 50,
    });
    return data as GitHubCommit[];
  }

  static async getRepoPullRequests(
    owner: string,
    repo: string,
  ): Promise<GitHubPullRequest[]> {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "all",
      per_page: 50,
    });
    // Fetch full details for each PR to match GitHubPullRequest interface
    const detailedPRs = await Promise.all(
      data.map(async (pr: any) => {
        const { data: fullPR } = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: pr.number,
        });
        return fullPR as GitHubPullRequest;
      }),
    );
    return detailedPRs;
  }

  static async getPullRequestDetails(
    owner: string,
    repo: string,
    pull_number: number,
  ): Promise<GitHubPullRequest> {
    const { data } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    });
    return data as GitHubPullRequest;
  }

  static async getRepoContributors(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 50,
    });
    return data;
  }

  static async getRepoLanguages(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });
    return data;
  }

  static async getRepoReleases(owner: string, repo: string) {
    const { data } = await octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 20,
    });
    return data;
  }

  static async getOrganizations(username: string) {
    const { data } = await octokit.rest.orgs.listForUser({
      username,
      per_page: 50,
    });
    return data;
  }

  static async getFollowers(username: string) {
    const { data } = await octokit.rest.users.listFollowersForUser({
      username,
      per_page: 50,
    });
    return data;
  }

  static async getFollowing(username: string) {
    const { data } = await octokit.rest.users.listFollowingForUser({
      username,
      per_page: 50,
    });
    return data;
  }

  // Security and Vulnerability APIs
  static async getSecurityAlerts(
    owner: string,
    repo: string,
  ): Promise<SecurityAlert[]> {
    try {
      const { data } = await octokit.rest.dependabot.listAlertsForRepo({
        owner,
        repo,
        state: "open",
        per_page: 100,
      });
      // Convert readonly arrays to mutable arrays for compatibility with SecurityAlert type
      return (data as any[]).map((alert) => ({
        ...alert,
        security_advisory: alert.security_advisory
          ? {
              ...alert.security_advisory,
              identifiers: alert.security_advisory.identifiers
                ? Array.from(alert.security_advisory.identifiers)
                : [],
              references: alert.security_advisory.references
                ? Array.from(alert.security_advisory.references)
                : [],
              vulnerabilities: alert.security_advisory.vulnerabilities
                ? Array.from(alert.security_advisory.vulnerabilities)
                : [],
            }
          : undefined,
      })) as SecurityAlert[];
    } catch (error) {
      console.error("Error fetching security alerts:", error);
      return [];
    }
  }

  static async getAllSecurityAlerts(
    owner: string,
    repo: string,
  ): Promise<SecurityAlert[]> {
    try {
      const { data } = await octokit.rest.dependabot.listAlertsForRepo({
        owner,
        repo,
        state: "all",
        per_page: 100,
      });
      return (data as any[]).map((alert) => ({
        ...alert,
        security_advisory: alert.security_advisory
          ? {
              ...alert.security_advisory,
              identifiers: alert.security_advisory.identifiers
                ? Array.from(
                    alert.security_advisory.identifiers,
                    (id: any) => ({ ...id }),
                  )
                : [],
              references: alert.security_advisory.references
                ? Array.from(
                    alert.security_advisory.references,
                    (ref: any) => ({ ...ref }),
                  )
                : [],
              vulnerabilities: alert.security_advisory.vulnerabilities
                ? Array.from(
                    alert.security_advisory.vulnerabilities,
                    (vuln: any) => ({ ...vuln }),
                  )
                : [],
            }
          : undefined,
      })) as SecurityAlert[];
    } catch (error) {
      console.error("Error fetching all security alerts:", error);
      return [];
    }
  }

  static async getCodeScanningAlerts(
    owner: string,
    repo: string,
  ): Promise<CodeScanningAlert[]> {
    try {
      const { data } = await octokit.rest.codeScanning.listAlertsForRepo({
        owner,
        repo,
        state: "open",
        per_page: 100,
      });
      return data as CodeScanningAlert[];
    } catch (error) {
      console.error("Error fetching code scanning alerts:", error);
      return [];
    }
  }

  static async getSecretScanningAlerts(
    owner: string,
    repo: string,
  ): Promise<SecretScanningAlert[]> {
    try {
      const { data } = await octokit.rest.secretScanning.listAlertsForRepo({
        owner,
        repo,
        state: "open",
        per_page: 100,
      });
      return data as SecretScanningAlert[];
    } catch (error) {
      console.error("Error fetching secret scanning alerts:", error);
      return [];
    }
  }

  static async getRepoVulnerabilityAlerts(owner: string, repo: string) {
    try {
      const { data: enabled } =
        await octokit.rest.repos.checkVulnerabilityAlerts({
          owner,
          repo,
        });

      if (enabled) {
        return await this.getSecurityAlerts(owner, repo);
      }
      return [];
    } catch (error) {
      console.error("Error checking vulnerability alerts:", error);
      return [];
    }
  }

  static async getRepoSecurityAndAnalysis(owner: string, repo: string) {
    try {
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        security_and_analysis: data.security_and_analysis,
        has_vulnerability_alerts_enabled:
          data.security_and_analysis?.advanced_security?.status === "enabled",
        private: data.private,
        visibility: data.visibility,
      };
    } catch (error) {
      console.error("Error fetching security analysis info:", error);
      return null;
    }
  }
}
