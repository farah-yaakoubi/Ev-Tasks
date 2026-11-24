import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

type ConfirmOptions = { title: string; message: string; confirmLabel?: string };
type PendingConfirmation = ConfirmOptions & { resolve: (confirmed: boolean) => void };
type ConfirmAction = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmAction | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const confirm = useCallback<ConfirmAction>(options => new Promise(resolve => setPending({ ...options, resolve })), []);
  const finish = useCallback((confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  }, [pending]);

  useEffect(() => {
    if (!pending) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [finish, pending]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div className="action-confirm-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) finish(false); }}>
          <section className="action-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="action-confirm-title" aria-describedby="action-confirm-message">
            <span className="action-confirm-icon"><AlertTriangle size={21} /></span>
            <h2 id="action-confirm-title">{pending.title}</h2>
            <p id="action-confirm-message">{pending.message}</p>
            <div className="action-confirm-buttons">
              <button type="button" className="action-confirm-cancel" onClick={() => finish(false)}>Annuler</button>
              <button type="button" className="action-confirm-accept" autoFocus onClick={() => finish(true)}>
                <Trash2 size={15} /> {pending.confirmLabel ?? 'Confirmer'}
              </button>
            </div>
          </section>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirmAction() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirmAction doit être utilisé dans ConfirmDialogProvider.');
  return confirm;
}
