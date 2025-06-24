import { GitHubService } from "../../lib/github";
import {
  Calendar,
  MapPin,
  Building,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

async function getProfileData() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;

  if (!username) {
    throw new Error("GitHub username not configured");
  }

  try {
    const [user, organizations, followers, following] = await Promise.all([
      GitHubService.getUser(username),
      GitHubService.getOrganizations(username),
      GitHubService.getFollowers(username),
      GitHubService.getFollowing(username),
    ]);

    return { user, organizations, followers, following };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw new Error("Failed to fetch profile data");
  }
}

export default async function Profile() {
  try {
    const { user, organizations, followers } =
      await getProfileData();

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="relative px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              <Image
                src={user.avatar_url}
                alt={user.name || user.login}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              <div className="mt-4 sm:mt-0 sm:mb-4">
                <h1 className="text-3xl font-bold text-github-900">
                  {user.name || user.login}
                </h1>
                <p className="text-lg text-github-600">@{user.login}</p>
                {user.bio && (
                  <p className="text-github-700 mt-2 max-w-2xl">{user.bio}</p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {user.location && (
                <div className="flex items-center space-x-2 text-github-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.company && (
                <div className="flex items-center space-x-2 text-github-600">
                  <Building className="h-4 w-4" />
                  <span>{user.company}</span>
                </div>
              )}
              {user.blog && (
                <div className="flex items-center space-x-2 text-github-600">
                  <LinkIcon className="h-4 w-4" />
                  <a
                    href={
                      user.blog.startsWith("http")
                        ? user.blog
                        : `https://${user.blog}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {user.blog}
                  </a>
                </div>
              )}
              {user.email && (
                <div className="flex items-center space-x-2 text-github-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center space-x-2 text-sm text-github-500">
              <Calendar className="h-4 w-4" />
              <span>
                Joined{" "}
                {formatDistanceToNow(new Date(user.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-github-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-github-600">Public Repositories</span>
                <span className="font-semibold text-github-900">
                  {user.public_repos}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-github-600">Public Gists</span>
                <span className="font-semibold text-github-900">
                  {user.public_gists}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-github-600">Followers</span>
                <span className="font-semibold text-github-900">
                  {user.followers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-github-600">Following</span>
                <span className="font-semibold text-github-900">
                  {user.following}
                </span>
              </div>
            </div>
          </div>

          {/* Organizations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-github-900 mb-4">
              Organizations
            </h2>
            {organizations.length > 0 ? (
              <div className="space-y-3">
                {organizations.slice(0, 5).map((org: any) => (
                  <div key={org.id} className="flex items-center space-x-3">
                    <Image
                      src={org.avatar_url}
                      alt={org.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-github-900">{org.login}</p>
                      {org.description && (
                        <p className="text-sm text-github-600 truncate">
                          {org.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {organizations.length > 5 && (
                  <p className="text-sm text-github-500">
                    +{organizations.length - 5} more organizations
                  </p>
                )}
              </div>
            ) : (
              <p className="text-github-500">No organizations found</p>
            )}
          </div>

          {/* Recent Followers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-github-900 mb-4">
              Recent Followers
            </h2>
            {followers.length > 0 ? (
              <div className="space-y-3">
                {followers.slice(0, 5).map((follower: any) => (
                  <div
                    key={follower.id}
                    className="flex items-center space-x-3"
                  >
                    <Image
                      src={follower.avatar_url}
                      alt={follower.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-github-900">
                        {follower.login}
                      </p>
                      <p className="text-sm text-github-600">
                        @{follower.login}
                      </p>
                    </div>
                  </div>
                ))}
                {followers.length > 5 && (
                  <p className="text-sm text-github-500">
                    +{followers.length - 5} more followers
                  </p>
                )}
              </div>
            ) : (
              <p className="text-github-500">No followers found</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">
            {error instanceof Error ? error.message : "Failed to load profile"}
          </p>
        </div>
      </div>
    );
  }
}
