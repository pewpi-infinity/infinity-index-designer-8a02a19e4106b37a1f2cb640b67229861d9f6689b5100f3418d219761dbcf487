/**
 * 🔍 Theme Detector
 * Auto-detects repo purpose and assigns appropriate theme
 */

class ThemeDetector {
  constructor() {
    this.themePatterns = {
      mario: [
        /mario/i,
        /luigi/i,
        /mushroom/i,
        /princess/i,
        /koopa/i,
        /game/i,
        /nintendo/i
      ],
      electronics: [
        /circuit/i,
        /electronics/i,
        /hardware/i,
        /arduino/i,
        /raspberry/i,
        /pcb/i,
        /sensor/i,
        /iot/i,
        /embedded/i
      ],
      'token-wallet': [
        /token/i,
        /coin/i,
        /wallet/i,
        /crypto/i,
        /blockchain/i,
        /currency/i,
        /mint/i,
        /economy/i
      ],
      'lab-bench': [
        /lab/i,
        /experiment/i,
        /science/i,
        /research/i,
        /test/i,
        /chemistry/i,
        /physics/i
      ],
      'coin-mint': [
        /mint/i,
        /factory/i,
        /production/i,
        /manufacture/i,
        /forge/i
      ],
      'art-gallery': [
        /art/i,
        /gallery/i,
        /design/i,
        /creative/i,
        /visual/i,
        /banksy/i,
        /paint/i,
        /canvas/i
      ],
      commerce: [
        /commerce/i,
        /shop/i,
        /store/i,
        /ecommerce/i,
        /product/i,
        /cart/i,
        /checkout/i
      ],
      'dash-hub': [
        /dashboard/i,
        /hub/i,
        /admin/i,
        /control/i,
        /panel/i,
        /central/i
      ],
      pricing: [
        /price/i,
        /pricing/i,
        /cost/i,
        /rate/i,
        /value/i,
        /quote/i
      ],
      terminal: [
        /terminal/i,
        /console/i,
        /cli/i,
        /command/i,
        /shell/i
      ]
    };
  }

  /**
   * Detect the appropriate theme for a repository
   * @param {Object} repoData - Repository metadata (name, description, topics, etc.)
   * @returns {string} Theme identifier
   */
  detect(repoData) {
    const searchText = this.getSearchText(repoData);
    
    // Score each theme
    const scores = {};
    Object.keys(this.themePatterns).forEach(theme => {
      scores[theme] = this.scoreTheme(theme, searchText);
    });
    
    // Find highest scoring theme
    let bestTheme = 'default';
    let bestScore = 0;
    
    Object.entries(scores).forEach(([theme, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestTheme = theme;
      }
    });
    
    console.log('🔍 Theme detection:', {
      repo: repoData.name,
      scores,
      selected: bestTheme
    });
    
    return bestTheme;
  }

  /**
   * Combine all searchable text from repo data
   */
  getSearchText(repoData) {
    const parts = [
      repoData.name || '',
      repoData.description || '',
      ...(repoData.topics || []),
      ...(repoData.keywords || []),
      repoData.readme || ''
    ];
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Score a theme based on pattern matches
   */
  scoreTheme(theme, searchText) {
    const patterns = this.themePatterns[theme] || [];
    let score = 0;
    
    patterns.forEach(pattern => {
      if (pattern.test(searchText)) {
        score += 1;
      }
    });
    
    return score;
  }

  /**
   * Get theme metadata
   */
  getThemeInfo(theme) {
    const themes = {
      mario: {
        name: 'Mario Theme',
        icon: '🍄',
        colors: ['#e52521', '#0066cc', '#00cc00'],
        description: 'Fun and playful Mario-themed interface'
      },
      electronics: {
        name: 'Electronics Lab',
        icon: '🔌',
        colors: ['#00ff00', '#0000ff', '#ff9900'],
        description: 'Lab bench with circuits and components'
      },
      'token-wallet': {
        name: 'Token Wallet',
        icon: '🪙',
        colors: ['#ffd700', '#ff6b35', '#004e98'],
        description: 'Cryptocurrency and token management'
      },
      'lab-bench': {
        name: 'Laboratory',
        icon: '🧪',
        colors: ['#00cccc', '#9933ff', '#ff3366'],
        description: 'Scientific research and experiments'
      },
      'coin-mint': {
        name: 'Coin Mint',
        icon: '🏭',
        colors: ['#c0c0c0', '#ffd700', '#cd7f32'],
        description: 'Token production and minting'
      },
      'art-gallery': {
        name: 'Art Gallery',
        icon: '🎨',
        colors: ['#ff1744', '#00e676', '#2979ff'],
        description: 'Creative arts and design showcase'
      },
      commerce: {
        name: 'Commerce Hub',
        icon: '🛒',
        colors: ['#4caf50', '#ff9800', '#2196f3'],
        description: 'E-commerce and shopping platform'
      },
      'dash-hub': {
        name: 'Dashboard Hub',
        icon: '📊',
        colors: ['#3f51b5', '#f44336', '#4caf50'],
        description: 'Central control dashboard'
      },
      pricing: {
        name: 'Pricing Engine',
        icon: '💰',
        colors: ['#ffd700', '#4caf50', '#2196f3'],
        description: 'Price calculation and quotes'
      },
      terminal: {
        name: 'Terminal',
        icon: '💻',
        colors: ['#00ff00', '#000000', '#ffffff'],
        description: 'Command-line interface'
      },
      default: {
        name: 'Default Theme',
        icon: '🌐',
        colors: ['#00e5ff', '#0b0b0b', '#e6e6e6'],
        description: 'Clean and professional default theme'
      }
    };
    
    return themes[theme] || themes.default;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeDetector;
}

export default ThemeDetector;
