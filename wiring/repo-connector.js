/**
 * 🔗 Repository Connector
 * Website wiring - connects to all repos with hydrogen bonds
 */

class RepoConnector {
  constructor() {
    this.connections = {
      'dash-hub': {
        url: '/dash-hub',
        type: 'token_economy',
        bond: 'hydrogen',
        status: 'online',
        endpoints: {
          economy: '/dash-hub/economy',
          balance: '/dash-hub/balance',
          transactions: '/dash-hub/transactions'
        }
      },
      'banksy': {
        url: '/banksy',
        type: 'art_assets',
        bond: 'hydrogen',
        status: 'online',
        endpoints: {
          gallery: '/banksy/gallery',
          upload: '/banksy/upload'
        }
      },
      'token-mint': {
        url: '/token-mint',
        type: 'receipts',
        bond: 'hydrogen',
        status: 'online',
        endpoints: {
          mint: '/token-mint/mint',
          receipts: '/token-mint/receipts'
        }
      },
      'pricing-engine': {
        url: '/pricing-engine',
        type: 'values',
        bond: 'hydrogen',
        status: 'online',
        endpoints: {
          calculate: '/pricing-engine/calculate',
          quote: '/pricing-engine/quote'
        }
      },
      'facet-commerce': {
        url: '/facet-commerce',
        type: 'products',
        bond: 'hydrogen',
        status: 'online',
        endpoints: {
          products: '/facet-commerce/products',
          cart: '/facet-commerce/cart',
          checkout: '/facet-commerce/checkout'
        }
      }
    };

    this.dominoUpdate = {
      enabled: true,
      propagation: 'cascade',
      backup: 'multi_location'
    };
  }

  /**
   * Connect to a repository
   */
  async connect(repoName) {
    const repo = this.connections[repoName];
    if (!repo) {
      return {
        success: false,
        error: `Repository ${repoName} not found in connections`
      };
    }

    try {
      // Test connection with a ping
      const response = await fetch(repo.url + '/health', {
        method: 'GET',
        headers: {
          'X-Wiring': 'hydrogen-bond',
          'X-Source': 'index-designer'
        }
      });

      repo.status = response.ok ? 'online' : 'offline';
      repo.lastCheck = new Date().toISOString();

      return {
        success: response.ok,
        repo: repoName,
        status: repo.status,
        bond: repo.bond
      };
    } catch (err) {
      repo.status = 'error';
      return {
        success: false,
        repo: repoName,
        error: err.message
      };
    }
  }

  /**
   * Connect to all repositories
   */
  async connectAll() {
    const results = {};
    
    for (const repoName of Object.keys(this.connections)) {
      results[repoName] = await this.connect(repoName);
    }

    return {
      total: Object.keys(this.connections).length,
      online: Object.values(results).filter(r => r.success).length,
      offline: Object.values(results).filter(r => !r.success).length,
      results
    };
  }

  /**
   * Get wiring status
   */
  getWiringStatus() {
    return {
      connections: this.connections,
      dominoUpdate: this.dominoUpdate,
      hydrogenBonds: Object.keys(this.connections).length,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Propagate update via domino effect
   */
  async propagateUpdate(updateData) {
    if (!this.dominoUpdate.enabled) {
      return {
        success: false,
        message: 'Domino updates disabled'
      };
    }

    const results = [];
    
    for (const [repoName, repo] of Object.entries(this.connections)) {
      try {
        const response = await fetch(repo.url + '/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Wiring': 'hydrogen-bond',
            'X-Source': 'index-designer',
            'X-Domino': 'cascade'
          },
          body: JSON.stringify({
            ...updateData,
            timestamp: new Date().toISOString(),
            propagation: 'domino'
          })
        });

        results.push({
          repo: repoName,
          success: response.ok,
          status: response.status
        });
      } catch (err) {
        results.push({
          repo: repoName,
          success: false,
          error: err.message
        });
      }
    }

    return {
      propagated: true,
      method: 'domino',
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  /**
   * Backup documentation to multiple locations
   */
  async backupDocumentation(docs) {
    const backupLocations = [
      '/dash-hub/docs',
      '/token-mint/docs',
      '/banksy/docs'
    ];

    const results = [];

    for (const location of backupLocations) {
      try {
        const response = await fetch(location + '/backup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Wiring': 'hydrogen-bond',
            'X-Source': 'index-designer'
          },
          body: JSON.stringify({
            docs,
            timestamp: new Date().toISOString()
          })
        });

        results.push({
          location,
          success: response.ok,
          status: response.status
        });
      } catch (err) {
        results.push({
          location,
          success: false,
          error: err.message
        });
      }
    }

    return {
      backed_up: true,
      locations: backupLocations.length,
      results,
      successful: results.filter(r => r.success).length
    };
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const online = Object.values(this.connections).filter(r => r.status === 'online').length;
    const offline = Object.values(this.connections).filter(r => r.status === 'offline').length;
    
    return {
      total: Object.keys(this.connections).length,
      online,
      offline,
      healthPercentage: (online / Object.keys(this.connections).length) * 100,
      bonds: 'hydrogen',
      dominoEnabled: this.dominoUpdate.enabled
    };
  }

  /**
   * Test all connections
   */
  async testConnections() {
    console.log('🔗 Testing repository connections...');
    const results = await this.connectAll();
    console.log('✅ Connection test complete:', results);
    return results;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RepoConnector;
}

export default RepoConnector;
