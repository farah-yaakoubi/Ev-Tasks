import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '@/app/state/store';

export default function ActionFeedbackToast() {
  const feedback = useStore(state => state.actionFeedback);
  const dismiss = useStore(state => state.dismissActionFeedback);

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(dismiss, 4500);
    return () => window.clearTimeout(timeout);
  }, [feedback, dismiss]);

  if (!feedback) return null;
  const Icon = feedback.type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className={`action-feedback-toast ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'} aria-live={feedback.type === 'error' ? 'assertive' : 'polite'}>
      <span className="action-feedback-icon"><Icon size={20} /></span>
      <span className="action-feedback-copy">
        <strong>{feedback.type === 'error' ? 'Action impossible' : 'Action effectuée'}</strong>
        <small>{feedback.message}</small>
      </span>
      <button type="button" aria-label="Fermer le message" onClick={dismiss}><X size={16} /></button>
    </div>
  );
}
