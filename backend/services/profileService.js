const pool = require('../config/database');

class ProfileService {
  /**
   * Create or update a profile with GitHub data
   * @param {Object} profileData - GitHub profile data
   * @returns {Promise<number>} Profile ID
   */
  static async saveProfile(profileData) {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO profiles (
          github_id, username, name, bio, avatar_url, profile_url,
          location, company, blog_url, email, public_repos,
          followers, following, total_gists, public_gists,
          account_created_at, is_hireable, analysis_status, last_analyzed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          bio = VALUES(bio),
          avatar_url = VALUES(avatar_url),
          location = VALUES(location),
          company = VALUES(company),
          blog_url = VALUES(blog_url),
          email = VALUES(email),
          public_repos = VALUES(public_repos),
          followers = VALUES(followers),
          following = VALUES(following),
          total_gists = VALUES(total_gists),
          public_gists = VALUES(public_gists),
          is_hireable = VALUES(is_hireable),
          analysis_status = 'completed',
          last_analyzed_at = NOW(),
          updated_at = NOW()
      `;

      const values = [
        profileData.id,
        profileData.login,
        profileData.name,
        profileData.bio,
        profileData.avatar_url,
        profileData.html_url,
        profileData.location,
        profileData.company,
        profileData.blog,
        profileData.email,
        profileData.public_repos,
        profileData.followers,
        profileData.following,
        // profileData.public_gists + profileData.private_gists,
        profileData.public_gists + (profileData.private_gists || 0),
        profileData.public_gists,
        // profileData.created_at,
        new Date(profileData.created_at),
        profileData.hireable,
        'completed',
        new Date()
      ];

      const [result] = await connection.execute(query, values);
      return result.insertId || await this.getProfileIdByUsername(profileData.login);
    } finally {
      connection.release();
    }
  }

  /**
   * Save repository data for a profile
   * @param {number} profileId - Profile ID
   * @param {Array} repos - Array of repository objects
   */
  static async saveRepositories(profileId, repos) {
    const connection = await pool.getConnection();
    try {
      // Clear existing repositories
      await connection.execute('DELETE FROM user_repositories WHERE profile_id = ?', [profileId]);

      // Insert new repositories
      const query = `
        INSERT INTO user_repositories (
          profile_id, repo_name, repo_full_name, repo_url, description,
          language, stars, forks, watchers, open_issues,
          is_fork, is_private, created_at, updated_at, pushed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const repo of repos) {
        const values = [
          profileId,
          repo.name,
          repo.full_name,
          repo.html_url,
          repo.description,
          repo.language,
          repo.stargazers_count,
          repo.forks_count,
          repo.watchers_count,
          repo.open_issues_count,
          repo.fork,
          repo.private,
          // repo.created_at,
          // repo.updated_at,
          // repo.pushed_at
          new Date(repo.created_at),
          new Date(repo.updated_at),
          new Date(repo.pushed_at)
        ];

        await connection.execute(query, values);
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Save analysis history snapshot
   * @param {number} profileId - Profile ID
   * @param {Object} metrics - Current metrics
   */
  static async saveAnalysisHistory(profileId, metrics) {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO analysis_history (profile_id, public_repos, followers, following, total_gists)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
        profileId,
        metrics.public_repos,
        metrics.followers,
        metrics.following,
        metrics.total_gists
      ];

      await connection.execute(query, values);
    } finally {
      connection.release();
    }
  }

  /**
   * Get all analyzed profiles with pagination
   * @param {number} limit - Number of profiles per page
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} List of profiles
   */
  static async getAllProfiles(limit = 20, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          id, github_id, username, name, bio, avatar_url, profile_url,
          followers, following, public_repos, total_gists,
          analysis_status, last_analyzed_at, created_at
        FROM profiles
        ORDER BY last_analyzed_at DESC
        LIMIT ? OFFSET ?
      `;

      // const [rows] = await connection.execute(query, [limit, offset]);
      const [rows] = await connection.query(
        `
        SELECT
          id,
          github_id,
          username,
          name,
          bio,
          avatar_url,
          profile_url,
          followers,
          following,
          public_repos,
          total_gists,
          analysis_status,
          last_analyzed_at,
          created_at
        FROM profiles
        ORDER BY last_analyzed_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
        `
      );

      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of analyzed profiles
   * @returns {Promise<number>} Total count
   */
  static async getTotalProfilesCount() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM profiles');
      return rows[0].count;
    } finally {
      connection.release();
    }
  }

  /**
   * Get detailed profile with repositories and metrics
   * @param {string} username - GitHub username
   * @returns {Promise<Object>} Detailed profile data
   */
  static async getProfileWithDetails(username) {
    const connection = await pool.getConnection();
    try {
      // Get profile
      const [profiles] = await connection.execute(
        'SELECT * FROM profiles WHERE username = ?',
        [username]
      );

      if (profiles.length === 0) {
        return null;
      }

      const profile = profiles[0];

      // Get repositories
      const [repos] = await connection.execute(
        'SELECT * FROM user_repositories WHERE profile_id = ? ORDER BY stars DESC LIMIT 20',
        [profile.id]
      );

      // Get analysis history (last 10 records)
      const [history] = await connection.execute(
        'SELECT * FROM analysis_history WHERE profile_id = ? ORDER BY timestamp DESC LIMIT 10',
        [profile.id]
      );

      // Parse JSON fields
      // if (profile.public_repo_languages) {
      //   profile.public_repo_languages = JSON.parse(profile.public_repo_languages);
      // }
      
      // Parse JSON only if it's a string

      if (typeof profile.public_repo_languages === "string") {
        profile.public_repo_languages = JSON.parse(profile.public_repo_languages);
      }

      return {
        ...profile,
        repositories: repos,
        analysisHistory: history
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get profile ID by username
   * @param {string} username - GitHub username
   * @returns {Promise<number>} Profile ID
   */
  static async getProfileIdByUsername(username) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id FROM profiles WHERE username = ?',
        [username]
      );
      return rows.length > 0 ? rows[0].id : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Update profile language analysis
   * @param {number} profileId - Profile ID
   * @param {Array} languages - Language analysis data
   */
  static async updateLanguageAnalysis(profileId, languages) {
    const connection = await pool.getConnection();
    try {
      const query = 'UPDATE profiles SET public_repo_languages = ? WHERE id = ?';
      await connection.execute(query, [JSON.stringify(languages), profileId]);
    } finally {
      connection.release();
    }
  }

  /**
   * Get statistics about analyzed profiles
   * @returns {Promise<Object>} Statistics
   */
  static async getStatistics() {
    const connection = await pool.getConnection();
    try {
      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_profiles,
          AVG(followers) as avg_followers,
          AVG(public_repos) as avg_repos,
          MAX(followers) as max_followers,
          MAX(public_repos) as max_repos
        FROM profiles
        WHERE analysis_status = 'completed'
      `);

      return stats[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Search profiles by username or name
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching profiles
   */
  static async searchProfiles(query) {
    const connection = await pool.getConnection();
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await connection.execute(
        'SELECT * FROM profiles WHERE username LIKE ? OR name LIKE ? LIMIT 20',
        [searchQuery, searchQuery]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = ProfileService;
