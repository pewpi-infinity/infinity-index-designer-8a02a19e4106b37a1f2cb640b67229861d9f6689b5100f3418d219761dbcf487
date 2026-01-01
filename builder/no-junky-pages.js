/**
 * ❌ No Junky Pages Validator
 * Enforces quality standards - NO placeholder content allowed!
 */

class NoJunkyPages {
  constructor() {
    this.junkyPatterns = [
      /lorem ipsum/i,
      /placeholder/i,
      /todo/i,
      /coming soon/i,
      /under construction/i,
      /test test test/i,
      /asdf/i,
      /xxx/i,
      /dummy/i,
      /sample text/i,
      /[.]{3,}/  // Multiple dots (ellipsis abuse)
    ];

    this.requiredElements = [
      'navigation',
      'content',
      'header',
      'proper_title',
      'real_description'
    ];

    this.qualityThresholds = {
      minContentLength: 500,
      minUniqueWords: 50,
      minInteractiveElements: 3,
      minLinks: 5
    };
  }

  /**
   * Main validation function - returns true if page is PROPER
   * @param {string} html - HTML content to validate
   * @returns {Object} Validation result
   */
  validate(html) {
    const results = {
      noJunkyText: this.checkJunkyText(html),
      hasRequiredElements: this.checkRequiredElements(html),
      meetsQualityThresholds: this.checkQualityThresholds(html),
      hasRealContent: this.checkRealContent(html),
      isInteractive: this.checkInteractivity(html)
    };

    const allPassed = Object.values(results).every(r => r.passed);

    return {
      passed: allPassed,
      isPropPage: allPassed,
      isJunkyPage: !allPassed,
      results,
      verdict: allPassed ? '✅ PROPER PAGE - Quality Approved!' : '❌ JUNKY PAGE - Needs Improvement!',
      score: this.calculateScore(results)
    };
  }

  /**
   * Check for junky placeholder text
   */
  checkJunkyText(html) {
    const found = [];
    
    this.junkyPatterns.forEach(pattern => {
      if (pattern.test(html)) {
        found.push(pattern.toString());
      }
    });

    return {
      passed: found.length === 0,
      issues: found,
      message: found.length > 0 
        ? `❌ Found junky patterns: ${found.join(', ')}`
        : '✅ No junky text detected'
    };
  }

  /**
   * Check for required structural elements
   */
  checkRequiredElements(html) {
    const missing = [];
    const checks = {
      navigation: /<nav/i.test(html),
      content: /<main|<article|<section/i.test(html),
      header: /<header|<h1/i.test(html),
      proper_title: /<title>(?!.*placeholder).*<\/title>/i.test(html),
      real_description: /<meta name="description" content="(?!.*placeholder).*"/i.test(html)
    };

    Object.entries(checks).forEach(([element, exists]) => {
      if (!exists) missing.push(element);
    });

    return {
      passed: missing.length === 0,
      missing,
      message: missing.length > 0
        ? `❌ Missing elements: ${missing.join(', ')}`
        : '✅ All required elements present'
    };
  }

  /**
   * Check if content meets minimum quality thresholds
   */
  checkQualityThresholds(html) {
    const textContent = this.extractTextContent(html);
    const words = textContent.split(/\s+/).filter(w => w.length > 2);
    const uniqueWords = new Set(words);
    const links = (html.match(/<a /g) || []).length;
    const interactiveElements = (html.match(/<button|<input|<select|onclick/g) || []).length;

    const checks = {
      contentLength: textContent.length >= this.qualityThresholds.minContentLength,
      uniqueWords: uniqueWords.size >= this.qualityThresholds.minUniqueWords,
      links: links >= this.qualityThresholds.minLinks,
      interactive: interactiveElements >= this.qualityThresholds.minInteractiveElements
    };

    const failed = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([key]) => key);

