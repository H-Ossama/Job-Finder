/**
 * Smart Tip Detector
 * Detects hidden keywords and bot-filter messages in job descriptions
 * These are used by companies to filter bot applications from real humans
 */

// Common patterns for hidden application keywords
const KEYWORD_PATTERNS = [
    // Direct mentions with "mention the word"
    /(?:please\s+)?mention(?:\s+the\s+word)?\s+\*{0,2}([A-Z0-9_]+)\*{0,2}/gi,
    // Tag patterns
    /tag\s+([A-Za-z0-9=+\/]+)\s+when\s+applying/gi,
    // Include word patterns
    /include(?:\s+the\s+word)?\s+["'\*]{0,2}([A-Z0-9_]+)["'\*]{0,2}\s+(?:in|when|to)/gi,
    // Say/write patterns
    /(?:please\s+)?(?:say|write|type)\s+["'\*]{0,2}([A-Z0-9_]+)["'\*]{0,2}/gi,
    // Code word patterns
    /(?:code\s*word|secret\s*word|keyword|magic\s*word)[:\s]+["'\*]{0,2}([A-Z0-9_]+)["'\*]{0,2}/gi,
    // Start with patterns
    /(?:start|begin)\s+(?:your\s+)?(?:application|email|message)\s+with\s+["'\*]{0,2}([A-Z0-9_]+)["'\*]{0,2}/gi,
    // Application instruction patterns
    /(?:to\s+(?:show|prove)|showing)\s+(?:you(?:'ve)?\s+)?(?:read|understood).*?["'\*]{0,2}([A-Z0-9_]+)["'\*]{0,2}/gi,
    // Hashtag patterns
    /#([A-Za-z0-9=+\/]{10,})/g,
    // Base64-like strings in application context
    /(?:tag|include|mention)\s+([A-Za-z0-9=+\/]{15,})/gi,
];

// Phrases that indicate bot filter context
const BOT_FILTER_CONTEXT = [
    'spam applicant',
    'human applicant',
    'read the job',
    'read this post',
    'show you\'re human',
    'show you are human',
    'prove you read',
    'beta feature',
    'filter bot',
    'avoid spam',
    'actually read',
    'carefully read',
    'attention to detail',
    'read the entire',
    'read the full',
    'read the complete',
];

/**
 * Detect hidden keywords and bot-filter messages in job descriptions
 * @param {string} description - Job description text (can be HTML)
 * @returns {Object} - Detection result
 */
export function detectSmartTips(description) {
    if (!description) {
        return { found: false, tips: [] };
    }

    // Clean HTML and get plain text for analysis
    const plainText = stripHtml(description);
    const tips = [];
    const foundKeywords = new Set();

    // Check for bot filter context
    const hasBotFilterContext = BOT_FILTER_CONTEXT.some(phrase => 
        plainText.toLowerCase().includes(phrase.toLowerCase())
    );

    // Extract keywords using patterns
    for (const pattern of KEYWORD_PATTERNS) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        
        let match;
        while ((match = pattern.exec(plainText)) !== null) {
            const keyword = match[1];
            
            // Filter out common false positives
            if (keyword && keyword.length >= 3 && !isCommonWord(keyword)) {
                foundKeywords.add(keyword);
            }
        }
    }

    // If we found keywords and there's bot filter context, this is likely a legitimate tip
    if (foundKeywords.size > 0 && hasBotFilterContext) {
        // Extract the full context sentence for each keyword
        for (const keyword of foundKeywords) {
            const context = extractContext(plainText, keyword);
            tips.push({
                type: 'hidden_keyword',
                keyword,
                context,
                instruction: `Include "${keyword}" in your application to show you read the job posting`,
            });
        }
    } else if (foundKeywords.size > 0) {
        // Keywords found but no clear bot filter context - still worth mentioning
        for (const keyword of foundKeywords) {
            // Only include if it looks like an intentional code (not common words)
            if (isLikelyCode(keyword)) {
                const context = extractContext(plainText, keyword);
                tips.push({
                    type: 'possible_keyword',
                    keyword,
                    context,
                    instruction: `This might be a keyword to include in your application: "${keyword}"`,
                });
            }
        }
    }

    // Check for base64-encoded strings that might be tracking codes
    const base64Matches = plainText.match(/[A-Za-z0-9+\/=]{20,}/g) || [];
    for (const match of base64Matches) {
        if (isValidBase64(match) && !foundKeywords.has(match)) {
            const context = extractContext(plainText, match);
            // Only add if it's in a context suggesting it should be included
            if (context.toLowerCase().includes('tag') || 
                context.toLowerCase().includes('include') ||
                context.toLowerCase().includes('mention')) {
                tips.push({
                    type: 'tracking_code',
                    keyword: match,
                    context,
                    instruction: `Include this code in your application: "${match}"`,
                });
            }
        }
    }

    return {
        found: tips.length > 0,
        tips,
        hasBotFilterContext,
    };
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract context around a keyword (the sentence containing it)
 */
function extractContext(text, keyword) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex === -1) {
        // Try case-insensitive
        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();
        const idx = lowerText.indexOf(lowerKeyword);
        if (idx === -1) return '';
        
        // Get surrounding context (up to 200 chars each side)
        const start = Math.max(0, idx - 100);
        const end = Math.min(text.length, idx + keyword.length + 100);
        return text.slice(start, end).trim();
    }
    
    // Find sentence boundaries
    const start = Math.max(0, keywordIndex - 150);
    const end = Math.min(text.length, keywordIndex + keyword.length + 150);
    
    return text.slice(start, end).trim();
}

/**
 * Check if a word is a common word (false positive)
 */
function isCommonWord(word) {
    const commonWords = [
        'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS',
        'ONE', 'OUR', 'OUT', 'HAS', 'HIS', 'HOW', 'ITS', 'MAY', 'NOW', 'OLD', 'SEE',
        'TIME', 'VERY', 'WHEN', 'WHO', 'BOY', 'DID', 'GET', 'COM', 'MADE', 'FIND',
        'LONG', 'DOWN', 'DAY', 'HAD', 'SHE', 'WILL', 'YOUR', 'FROM', 'THEY', 'BEEN',
        'HAVE', 'WITH', 'THIS', 'THAT', 'WHAT', 'WERE', 'SAID', 'EACH', 'WHICH',
        'THEIR', 'ABOUT', 'WOULD', 'THERE', 'OTHER', 'COULD', 'AFTER', 'FIRST',
        // Common tech terms
        'CODE', 'JAVA', 'DATA', 'TEAM', 'WORK', 'ROLE', 'TECH', 'TYPE', 'USER',
        'TEST', 'FULL', 'PART', 'TIME', 'PLUS', 'MORE', 'YEAR', 'MUST', 'NEED',
    ];
    return commonWords.includes(word.toUpperCase());
}

/**
 * Check if a string looks like an intentional code/keyword
 */
function isLikelyCode(str) {
    // All caps words 5+ chars are likely intentional
    if (str.length >= 5 && str === str.toUpperCase()) return true;
    
    // Contains numbers mixed with letters
    if (/[A-Z].*[0-9]|[0-9].*[A-Z]/i.test(str)) return true;
    
    // Looks like base64
    if (isValidBase64(str) && str.length >= 15) return true;
    
    // Unusual capitalization pattern
    if (/^[A-Z]{3,}$/.test(str)) return true;
    
    return false;
}

/**
 * Check if a string is valid base64
 */
function isValidBase64(str) {
    if (str.length < 15) return false;
    try {
        // Check if it's valid base64 format
        return /^[A-Za-z0-9+\/]+=*$/.test(str);
    } catch {
        return false;
    }
}

export default detectSmartTips;
