import { useRef, useState, type FormEvent, type TouchEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import type { User } from '@/shared/types';
import type { SessionUser } from '../services/auth-client';
import './LoginPage.css';

interface LoginPageProps {
  demoUsers: User[];
  onDemoAccess: (userId: string) => void;
  onLogin: (email: string, password: string) => Promise<SessionUser>;
}

type AuthScreen = 'welcome' | 'login';
const swipeDistance = 70;

export default function LoginPage({ demoUsers, onDemoAccess, onLogin }: LoginPageProps) {
  const [screen, setScreen] = useState<AuthScreen>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverUnavailable, setServerUnavailable] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const goTo = (next: AuthScreen) => {
    if (next === screen) return;
    setNotice('');
    setScreen(next);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < swipeDistance) return;
    if (screen === 'welcome' && delta < 0) goTo('login');
    if (screen === 'login' && delta > 0) goTo('welcome');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setServerUnavailable(false);
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (error) {
      const message = error instanceof TypeError ? 'Le serveur d’authentification est injoignable. Le formulaire ne peut pas vérifier ce compte pour le moment.' : error instanceof Error ? error.message : 'La connexion a échoué. Réessayez.';
      setNotice(message);
      setServerUnavailable(error instanceof TypeError || /serveur|indisponible|pas encore relié/i.test(message));
    } finally {
      setSubmitting(false);
    }
  };

  const panelTransition = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 190, damping: 25, mass: 1.05 };
  const contentTransition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 0.7, 0.25, 1] as const };

  return (
    <main className="ev-auth-page">
      <section className={`ev-auth-card ev-auth-card-${screen}`} aria-label="Espace Service Marketing EV TASKS" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <motion.div className="ev-auth-content-panel" layout transition={{ layout: panelTransition }} style={{ gridColumn: screen === 'welcome' ? 1 : 2, gridRow: 1 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={screen} className="ev-auth-content-inner" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={contentTransition}>
              {screen === 'welcome' ? (
                <div className="ev-auth-welcome-copy">
                  <span className="ev-auth-overline">SERVICE MARKETING · GROUPE ESPACE VERT</span>
                  <h1>Simplifiez la gestion de vos projets marketing.</h1>
                  <p className="ev-auth-welcome-description">Retrouvez vos projets, vos tâches et les échanges de votre équipe dans un espace sécurisé.</p>
                  <ul className="ev-auth-benefits">
                    <li><span><Check size={18} /></span>Gestion sécurisée</li>
                    <li><span><Check size={18} /></span>Outils performants</li>
                    <li><span><Check size={18} /></span>Accès rapide</li>
                  </ul>
                  <button className="ev-auth-outline-button ev-auth-welcome-cta" onClick={() => goTo('login')}>Accéder à la connexion <ArrowRight size={19} /></button>
                </div>
              ) : (
                <section className="ev-auth-form-panel">
                  <div className="ev-auth-form-inner">
                    <span className="ev-auth-section-label"><i /> SERVICE MARKETING</span>
                    <h1>Connexion</h1>
                    <p className="ev-auth-form-description">Connectez-vous pour accéder à l’espace Marketing.</p>
                    <form className="ev-auth-form" onSubmit={submit}>
                      <label htmlFor="login-email">Adresse e-mail</label>
                      <div className="ev-auth-field"><Mail size={18} aria-hidden="true" /><input id="login-email" type="email" autoComplete="username" placeholder="nom@espacevert.tn" value={email} onChange={event => setEmail(event.target.value)} required /></div>
                      <label className="ev-auth-password-label" htmlFor="login-password">Mot de passe</label>
                      <div className="ev-auth-field"><LockKeyhole size={18} aria-hidden="true" /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Saisissez votre mot de passe" value={password} onChange={event => setPassword(event.target.value)} required /><button className="ev-auth-eye" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
                      <button className="ev-auth-submit" type="submit" disabled={submitting}>{submitting ? 'Connexion…' : 'Se connecter'} {!submitting && <ArrowRight size={20} />}</button>
                      {notice && <div className="ev-auth-notice" role="status"><p>{notice}</p>{serverUnavailable && <button type="button" onClick={() => setShowDemoUsers(true)}>Ouvrir les profils de démonstration <ArrowRight size={15} /></button>}</div>}
                    </form>
                    <div className="ev-auth-protected"><ShieldCheck size={17} /><span>Accès sécurisé · Session protégée</span></div>
                    <div className="ev-auth-demo">
                      <button type="button" className="ev-auth-demo-toggle" aria-expanded={showDemoUsers} onClick={() => setShowDemoUsers(value => !value)}>{showDemoUsers ? 'Masquer les profils de démonstration' : 'Accéder aux profils de démonstration'}</button>
                      {showDemoUsers && <div className="ev-auth-demo-list">{demoUsers.map(user => <button key={user.id} type="button" onClick={() => onDemoAccess(user.id)}><span>{user.avatarDataUrl ? <img src={user.avatarDataUrl} alt="" /> : user.name.split(' ').map(part => part[0]).join('')}</span><span><strong>{user.name}</strong><small>{user.title}</small></span><ArrowRight size={15} /></button>)}</div>}
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.aside className={`ev-auth-green-panel ev-auth-green-${screen}`} layout transition={{ layout: panelTransition }} style={{ gridColumn: screen === 'welcome' ? 2 : 1, gridRow: 1 }}>
          <img className="ev-auth-logo" src="/espace-vert-logo.png" alt="Groupe Espace Vert" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={screen} className="ev-auth-panel-copy" initial={{ opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={contentTransition}>
              {screen === 'welcome' ? <>
                <h2>Bienvenue dans votre espace Marketing.</h2>
                <p>Connectez-vous pour retrouver l’activité et les projets de votre équipe.</p>
                <button className="ev-auth-outline-button" onClick={() => goTo('login')}>Se connecter <ArrowRight size={19} /></button>
              </> : <>
                <h2>Content de vous retrouver.</h2>
                <p>Votre espace du Service Marketing est prêt.</p>
                <button className="ev-auth-outline-button" onClick={() => goTo('welcome')}><ArrowLeft size={19} /> Retour à l’accueil</button>
              </>}
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      </section>
      <footer className="ev-auth-copyright">© {new Date().getFullYear()} Groupe Espace Vert <span>·</span> Service Marketing · EV TASKS</footer>
    </main>
  );
}
