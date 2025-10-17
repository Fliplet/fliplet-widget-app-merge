import { createApp } from 'vue';
import Application from './Application.vue';
import AppMergeMiddleware from './middleware/middleware.js';

// Initialize middleware
const middleware = new AppMergeMiddleware();

console.log('[App Merge] Starting middleware initialization...');

// Initialize middleware asynchronously
middleware.initialize().then(() => {
  console.log('[App Merge] Middleware initialized successfully');
  console.log('[App Merge] Middleware structure:', {
    hasCore: !!middleware.core,
    hasApiClient: !!middleware.core?.apiClient,
    apiClientType: typeof middleware.core?.apiClient,
    hasGetMethod: typeof middleware.core?.apiClient?.get,
    hasPostMethod: typeof middleware.core?.apiClient?.post
  });

  // Expose middleware globally for backward compatibility
  window.FlipletAppMerge = window.FlipletAppMerge || {};
  window.FlipletAppMerge.middleware = middleware;

  // Create and mount Vue app
  const app = createApp(Application);

  // Provide middleware to all child components via Vue's dependency injection
  app.provide('middleware', middleware);

  app.config.errorHandler = (err, vm, info) => {
    console.error('[App Merge] Error:', err, info);
  };

  app.mount('#app-merge');
  console.log('[App Merge] Vue app mounted');
}).catch((err) => {
  console.error('[App Merge] Failed to initialize middleware:', err);
  console.error('[App Merge] Error stack:', err.stack);

  // Mount app anyway, but show error state
  const app = createApp(Application);

  app.config.errorHandler = (err, vm, info) => {
    console.error('[App Merge] Error:', err, info);
  };

  app.mount('#app-merge');
});
