import { createApp } from 'vue';
import Application from './Application.vue';

const app = createApp(Application);

app.config.errorHandler = (err, vm, info) => {
  console.error('[App Merge] Error:', err, info);
};

app.mount('#app-merge');
