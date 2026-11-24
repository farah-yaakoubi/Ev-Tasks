import { Archive, BarChart3, CalendarDays, CheckSquare, ChevronDown, ClipboardCheck, Files, FolderKanban, Home, MessageSquare, Settings, UserRound, Users, MessagesSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useStore, type Page } from '@/app/state/store';

const items: [Page,string,LucideIcon][] = [
  ['overview','Accueil',Home],['projects','Mes projets',FolderKanban],['tasks','Mes tâches',CheckSquare],
  ['planning','Planning',CalendarDays],['team','Équipe',Users],['messages','Messages',MessageSquare],
  ['forum','Forum',MessagesSquare],['files','Fichiers & livrables',Files],['reporting','Reporting',BarChart3],
  ['evaluations','Évaluations',ClipboardCheck],['archives','Archives',Archive],['settings','Paramètres',Settings],
];

export default function Sidebar({onNavigate=()=>{},collapsed=false,onToggleCollapse=()=>{}}:{onNavigate?:()=>void;collapsed?:boolean;onToggleCollapse?:()=>void}){
  const state=useStore();
  const [profileOpen,setProfileOpen]=useState(false);
  const user=state.users.find(member=>member.id===state.activeUserId);
  const visible=items.filter(([key])=>state.role==='directeur'||(key!=='reporting'&&key!=='evaluations'));
  const taskCount=state.tasks.filter(task=>!task.archived&&(state.role==='directeur'||task.assigneeIds.includes(state.activeUserId))).length;
  const messageCount=state.privateMessages.filter(message=>message.recipientId===state.activeUserId&&!message.seenBy.includes(state.activeUserId)).length;
  return <aside className={`app-sidebar ev-sidebar ${collapsed?'is-collapsed':''}`} aria-label="Navigation principale">
    <button className="ev-brand" onClick={()=>{state.setPage('overview');onNavigate()}} aria-label="EV Tasks, accueil"><span className="ev-brand-image"><img src="/espace-vert-logo.png" alt="Espace Vert — innovation, qualité, rentabilité"/></span></button>
    <button className="ev-collapse-button" type="button" aria-label={collapsed?'Développer le menu':'Réduire le menu'} aria-pressed={collapsed} title={collapsed?'Développer le menu':'Réduire le menu'} onClick={onToggleCollapse}>{collapsed?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button>
    <div className="ev-workspace-switch"><i/><span>Service Marketing</span><ChevronDown size={14}/></div>
    <nav className="ev-nav">
      <span className="ev-nav-label">ESPACE DE TRAVAIL</span>
      {visible.filter(([key])=>['overview','projects','tasks','planning','team'].includes(key)).map(([key,label,Icon])=><button key={key} title={collapsed?label:undefined} aria-label={collapsed?label:undefined} aria-current={state.page===key?'page':undefined} onClick={()=>{if(key==='tasks')state.openProject(null);state.setPage(key);onNavigate()}} className={`ev-nav-item ${state.page===key?'active':''}`}><Icon size={18}/><span>{label}</span>{key==='tasks'&&taskCount>0&&<b className="ev-nav-count">{taskCount}</b>}</button>)}
      <span className="ev-nav-label ev-nav-spaced">COLLABORATION</span>
      {visible.filter(([key])=>['messages','forum','files'].includes(key)).map(([key,label,Icon])=><button key={key} title={collapsed?label:undefined} aria-label={collapsed?label:undefined} aria-current={state.page===key?'page':undefined} onClick={()=>{state.setPage(key);onNavigate()}} className={`ev-nav-item ${state.page===key?'active':''}`}><Icon size={18}/><span>{label}</span>{key==='messages'&&messageCount>0&&<b className="ev-nav-count unread">{messageCount}</b>}</button>)}
      <span className="ev-nav-label ev-nav-spaced">SUIVI</span>
      {visible.filter(([key])=>['reporting','evaluations','archives','settings'].includes(key)).map(([key,label,Icon])=><button key={key} title={collapsed?label:undefined} aria-label={collapsed?label:undefined} aria-current={state.page===key?'page':undefined} onClick={()=>{state.setPage(key);onNavigate()}} className={`ev-nav-item ${state.page===key?'active':''}`}><Icon size={18}/><span>{label}</span></button>)}
    </nav>
    <div className="ev-sidebar-profile-wrap"><button className="ev-sidebar-profile" aria-expanded={profileOpen} aria-haspopup="menu" onClick={()=>setProfileOpen(open=>!open)}><span className="ev-profile-avatar">{user?.avatarDataUrl?<img src={user.avatarDataUrl} alt=""/>:user?.name.split(' ').map(part=>part[0]).join('')}</span><span><strong>{user?.name}</strong><small>{user?.title}</small></span><ChevronDown size={15}/></button>{profileOpen&&<div className="ev-profile-switcher" role="menu"><button type="button" role="menuitem" className="profile-switcher-open" onClick={()=>{state.setPage('profile');setProfileOpen(false);onNavigate()}}><UserRound size={15}/><span>Mon profil et mes réglages</span></button><strong>Changer de compte</strong><small>Compte de démonstration</small>{state.users.map(member=><button type="button" role="menuitem" key={member.id} className={member.id===state.activeUserId?'current':''} onClick={()=>{state.setActiveUser(member.id);setProfileOpen(false);onNavigate()}}><i>{member.avatarDataUrl?<img src={member.avatarDataUrl} alt=""/>:member.name.split(' ').map(part=>part[0]).join('')}</i><span><b>{member.name}</b><small>{member.title}</small></span>{member.id===state.activeUserId&&<CheckSquare size={15}/>}</button>)}</div>}</div>
  </aside>;
}
