import { getBundleStats, analyzeChunks, checkBundleSize } from '../utils/bundle-analyzer';

describe('Bundle Performance Tests', () => {
  describe('Bundle Size Limits', () => {
    it('should not exceed total bundle size limit', async () => {
      const stats = await getBundleStats();
      const totalSize = stats.reduce((sum, chunk) => sum + chunk.size, 0);
      
      // Total bundle should be under 2MB
      expect(totalSize).toBeLessThan(2 * 1024 * 1024);
    });

    it('should not exceed main chunk size limit', async () => {
      const stats = await getBundleStats();
      const mainChunk = stats.find(chunk => chunk.name === 'main');
      
      expect(mainChunk).toBeDefined();
      // Main chunk should be under 1MB
      expect(mainChunk.size).toBeLessThan(1024 * 1024);
    });

    it('should not exceed vendor chunk size limit', async () => {
      const stats = await getBundleStats();
      const vendorChunk = stats.find(chunk => chunk.name.includes('vendor'));
      
      if (vendorChunk) {
        // Vendor chunk should be under 500KB
        expect(vendorChunk.size).toBeLessThan(500 * 1024);
      }
    });
  });

  describe('Code Splitting Analysis', () => {
    it('should have proper code splitting for screens', async () => {
      const analysis = await analyzeChunks();
      
      // Should have separate chunks for major screens
      const expectedChunks = [
        'MainScreen',
        'SettingsScreen',
        'StatisticsScreen',
        'OnboardingScreen'
      ];
      
      expectedChunks.forEach(chunkName => {
        const chunk = analysis.chunks.find(c => c.name.includes(chunkName));
        expect(chunk).toBeDefined();
        expect(chunk.size).toBeGreaterThan(0);
      });
    });

    it('should not have duplicate dependencies across chunks', async () => {
      const analysis = await analyzeChunks();
      const duplicates = analysis.duplicates || [];
      
      // Critical dependencies should not be duplicated
      const criticalDeps = ['react', 'react-native', 'expo'];
      
      criticalDeps.forEach(dep => {
        const duplicate = duplicates.find(d => d.name === dep);
        expect(duplicate).toBeUndefined();
      });
    });
  });

  describe('Asset Optimization', () => {
    it('should have optimized image assets', async () => {
      const stats = await getBundleStats();
      const imageAssets = stats.filter(asset => 
        /\.(png|jpg|jpeg|gif|webp)$/i.test(asset.name)
      );
      
      imageAssets.forEach(asset => {
        // Individual image should be under 100KB
        expect(asset.size).toBeLessThan(100 * 1024);
      });
    });

    it('should have compressed font assets', async () => {
      const stats = await getBundleStats();
      const fontAssets = stats.filter(asset => 
        /\.(woff|woff2|ttf|otf)$/i.test(asset.name)
      );
      
      fontAssets.forEach(asset => {
        // Font files should be under 50KB each
        expect(asset.size).toBeLessThan(50 * 1024);
      });
    });
  });

  describe('Bundle Growth Tracking', () => {
    it('should track bundle size changes over time', async () => {
      const currentStats = await getBundleStats();
      const currentSize = currentStats.reduce((sum, chunk) => sum + chunk.size, 0);
      
      // Store current size for comparison
      const sizeHistory = JSON.parse(
        process.env.BUNDLE_SIZE_HISTORY || '[]'
      );
      
      if (sizeHistory.length > 0) {
        const lastSize = sizeHistory[sizeHistory.length - 1].size;
        const growthPercentage = ((currentSize - lastSize) / lastSize) * 100;
        
        // Bundle should not grow by more than 10% between builds
        expect(growthPercentage).toBeLessThan(10);
      }
      
      // Add current size to history
      sizeHistory.push({
        timestamp: Date.now(),
        size: currentSize,
        version: process.env.npm_package_version || '1.0.0'
      });
      
      // Keep only last 10 measurements
      if (sizeHistory.length > 10) {
        sizeHistory.splice(0, sizeHistory.length - 10);
      }
    });
  });

  describe('Performance Impact Analysis', () => {
    it('should analyze parsing time for JavaScript bundles', async () => {
      const stats = await getBundleStats();
      
      for (const chunk of stats) {
        if (chunk.name.endsWith('.js')) {
          // Estimate parsing time (1KB ≈ 1ms on slow devices)
          const estimatedParsingTime = chunk.size / 1024;
          
          // JavaScript chunks should parse in under 100ms
          expect(estimatedParsingTime).toBeLessThan(100);
        }
      }
    });

    it('should verify treeshaking effectiveness', async () => {
      const analysis = await analyzeChunks();
      
      // Check for unused exports (should be minimal)
      const unusedExports = analysis.unusedExports || [];
      const unusedSize = unusedExports.reduce((sum, exp) => sum + exp.size, 0);
      
      // Unused code should be less than 5% of total bundle
      const totalSize = analysis.totalSize;
      const unusedPercentage = (unusedSize / totalSize) * 100;
      
      expect(unusedPercentage).toBeLessThan(5);
    });
  });

  describe('Critical Path Analysis', () => {
    it('should prioritize critical path resources', async () => {
      const analysis = await analyzeChunks();
      
      // Critical components should be in main chunk
      const criticalComponents = [
        'App',
        'MainScreen',
        'StudyTimer',
        'BuddyCharacter'
      ];
      
      const mainChunk = analysis.chunks.find(c => c.name === 'main');
      expect(mainChunk).toBeDefined();
      
      criticalComponents.forEach(component => {
        expect(mainChunk.modules).toContain(component);
      });
    });

    it('should defer non-critical resources', async () => {
      const analysis = await analyzeChunks();
      
      // Non-critical components should be in separate chunks
      const nonCriticalComponents = [
        'SettingsScreen',
        'StatisticsScreen',
        'OnboardingScreen'
      ];
      
      nonCriticalComponents.forEach(component => {
        const componentChunk = analysis.chunks.find(c => 
          c.modules && c.modules.includes(component)
        );
        
        expect(componentChunk).toBeDefined();
        expect(componentChunk.name).not.toBe('main');
      });
    });
  });

  describe('Mobile-Specific Optimizations', () => {
    it('should have appropriate chunk sizes for mobile networks', async () => {
      const stats = await getBundleStats();
      
      stats.forEach(chunk => {
        if (chunk.type === 'javascript') {
          // Each JS chunk should be under 200KB for 3G loading
          expect(chunk.size).toBeLessThan(200 * 1024);
        }
      });
    });

    it('should minimize main thread blocking resources', async () => {
      const analysis = await analyzeChunks();
      
      // Calculate synchronous resource size
      const syncResources = analysis.chunks.filter(chunk => 
        chunk.loadingStrategy === 'sync'
      );
      
      const syncSize = syncResources.reduce((sum, chunk) => sum + chunk.size, 0);
      
      // Synchronous resources should be under 150KB
      expect(syncSize).toBeLessThan(150 * 1024);
    });
  });
});