const axios = require('axios');
require('dotenv').config();

const GITHUB_API_BASE = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Create axios instance with GitHub configuration
const githubClient = axios.create({
  baseURL: GITHUB_API_BASE,
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
  },
  timeout: 10000
});

class GitHubService {
  /**
   * Fetch user profile data from GitHub
   * @param {string} username - GitHub username
   * @returns {Promise<Object>} User profile data
   */
  static async fetchUserProfile(username) {
    try {
      const response = await githubClient.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`GitHub user "${username}" not found`);
      }
      throw new Error(`GitHub API Error: ${error.message}`);
    }
  }

  /**
   * Fetch user repositories
   * @param {string} username - GitHub username
   * @param {number} per_page - Number of repos per page
   * @returns {Promise<Array>} Array of repositories
   */
  static async fetchUserRepositories(username, per_page = 100) {
    try {
      const repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 5) { // Limit to 500 repos max
        const response = await githubClient.get(`/users/${username}/repos`, {
          params: {
            per_page,
            page,
            sort: 'updated',
            direction: 'desc',
            type: 'owner'
          }
        });

        repos.push(...response.data);
        hasMore = response.data.length === per_page;
        page++;
      }

      return repos;
    } catch (error) {
      console.error(`Error fetching repos for ${username}:`, error.message);
      return [];
    }
  }

  /**
   * Analyze language distribution from repositories
   * @param {Array} repos - Array of repository objects
   * @returns {Object} Language distribution
   */
  static analyzeLanguages(repos) {
    const languages = {};
    let totalRepos = 0;

    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
        totalRepos++;
      }
    });

    // Sort by frequency and calculate percentages
    const sorted = Object.entries(languages)
      .map(([lang, count]) => ({
        language: lang,
        count,
        percentage: ((count / totalRepos) * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count);

    return sorted;
  }

  /**
   * Calculate advanced metrics from repositories
   * @param {Array} repos - Array of repository objects
   * @returns {Object} Advanced metrics
   */
  static calculateMetrics(repos) {
    const metrics = {
      totalStars: 0,
      totalForks: 0,
      totalWatchers: 0,
      mostStarredRepo: null,
      mostForkedRepo: null,
      averageStarsPerRepo: 0,
      repoCount: repos.length,
      forkedCount: 0
    };

    let maxStars = 0;
    let maxForks = 0;

    repos.forEach(repo => {
      metrics.totalStars += repo.stargazers_count || 0;
      metrics.totalForks += repo.forks_count || 0;
      metrics.totalWatchers += repo.watchers_count || 0;

      if (repo.fork) metrics.forkedCount++;

      // Track most starred
      if (repo.stargazers_count > maxStars) {
        maxStars = repo.stargazers_count;
        metrics.mostStarredRepo = {
          name: repo.name,
          stars: repo.stargazers_count,
          url: repo.html_url
        };
      }

      // Track most forked
      if (repo.forks_count > maxForks) {
        maxForks = repo.forks_count;
        metrics.mostForkedRepo = {
          name: repo.name,
          forks: repo.forks_count,
          url: repo.html_url
        };
      }
    });

    metrics.averageStarsPerRepo = repos.length > 0 
      ? (metrics.totalStars / repos.length).toFixed(2) 
      : 0;

    return metrics;
  }

  /**
   * Get API rate limit information
   * @returns {Promise<Object>} Rate limit data
   */
  static async getRateLimit() {
    try {
      const response = await githubClient.get('/rate_limit');
      return response.data;
    } catch (error) {
      console.error('Error fetching rate limit:', error.message);
      return null;
    }
  }
}

module.exports = GitHubService;
