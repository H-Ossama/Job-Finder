/**
 * Web Scraping Service with Browser Automation
 * Uses Puppeteer for reliable scraping of Morocco job sites
 * 
 * Features:
 * - Browser automation for JS-rendered content
 * - Anti-bot detection measures
 * - Request throttling and rate limiting
 * - Caching to reduce load on target sites
 * - Graceful fallbacks
 */

import puppeteer from 'puppeteer';

// Browser instance (reused for efficiency)
let browserInstance = null;
let browserLaunchPromise = null;

// Request cache to avoid hitting sites too frequently
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting
const rateLimiter = new Map();
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests per domain

/**
 * Get or create a browser instance
 */
async function getBrowser() {
    if (browserInstance && browserInstance.isConnected()) {
        return browserInstance;
    }

    // Prevent multiple simultaneous browser launches
    if (browserLaunchPromise) {
        return browserLaunchPromise;
    }

    browserLaunchPromise = puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ],
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    });

    browserInstance = await browserLaunchPromise;
    browserLaunchPromise = null;

    // Handle browser disconnect
    browserInstance.on('disconnected', () => {
        browserInstance = null;
    });

    return browserInstance;
}

/**
 * Close the browser instance
 */
export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

/**
 * Check rate limit for a domain
 */
function checkRateLimit(domain) {
    const lastRequest = rateLimiter.get(domain);
    const now = Date.now();

    if (lastRequest && now - lastRequest < MIN_REQUEST_INTERVAL) {
        return false;
    }

    rateLimiter.set(domain, now);
    return true;
}

/**
 * Wait for rate limit to be available
 */
async function waitForRateLimit(domain) {
    const lastRequest = rateLimiter.get(domain);
    if (lastRequest) {
        const waitTime = MIN_REQUEST_INTERVAL - (Date.now() - lastRequest);
        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    rateLimiter.set(domain, Date.now());
}

/**
 * Get cached response or null
 */
function getCachedResponse(url) {
    const cached = requestCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

/**
 * Cache a response
 */
function cacheResponse(url, data) {
    requestCache.set(url, {
        data,
        timestamp: Date.now(),
    });

    // Clean old cache entries periodically
    if (requestCache.size > 100) {
        const now = Date.now();
        for (const [key, value] of requestCache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
                requestCache.delete(key);
            }
        }
    }
}

/**
 * Scrape a page with Puppeteer
 * 
 * @param {string} url - URL to scrape
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} - Scraped data
 */
export async function scrapePage(url, options = {}) {
    const {
        waitForSelector = null,
        waitTime = 2000,
        extractScript = null,
        useCache = true,
        timeout = 30000,
    } = options;

    // Check cache first
    if (useCache) {
        const cached = getCachedResponse(url);
        if (cached) {
            console.log(`📦 Cache hit: ${url}`);
            return cached;
        }
    }

    // Extract domain for rate limiting
    const domain = new URL(url).hostname;
    await waitForRateLimit(domain);

    let browser = null;
    let page = null;

    try {
        browser = await getBrowser();
        page = await browser.newPage();

        // Set realistic user agent
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // Set extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        });

        // Block unnecessary resources for faster loading
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        // Navigate to page
        console.log(`🌐 Scraping: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout,
        });

        // Wait for specific selector if provided
        if (waitForSelector) {
            await page.waitForSelector(waitForSelector, { timeout: 10000 }).catch(() => {
                console.log(`⚠️ Selector not found: ${waitForSelector}`);
            });
        }

        // Additional wait for dynamic content
        if (waitTime > 0) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Extract data
        let result;
        if (extractScript) {
            result = await page.evaluate(extractScript);
        } else {
            // Default: return HTML and any JSON-LD data
            result = await page.evaluate(() => {
                const html = document.documentElement.outerHTML;
                
                // Extract JSON-LD structured data
                const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
                const jsonLdData = [];
                jsonLdScripts.forEach(script => {
                    try {
                        jsonLdData.push(JSON.parse(script.textContent));
                    } catch (e) {
                        // Skip invalid JSON
                    }
                });

                return {
                    html,
                    jsonLd: jsonLdData,
                    title: document.title,
                    url: window.location.href,
                };
            });
        }

        // Cache the result
        if (useCache) {
            cacheResponse(url, result);
        }

        return result;

    } catch (error) {
        console.error(`❌ Scrape error for ${url}:`, error.message);
        throw error;
    } finally {
        if (page) {
            await page.close().catch(() => {});
        }
    }
}

/**
 * Scrape multiple pages in parallel with rate limiting
 * 
 * @param {Array<{url: string, options?: Object}>} pages - Pages to scrape
 * @param {number} concurrency - Max concurrent pages
 * @returns {Promise<Array>} - Results
 */
export async function scrapePages(pages, concurrency = 3) {
    const results = [];
    const queue = [...pages];

    const worker = async () => {
        while (queue.length > 0) {
            const { url, options } = queue.shift();
            try {
                const result = await scrapePage(url, options);
                results.push({ url, success: true, data: result });
            } catch (error) {
                results.push({ url, success: false, error: error.message });
            }
        }
    };

    // Start workers
    const workers = Array(Math.min(concurrency, pages.length))
        .fill(null)
        .map(() => worker());

    await Promise.all(workers);

    return results;
}

/**
 * Extract job listings from scraped HTML
 * Common patterns for Moroccan job sites
 */
export function extractJobsFromHtml(html, patterns = {}) {
    const {
        jobSelector = '.job-listing, .offre, article.job, .job-item',
        titleSelector = 'h2 a, h3 a, .job-title, .titre-offre',
        companySelector = '.company, .entreprise, .employer',
        locationSelector = '.location, .ville, .lieu',
        dateSelector = '.date, .posted-date, time',
        urlSelector = 'a[href]',
        descriptionSelector = '.description, .excerpt, .resume',
    } = patterns;

    const jobs = [];

    // This would be used with JSDOM in Node.js or directly in browser context
    // For Puppeteer, we'd use page.evaluate with these selectors

    return jobs;
}

export default {
    scrapePage,
    scrapePages,
    closeBrowser,
    extractJobsFromHtml,
};
