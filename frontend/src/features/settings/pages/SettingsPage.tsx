import { Moon, Sun, Monitor, CircleCheck, Clock3 } from 'lucide-react';
import { useStore } from '@/app/state/store';
import '@/features/profile/pages/ProfilePage.css';
import './SettingsPage.css';

export default function SettingsPage(){
  const state=useStore();
  const preferences=state.profilePreferences[state.activeUserId]??{textSize:'large' as const};
  return <div className="workspace-page app-settings-page">
    <header className="workspace-heading"><div><div className="eyebrow">MON ESPACE PERSONNEL</div><h1>Paramètres</h1><p>Personnalise l’apparence et le confort d’utilisation de la plateforme.</p></div></header>
    <section className="profile-settings-card settings-appearance-card">
      <header><span className="profile-settings-icon purple">{state.darkMode?<Moon size={17}/>:<Sun size={17}/>}</span><div><h2>Apparence</h2><p>Choisis le thème et la taille de texte de ton interface.</p></div></header>
      <div className="settings-option-row"><span className="settings-option-icon">{state.darkMode?<Moon size={18}/>:<Sun size={18}/>}</span><div><strong>Mode sombre</strong><small>Utilise une interface foncée sur cet appareil.</small></div><button type="button" role="switch" aria-label="Activer le mode sombre" aria-checked={state.darkMode} className={`account-dark-switch ${state.darkMode?'enabled':''}`} onClick={state.toggleDarkMode}><i/></button></div>
      <div className="settings-option-row"><span className="settings-option-icon"><Monitor size={18}/></span><div><strong>Taille du texte</strong><small>Choisis une taille plus confortable à lire.</small></div><div className="profile-choice-group"><button type="button" className={preferences.textSize==='normal'?'active':''} aria-pressed={preferences.textSize==='normal'} onClick={()=>state.setTextSize('normal')}>Standard</button><button type="button" className={preferences.textSize==='large'?'active':''} aria-pressed={preferences.textSize==='large'} onClick={()=>state.setTextSize('large')}>Agrandie</button></div></div>
    </section>
    <section className="profile-settings-card settings-appearance-card"><header><span className="profile-settings-icon green"><CircleCheck size={17}/></span><div><h2>Présence</h2><p>Ton statut reflète l’utilisation récente de la plateforme.</p></div></header><div className="settings-presence-note"><Clock3 size={17}/><span>Le statut passe hors ligne après cinq minutes sans activité dans l’application.</span></div></section>
  </div>;
}