    return {
      passed: failed.length === 0,
      stats: {
        contentLength: textContent.length,
        uniqueWords: uniqueWords.size,
        links,
        interactiveElements
      },
      failed,
      message: failed.length > 0
        ? `❌ Quality thresholds not met: ${failed.join(', ')}`
        : '✅ All quality thresholds met'
    };
  }

  /**
   * Check for real, useful content (not generic)
   */
  checkRealContent(html) {
    const genericPhrases = [
      'welcome to our website',
      'this is a website',
      'page is under construction',
      'check back later'
    ];

    const textContent = this.extractTextContent(html).toLowerCase();
    const genericFound = genericPhrases.filter(phrase => 
      textContent.includes(phrase)
    );

    const hasSpecificFeatures = html.includes('ALC') || 
                                html.includes('INDEX_BUILDER') ||
                                html.includes('token') ||
                                html.includes('theme');

    return {
      passed: genericFound.length === 0 && hasSpecificFeatures,
      genericPhrases: genericFound,
      hasSpecificFeatures,
      message: genericFound.length > 0
        ? `❌ Generic content found: ${genericFound.join(', ')}`
        : '✅ Content is specific and useful'
    };
  }

  /**
   * Check for interactive elements
   */
  checkInteractivity(html) {
    const interactiveElements = {
      buttons: (html.match(/<button/g) || []).length,
      inputs: (html.match(/<input/g) || []).length,
      clickHandlers: (html.match(/onclick/g) || []).length,
      forms: (html.match(/<form/g) || []).length,
      scripts: (html.match(/<script/g) || []).length
    };

    const totalInteractive = Object.values(interactiveElements).reduce((a, b) => a + b, 0);

    return {
      passed: totalInteractive >= 3,
      elements: interactiveElements,
      total: totalInteractive,
      message: totalInteractive >= 3
        ? '✅ Page is interactive'
        : '❌ Page lacks interactivity'
    };
  }

  /**
   * Extract text content from HTML for quality metrics analysis only.
   * 
   * SECURITY: This extracts text for analysis (word counting) ONLY.
   * Output is never rendered as HTML. Not for sanitization.
   */
  extractTextContent(html) {
    // For quality metrics: extract visible text to count words
    // Use a simple state machine to skip tag content
    
    let result = '';
    let inTag = false;
    let inScript = false;
    let inStyle = false;
    let tagBuffer = '';
    
    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      
      if (char === '<') {
        inTag = true;
        tagBuffer = '<';
      } else if (char === '>' && inTag) {
        tagBuffer += '>';
        inTag = false;
        
        // Check if this starts/ends a script or style block
        const lowerTag = tagBuffer.toLowerCase();
        if (lowerTag.includes('<script')) {
          inScript = true;
        } else if (lowerTag.includes('</script')) {
          inScript = false;
        } else if (lowerTag.includes('<style')) {
          inStyle = true;
        } else if (lowerTag.includes('</style')) {
          inStyle = false;
        }
        
        tagBuffer = '';
      } else if (inTag) {
        tagBuffer += char;
      } else if (!inScript && !inStyle) {
        // Add character to result if we're not in a tag, script, or style
        result += char;
      }
    }
    
    // Normalize whitespace
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * Calculate overall quality score (0-100)
   */
  calculateScore(results) {
    const weights = {
      noJunkyText: 30,
      hasRequiredElements: 25,
      meetsQualityThresholds: 20,
      hasRealContent: 15,
      isInteractive: 10
    };

    let score = 0;
    Object.entries(results).forEach(([key, result]) => {
      if (result.passed) {
        score += weights[key] || 0;
      }
    });

    return score;
  }

  /**
   * Get recommendations for improvement
   */
  getRecommendations(validationResult) {
    const recommendations = [];

    if (!validationResult.results.noJunkyText.passed) {
      recommendations.push('🔧 Remove all placeholder text and Lorem Ipsum');
      recommendations.push('🔧 Replace with actual, useful content');
    }

    if (!validationResult.results.hasRequiredElements.passed) {
      recommendations.push('🔧 Add missing structural elements: ' + 
        validationResult.results.hasRequiredElements.missing.join(', '));
    }

    if (!validationResult.results.meetsQualityThresholds.passed) {
      recommendations.push('🔧 Improve content quality: add more text, links, and interactive elements');
    }

    if (!validationResult.results.hasRealContent.passed) {
      recommendations.push('🔧 Replace generic content with specific, useful information');
    }

    if (!validationResult.results.isInteractive.passed) {
      recommendations.push('🔧 Add interactive elements: buttons, forms, search, etc.');
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Page is perfect! Keep up the good work!');
    }

    return recommendations;
  }

  /**
   * Luigi's encouragement message
   */
  getLuigiMessage(passed) {
    if (passed) {
      return '🟢 Luigi says: "Mamma mia! That\'s a proper page! 👍"';
    } else {
      return '🔴 Luigi says: "No no no! We need proper pages only! Try again! 💪"';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NoJunkyPages;
}

export default NoJunkyPages;
