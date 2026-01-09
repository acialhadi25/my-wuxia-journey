import ReactGA from 'react-ga4';

// Initialize GA4
export const initGA = () => {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (gaId) {
    ReactGA.initialize(gaId, {
      gaOptions: {
        anonymizeIp: true,
      },
    });
    console.log('Google Analytics initialized');
  } else {
    console.warn('GA Measurement ID not found');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Game-specific tracking
export const trackGameEvent = {
  characterCreated: (name: string, origin: string, goldenFinger: string) => {
    trackEvent('Game', 'Character Created', `${origin} - ${goldenFinger}`);
  },

  actionTaken: (action: string) => {
    trackEvent('Game', 'Action Taken', action);
  },

  cultivationBreakthrough: (realm: string) => {
    trackEvent('Game', 'Cultivation Breakthrough', realm);
  },

  techniqueLearn: (technique: string) => {
    trackEvent('Game', 'Technique Learned', technique);
  },

  itemObtained: (item: string, rarity: string) => {
    trackEvent('Game', 'Item Obtained', `${rarity} - ${item}`);
  },

  tutorialCompleted: () => {
    trackEvent('Game', 'Tutorial Completed');
  },

  sessionDuration: (duration: number) => {
    trackEvent('Engagement', 'Session Duration', undefined, duration);
  },

  errorOccurred: (errorType: string, errorMessage: string) => {
    trackEvent('Error', errorType, errorMessage);
  },
};

// Track timing
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string
) => {
  ReactGA.event({
    category: 'timing',
    action: category,
    label: `${variable}${label ? ` - ${label}` : ''}`,
    value: Math.round(value),
  });
};

// Game-specific timing
export const trackGameTiming = {
  aiResponseTime: (duration: number) => {
    trackTiming('Performance', 'AI Response Time', duration);
  },

  pageLoadTime: (duration: number) => {
    trackTiming('Performance', 'Page Load Time', duration);
  },

  saveTime: (duration: number) => {
    trackTiming('Performance', 'Save Time', duration);
  },
};
