import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './app/App';
import { queryClient } from './app/query-client';
import { ConfirmDialogProvider } from './shared/ui/ConfirmDialog';
import './app/styles/index.css';
import './app/styles/template.css';
import './app/styles/theme.css';
import './app/styles/platform-theme.css';
import './app/styles/notifications.css';
import './app/styles/task-responsive.css';
import './shared/ui/ui.css';
import './features/tasks/components/TaskDetailModal.redesign.css';
import './app/styles/modern-dark-theme.css';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ConfirmDialogProvider>
      <App />
    </ConfirmDialogProvider>
  </QueryClientProvider>,
);
