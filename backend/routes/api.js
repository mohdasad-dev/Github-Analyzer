const express = require('express');
const router = express.Router();
const Joi = require('joi');
const GitHubService = require('../services/githubService');
const ProfileService = require('../services/profileService');
const { validateRequest, validateUsername } = require('../middleware/validation');

/**
 * POST /api/analyze
 * Analyze a GitHub user profile and store insights
 */
router.post('/analyze', validateRequest('body', {
  // username: Joi.string().alphanum().required().min(1).max(39)
  username: Joi.string().pattern(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/).required().messages({
    'string.pattern.base': 'Invalid GitHub username format'
  })
}), async (req, res) => {
  try {
    const { username } = req.body;

    // Fetch GitHub profile
    const gitHubProfile = await GitHubService.fetchUserProfile(username);
    
    // Fetch repositories
    const repositories = await GitHubService.fetchUserRepositories(username);

    // Analyze languages
    const languages = GitHubService.analyzeLanguages(repositories);

    // Calculate metrics
    const metrics = GitHubService.calculateMetrics(repositories);

    // Save profile to database
    const profileId = await ProfileService.saveProfile(gitHubProfile);

    // Save repositories
    await ProfileService.saveRepositories(profileId, repositories);

    // Update language analysis
    await ProfileService.updateLanguageAnalysis(profileId, languages);

    // Save analysis history
    await ProfileService.saveAnalysisHistory(profileId, {
      public_repos: gitHubProfile.public_repos,
      followers: gitHubProfile.followers,
      following: gitHubProfile.following,
      total_gists: gitHubProfile.public_gists + gitHubProfile.private_gists
    });

    return res.status(200).json({
      success: true,
      message: `Profile "${username}" analyzed successfully`,
      data: {
        profile: {
          username: gitHubProfile.login,
          name: gitHubProfile.name,
          bio: gitHubProfile.bio,
          avatar_url: gitHubProfile.avatar_url,
          followers: gitHubProfile.followers,
          following: gitHubProfile.following,
          public_repos: gitHubProfile.public_repos,
          public_gists: gitHubProfile.public_gists,
          location: gitHubProfile.location,
          company: gitHubProfile.company,
          blog: gitHubProfile.blog,
          email: gitHubProfile.email,
          hireable: gitHubProfile.hireable,
          profile_url: gitHubProfile.html_url
        },
        metrics: {
          total_repositories: repositories.length,
          total_stars: metrics.totalStars,
          total_forks: metrics.totalForks,
          average_stars_per_repo: metrics.averageStarsPerRepo,
          forked_repos_count: metrics.forkedCount,
          most_starred_repo: metrics.mostStarredRepo,
          most_forked_repo: metrics.mostForkedRepo
        },
        top_languages: languages.slice(0, 10),
        repositories_count: repositories.length
      }
    });

  } catch (error) {
    console.error('Analysis Error:', error.message);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/profiles
 * Get all analyzed profiles with pagination
 */
router.get('/profiles', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const profiles = await ProfileService.getAllProfiles(limit, offset);
    const total = await ProfileService.getTotalProfilesCount();

    return res.status(200).json({
      success: true,
      data: {
        profiles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Fetch Profiles Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profiles'
    });
  }
});

/**
 * GET /api/profile/:username
 * Get detailed profile data with repositories and analysis history
 */
router.get('/profile/:username', validateUsername, async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await ProfileService.getProfileWithDetails(username);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile "${username}" not found in database`
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Fetch Profile Error:', error.message);
    // console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * GET /api/profile/:username/repositories
 * Get repositories of a specific user
 */
router.get('/profile/:username/repositories', validateUsername, async (req, res) => {
  try {
    const { username } = req.params;
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const sort = req.query.sort || 'stars'; // stars, forks, created
    const order = req.query.order || 'DESC';

    const profile = await ProfileService.getProfileWithDetails(username);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile "${username}" not found in database`
      });
    }

    let repos = profile.repositories || [];

    // Sort repositories
    if (sort === 'stars') {
      repos.sort((a, b) => order === 'DESC' ? b.stars - a.stars : a.stars - b.stars);
    } else if (sort === 'forks') {
      repos.sort((a, b) => order === 'DESC' ? b.forks - a.forks : a.forks - b.forks);
    }

    repos = repos.slice(0, limit);

    return res.status(200).json({
      success: true,
      data: {
        username,
        total_repositories: profile.repositories.length,
        repositories: repos
      }
    });

  } catch (error) {
    console.error('Fetch Repositories Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch repositories'
    });
  }
});

/**
 * GET /api/profile/:username/languages
 * Get language distribution for a user
 */
router.get('/profile/:username/languages', validateUsername, async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await ProfileService.getProfileWithDetails(username);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Profile "${username}" not found in database`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        username,
        languages: profile.public_repo_languages || []
      }
    });

  } catch (error) {
    console.error('Fetch Languages Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch language data'
    });
  }
});

/**
 * GET /api/statistics
 * Get overall statistics about analyzed profiles
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await ProfileService.getStatistics();

    return res.status(200).json({
      success: true,
      data: {
        total_analyzed_profiles: stats.total_profiles,
        average_followers: parseFloat(stats.avg_followers).toFixed(2),
        average_repositories: parseFloat(stats.avg_repos).toFixed(2),
        max_followers: stats.max_followers,
        max_repositories: stats.max_repos
      }
    });

  } catch (error) {
    console.error('Statistics Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/search
 * Search profiles by username or name
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }

    const results = await ProfileService.searchProfiles(q.trim());

    return res.status(200).json({
      success: true,
      data: {
        query: q,
        results: results,
        count: results.length
      }
    });

  } catch (error) {
    console.error('Search Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

/**
 * GET /api/rate-limit
 * Get GitHub API rate limit status
 */
router.get('/rate-limit', async (req, res) => {
  try {
    const rateLimit = await GitHubService.getRateLimit();

    if (!rateLimit) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch rate limit'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        rate_limit: rateLimit.resources.core.limit,
        remaining: rateLimit.resources.core.remaining,
        reset_at: new Date(rateLimit.resources.core.reset * 1000)
      }
    });

  } catch (error) {
    console.error('Rate Limit Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch rate limit'
    });
  }
});

module.exports = router;
