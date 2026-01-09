import { trackGameTiming } from './analytics';

// Measure and track performance
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  // Start measuring
  static start(label: string) {
    this.marks.set(label, performance.now());
  }

  // End measuring and track
  static end(label: string, track: boolean = true) {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    if (track) {
      this.track(label, duration);
    }

    return duration;
  }

  // Track to analytics
  private static track(label: string, duration: number) {
    // Track to GA4
    if (label.includes('AI')) {
      trackGameTiming.aiResponseTime(duration);
    } else if (label.includes('Save')) {
      trackGameTiming.saveTime(duration);
    } else if (label.includes('Load')) {
      trackGameTiming.pageLoadTime(duration);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
  }

  // Measure async function
  static async measure<T>(
    label: string,
    fn: () => Promise<T>,
    track: boolean = true
  ): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, track);
      return result;
    } catch (error) {
      this.end(label, false);
      throw error;
    }
  }

  // Get Web Vitals
  static getWebVitals() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('LCP:', entry);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('FID:', entry);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('CLS:', entry);
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Get memory usage (if available)
  static getMemoryUsage() {
    // @ts-ignore
    if (performance.memory) {
      // @ts-ignore
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      
      return {
        used: (usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: (totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
        percentage: ((usedJSHeapSize / jsHeapSizeLimit) * 100).toFixed(2) + '%',
      };
    }
    return null;
  }

  // Log performance summary
  static logSummary() {
    if (import.meta.env.DEV) {
      console.group('📊 Performance Summary');
      
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
        console.log('Load Complete:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        console.log('Total Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
      }

      // Memory usage
      const memory = this.getMemoryUsage();
      if (memory) {
        console.log('Memory Used:', memory.used);
        console.log('Memory Total:', memory.total);
        console.log('Memory Usage:', memory.percentage);
      }

      console.groupEnd();
    }
  }
}

// Convenience functions
export const perf = {
  start: (label: string) => PerformanceMonitor.start(label),
  end: (label: string, track?: boolean) => PerformanceMonitor.end(label, track),
  measure: <T,>(label: string, fn: () => Promise<T>, track?: boolean) => 
    PerformanceMonitor.measure(label, fn, track),
  getWebVitals: () => PerformanceMonitor.getWebVitals(),
  getMemory: () => PerformanceMonitor.getMemoryUsage(),
  logSummary: () => PerformanceMonitor.logSummary(),
};
