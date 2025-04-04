/**
 * GitHub API Service
 * Enhanced service for interacting with GitHub API with advanced features
 */

class GitHubApiService {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.cache = {};
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
        this.rateLimitRemaining = null;
        this.rateLimitReset = null;
    }

    /**
     * Make API request with caching and rate limit handling
     */
    async makeRequest(endpoint, params = {}) {
        const url = this.buildUrl(endpoint, params);
        const cacheKey = url;
        
        // Check cache first
        if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp) < this.cacheExpiry) {
            console.log('Using cached data for:', endpoint);
            return this.cache[cacheKey].data;
        }
        
        // Check if we're rate limited
        if (this.rateLimitRemaining !== null && this.rateLimitRemaining <= 5) {
            const waitTime = (this.rateLimitReset * 1000) - Date.now();
            if (waitTime > 0) {
                console.warn(`Rate limit almost exceeded. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
            }
        }
        
        try {
            const response = await fetch(url);
            
            // Update rate limit info
            this.rateLimitRemaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '60');
            this.rateLimitReset = parseInt(response.headers.get('X-RateLimit-Reset') || '0');
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.cache[cacheKey] = {
                data,
                timestamp: Date.now()
            };
            
            return data;
        } catch (error) {
            console.error('GitHub API request failed:', error);
            throw error;
        }
    }
    
    /**
     * Build URL with parameters
     */
    buildUrl(endpoint, params) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }
    
    /**
     * Search repositories with enhanced parameters
     */
    async searchRepositories(options = {}) {
        const {
            query,
            language,
            minStars,
            sort = 'stars',
            order = 'desc',
            page = 1,
            perPage = 10,
            createdAfter,
            updatedAfter,
            topics,
            hasWiki,
            hasIssues,
            hasProjects,
            isTemplate,
            license
        } = options;
        
        let q = query || '';
        
        if (language) q += `+language:${language}`;
        if (minStars) q += `+stars:>=${minStars}`;
        if (createdAfter) q += `+created:>${createdAfter}`;
        if (updatedAfter) q += `+pushed:>${updatedAfter}`;
        if (topics) q += `+topic:${topics}`;
        if (hasWiki !== undefined) q += `+has:wiki=${hasWiki}`;
        if (hasIssues !== undefined) q += `+has:issues=${hasIssues}`;
        if (hasProjects !== undefined) q += `+has:projects=${hasProjects}`;
        if (isTemplate !== undefined) q += `+is:template=${isTemplate}`;
        if (license) q += `+license:${license}`;
        
        return this.makeRequest('/search/repositories', {
            q,
            sort,
            order,
            page,
            per_page: perPage
        });
    }
    
    /**
     * Get trending repositories
     */
    async getTrendingRepositories(options = {}) {
        const {
            language,
            since = '7days',
            limit = 10
        } = options;
        
        let dateFilter;
        switch (since) {
            case '1day':
                dateFilter = this.getDateString(1);
                break;
            case '7days':
                dateFilter = this.getDateString(7);
                break;
            case '30days':
                dateFilter = this.getDateString(30);
                break;
            default:
                dateFilter = this.getDateString(7);
        }
        
        let query = `created:>${dateFilter}`;
        if (language) query += `+language:${language}`;
        
        return this.makeRequest('/search/repositories', {
            q: query,
            sort: 'stars',
            order: 'desc',
            per_page: limit
        });
    }
    
    /**
     * Get repository details with additional information
     */
    async getRepositoryDetails(owner, repo) {
        const repoData = await this.makeRequest(`/repos/${owner}/${repo}`);
        
        // Get additional data in parallel
        const [contributors, languages, readme] = await Promise.all([
            this.makeRequest(`/repos/${owner}/${repo}/contributors`, { per_page: 5 }),
            this.makeRequest(`/repos/${owner}/${repo}/languages`),
            this.getReadme(owner, repo).catch(() => null)
        ]);
        
        return {
            ...repoData,
            contributors,
            languages,
            readme
        };
    }
    
    /**
     * Get repository readme
     */
    async getReadme(owner, repo) {
        try {
            const data = await this.makeRequest(`/repos/${owner}/${repo}/readme`);
            // Decode content from base64
            if (data.content) {
                const content = atob(data.content.replace(/\n/g, ''));
                return content;
            }
            return null;
        } catch (error) {
            console.warn(`No README found for ${owner}/${repo}`);
            return null;
        }
    }
    
    /**
     * Get user profile information
     */
    async getUserProfile(username) {
        return this.makeRequest(`/users/${username}`);
    }
    
    /**
     * Get repository statistics
     */
    async getRepositoryStats(owner, repo) {
        const [commits, pullRequests, issues] = await Promise.all([
            this.makeRequest(`/repos/${owner}/${repo}/commits`, { per_page: 1 })
                .then(data => ({ total: parseInt(data.length > 0 ? data[0].sha : 0) }))
                .catch(() => ({ total: 0 })),
            this.makeRequest(`/repos/${owner}/${repo}/pulls`, { state: 'all', per_page: 1 })
                .then(data => ({ total: data.length }))
                .catch(() => ({ total: 0 })),
            this.makeRequest(`/repos/${owner}/${repo}/issues`, { state: 'all', per_page: 100 })
                .then(data => {
                    const open = data.filter(issue => issue.state === 'open').length;
                    const closed = data.filter(issue => issue.state === 'closed').length;
                    return { open, closed, total: open + closed };
                })
                .catch(() => ({ open: 0, closed: 0, total: 0 }))
        ]);
        
        return { commits, pullRequests, issues };
    }
    
    /**
     * Get popular repositories by topic
     */
    async getPopularByTopic(topic, limit = 5) {
        return this.makeRequest('/search/repositories', {
            q: `topic:${topic}`,
            sort: 'stars',
            order: 'desc',
            per_page: limit
        });
    }
    
    /**
     * Get date string for X days ago
     */
    getDateString(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {};
        console.log('Cache cleared');
    }
}
