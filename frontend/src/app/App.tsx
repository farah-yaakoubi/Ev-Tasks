import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCheck, Circle, Clock3, FileText, FolderKanban, Home, ListTodo, MessageCircle, Paperclip, RotateCcw, Target, BriefcaseBusiness, UsersRound, UserRound } from 'lucide-react';
import Sidebar from './layout/Sidebar';
import Topbar from './layout/Topbar';
import { useStore } from '@/app/state/store';
import WorkspacePage from './WorkspacePage';
import LoginPage from '@/features/auth/pages/LoginPage';
import { login, logout, restoreSession } from '@/features/auth/services/auth-client';
import ActionFeedbackToast from '@/shared/ui/ActionFeedbackToast';
import { useConfirmAction } from '@/shared/ui/ConfirmDialog';
const ActivityTrendChart=lazy(()=>import('@/features/reporting/components/ActivityTrendChart'));

const dayKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const initials=(name:string)=>name.split(' ').map(part=>part[0]).join('');

function Dashboard(){
 const state=useStore();const [chartRange,setChartRange]=useState<7|30|90>(7);
 const confirm=useConfirmAction();
 const reduceMotion=useReducedMotion();
 const me=state.users.find(user=>user.id===state.activeUserId)!;const isDirector=state.role==='directeur';
 const visibleProjects=state.projects.filter(project=>isDirector||project.memberIds.includes(state.activeUserId));
 const visibleTasks=state.tasks.filter(task=>isDirector||task.assigneeIds.includes(state.activeUserId));
 const currentTasks=visibleTasks.filter(task=>!task.archived&&task.status!=='done');
 const overdue=currentTasks.filter(task=>task.end<dayKey(new Date()));
 const inProgress=currentTasks.filter(task=>task.status==='doing');
 const completed=visibleTasks.filter(task=>task.status==='done'||task.archived).length;
 const recentActivities=state.activities.filter(item=>isDirector||item.userId===state.activeUserId).sort((a,b)=>b.at.localeCompare(a.at)).slice(0,4);
 const prioritizedTasks=[...currentTasks].sort((a,b)=>a.end.localeCompare(b.end)||({urgent:0,high:1,medium:2,low:3}[a.priority]-{urgent:0,high:1,medium:2,low:3}[b.priority])).slice(0,3);
 const upcomingTasks=[...currentTasks].sort((a,b)=>a.end.localeCompare(b.end)).slice(0,3);
 const activityTrend=useMemo(()=>Array.from({length:chartRange},(_,index)=>{const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-(chartRange-1-index));const key=dayKey(date);const entries=state.activities.filter(item=>item.at.slice(0,10)===key&&(isDirector||item.userId===state.activeUserId));return {label:chartRange===7?date.toLocaleDateString('fr-FR',{weekday:'short'}):date.toLocaleDateString('fr-FR',{day:'numeric',month:'short'}),tasks:entries.filter(item=>item.taskId).length,projects:entries.filter(item=>!item.taskId&&!!item.projectId).length}}),[chartRange,state.activities,isDirector,state.activeUserId]);
 const todayLabel=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 const timeAgo=(value:string)=>{const minutes=Math.max(1,Math.floor((Date.now()-new Date(value).getTime())/60000));return minutes<60?`Il y a ${minutes} min`:minutes<1440?`Il y a ${Math.floor(minutes/60)} h`:`Il y a ${Math.floor(minutes/1440)} j`};
 return <div className="dashboard-content ev-dashboard dashboard-home">
  <header className="dashboard-hero"><div className="dashboard-hero-emblem"><BriefcaseBusiness size={36}/></div><div className="dashboard-hero-copy"><span className="dashboard-hero-kicker">SERVICE MARKETING · GROUPE ESPACE VERT</span><h1>Bonjour {me.name.split(' ')[0]} <span aria-hidden="true">👋</span></h1><strong>Voici un aperçu de votre activité aujourd’hui.</strong><p>{todayLabel} · Ensemble, faisons avancer nos projets vers le succès.</p></div><button className="dashboard-hero-cta" onClick={()=>state.setPage('projects')}>Voir mes projets <ArrowRight size={17}/></button><div className="dashboard-hero-scene" aria-hidden="true"><span className="hero-plant plant-left"/><span className="hero-device"><CheckCheck size={23}/></span><span className="hero-cup"/><span className="hero-plant plant-right"/></div></header>
  <section className="dashboard-kpis" aria-label="Indicateurs de travail">
   <button type="button" className="dashboard-kpi kpi-project" aria-label={`Ouvrir les projets, ${visibleProjects.length} projets`} onClick={()=>state.setPage('projects')}><span className="kpi-icon"><FolderKanban size={21}/></span><div><small>Projets</small><strong>{visibleProjects.length}</strong></div><ArrowUpRight className="kpi-trend" size={18}/></button>
   <button type="button" className="dashboard-kpi kpi-task" aria-label={`Ouvrir les tâches, ${visibleTasks.filter(task=>!task.archived).length} tâches`} onClick={()=>state.setPage('tasks')}><span className="kpi-icon"><CheckCheck size={21}/></span><div><small>Tâches</small><strong>{visibleTasks.filter(task=>!task.archived).length}</strong></div><ArrowUpRight className="kpi-trend" size={18}/></button>
   <button type="button" className="dashboard-kpi kpi-progress" aria-label={`Ouvrir les tâches en cours, ${inProgress.length}`} onClick={()=>state.setPage('tasks')}><span className="kpi-icon"><ListTodo size={21}/></span><div><small>En cours</small><strong>{inProgress.length}</strong></div><ArrowUpRight className="kpi-trend" size={18}/></button>
   <button type="button" className="dashboard-kpi kpi-late" aria-label={`Ouvrir les tâches en retard, ${overdue.length}`} onClick={()=>state.setPage('tasks')}><span className="kpi-icon"><Clock3 size={21}/></span><div><small>En retard</small><strong>{overdue.length}</strong></div><ArrowUpRight className="kpi-trend" size={18}/></button>
  </section>
  <section className="dashboard-analytics-grid">
   <article className="dashboard-panel dashboard-activity-panel"><header className="dashboard-panel-header"><div><span className="panel-title-icon"><Activity size={18}/></span><div><h2>Activité récente</h2><p>Les dernières mises à jour de votre espace</p></div></div><button className="panel-link" onClick={()=>state.setPage(isDirector?'reporting':'team')}>Voir tout <ArrowRight size={14}/></button></header><div className="home-activity-list">{recentActivities.map(item=>{const actor=state.users.find(user=>user.id===item.userId);const Icon=item.kind==='file'?Paperclip:item.kind==='comment'?MessageCircle:item.taskId?Check:FileText;return <div className="home-activity-item" key={item.id}><span className={`home-activity-icon kind-${item.kind}`}><Icon size={15}/></span><span className="home-activity-copy"><strong>{item.text}</strong><small>{timeAgo(item.at)}</small></span><span className="home-activity-avatar">{actor?.avatarDataUrl?<img src={actor.avatarDataUrl} alt=""/>:actor?initials(actor.name):'EV'}</span></div>})}{recentActivities.length===0&&<div className="dashboard-empty"><Activity size={20}/><span>Aucune activité récente pour le moment.</span></div>}</div></article>
   <article className="dashboard-panel dashboard-chart-panel"><header className="dashboard-panel-header"><div><span className="panel-title-icon"><Activity size={18}/></span><div><h2>Évolution de votre activité</h2><p>Actions enregistrées dans votre espace</p></div></div><div className="chart-range-tabs" role="group" aria-label="Période du graphique">{([7,30,90] as const).map(days=><button key={days} className={chartRange===days?'active':''} aria-pressed={chartRange===days} onClick={()=>setChartRange(days)}>{days}j</button>)}</div></header><div className="activity-chart-legend"><span><i className="legend-task"/> Tâches</span><span><i className="legend-project"/> Projets</span></div><div className="activity-chart"><Suspense fallback={<div className="activity-chart-loading" aria-label="Chargement du graphique"/>}><ActivityTrendChart data={activityTrend}/></Suspense></div></article>
   <article className="dashboard-panel dashboard-team-workload"><header className="dashboard-panel-header"><div><span className="panel-title-icon"><UsersRound size={18}/></span><div><h2>Charge de l’équipe</h2><p>Activité des membres en direct</p></div></div><button className="panel-link" onClick={()=>state.setPage('team')}>Équipe <ArrowRight size={14}/></button></header><div className="dashboard-workload-list">{state.users.map((user,index)=>{const tasks=state.tasks.filter(task=>!task.archived&&task.status!=='done'&&task.assigneeIds.includes(user.id));const percent=Math.min(100,tasks.length*18);return <motion.button type="button" key={user.id} className="dashboard-workload-member" onClick={()=>state.setPage('team')} initial={reduceMotion?false:{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:index*.045}} aria-label={`${user.name}, ${tasks.length} tâche${tasks.length===1?'':'s'} en cours; ouvrir l’équipe`}><span className="dashboard-workload-avatar">{user.avatarDataUrl?<img src={user.avatarDataUrl} alt=""/>:initials(user.name)}<i className={user.online?'online':''}/></span><span className="dashboard-workload-info"><span className="dashboard-workload-byline"><strong>{user.name}</strong><small>{tasks.length} tâche{tasks.length===1?'':'s'} · {user.online?'En ligne':'Hors ligne'}</small></span><span className="dashboard-workload-track"><motion.i initial={reduceMotion?false:{width:0}} animate={{width:`${percent}%`}} transition={{duration:.65,delay:index*.05,ease:'easeOut'}} className={percent>=72?'high':''}/></span></span></motion.button>})}{state.users.length===0&&<div className="dashboard-empty">Aucun membre à afficher.</div>}</div><div className="dashboard-workload-foot"><span><i className="online"/> Charge de travail</span><span>Basée sur les tâches ouvertes</span></div></article>
  </section>
  <section className="dashboard-lower-grid">
   <article className="dashboard-panel home-tasks-panel"><header className="dashboard-panel-header"><div><span className="panel-title-icon"><CheckCheck size={18}/></span><div><h2>{isDirector?'Tâches à suivre':'Mes tâches'}</h2><p>{isDirector?'Les tâches de l’équipe':'Vos tâches ouvertes'}</p></div></div><button className="panel-link" onClick={()=>state.setPage('tasks')}>Voir tout <ArrowRight size={14}/></button></header><div className="home-task-list">{prioritizedTasks.map(task=><button key={task.id} className="home-task-row" onClick={()=>state.openTask(task.id)}><Circle size={19}/><span><strong>{task.title}</strong><small>{state.projects.find(project=>project.id===task.projectId)?.name??'Tâche personnelle'}</small></span><em className={`task-priority priority-${task.priority}`}>{task.priority==='urgent'?'Urgente':task.priority==='high'?'Importante':task.priority==='medium'?'Normale':'Basse'}</em><time><CalendarDays size={14}/>{task.end===dayKey(new Date())?'Aujourd’hui':new Date(task.end+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</time></button>)}{prioritizedTasks.length===0&&<p className="dashboard-empty">Aucune tâche à suivre.</p>}</div></article>
   <article className="dashboard-panel home-deadlines-panel"><header className="dashboard-panel-header"><div><span className="panel-title-icon"><CalendarDays size={18}/></span><div><h2>Prochaines échéances</h2><p>Les dates à ne pas manquer</p></div></div><button className="panel-link" onClick={()=>state.setPage('planning')}>Voir tout <ArrowRight size={14}/></button></header><div className="home-deadline-list">{upcomingTasks.map(task=><button key={task.id} className="home-deadline-row" onClick={()=>state.openTask(task.id)}><time><b>{new Date(task.end+'T00:00:00').getDate()}</b><small>{new Date(task.end+'T00:00:00').toLocaleDateString('fr-FR',{month:'short'})}</small></time><span><strong>{task.title}</strong><small>{state.projects.find(project=>project.id===task.projectId)?.name??'Tâche personnelle'}</small></span><i className={`deadline-priority priority-${task.priority}`}>{task.priority==='urgent'?'Urgent':task.priority==='high'?'Important':'À suivre'}</i></button>)}{upcomingTasks.length===0&&<p className="dashboard-empty">Aucune échéance proche.</p>}</div></article>
   <article className="dashboard-goal-card"><span className="goal-art"><Target size={48}/></span><h2>Atteignez vos objectifs</h2><p>Organisez, collaborez et faites avancer vos projets avec EV TASKS.</p><button onClick={()=>state.setPage('projects')}>Découvrir mes projets <ArrowRight size={15}/></button></article>
  </section>
  <footer className="dashboard-footer">EV TASKS <span>·</span> Espace Marketing <button onClick={async()=>{if(await confirm({title:'Réinitialiser la démonstration ?',message:'Les données locales de démonstration seront remplacées par les données initiales.',confirmLabel:'Réinitialiser'}))state.reset()}}><RotateCcw size={12}/> Réinitialiser la démo</button><span className="dashboard-completed">{completed} tâches terminées</span></footer>
 </div>
}

export default function App(){
 const page=useStore(state=>state.page);
 const setPage=useStore(state=>state.setPage);
 const openProject=useStore(state=>state.openProject);
 const activeUserId=useStore(state=>state.activeUserId);
 const users=useStore(state=>state.users);
 const setActiveUser=useStore(state=>state.setActiveUser);
 const setSessionUser=useStore(state=>state.setSessionUser);
 const recordActivity=useStore(state=>state.recordActivity);
 const refreshPresence=useStore(state=>state.refreshPresence);
 const darkMode=useStore(state=>state.darkMode);
 const fontSize=useStore(state=>state.profilePreferences[activeUserId]?.textSize??'large');
 const [signedOut,setSignedOut]=useState(true);
 const [mobileNavOpen,setMobileNavOpen]=useState(false);
 const [sidebarCollapsed,setSidebarCollapsed]=useState(()=>localStorage.getItem('ev-sidebar-collapsed')==='true');
 useLayoutEffect(()=>{document.documentElement.classList.toggle('dark-mode',darkMode);return ()=>document.documentElement.classList.remove('dark-mode')},[darkMode]);
 const reduceMotion=useReducedMotion();
 useEffect(()=>{let active=true;void restoreSession().then(user=>{if(active&&user){setSessionUser({...user,online:true});setSignedOut(false)}});return ()=>{active=false}},[setSessionUser]);
 useEffect(()=>{
  let lastRecorded=0;
  const markActivity=()=>{
   if(document.visibilityState!=='visible'||!document.hasFocus())return;
   const now=Date.now();if(now-lastRecorded<15000)return;
   lastRecorded=now;recordActivity();
  };
  const onVisibility=()=>{if(document.visibilityState==='visible')markActivity()};
  const events:Array<keyof WindowEventMap>=['pointerdown','keydown','touchstart','scroll'];
  events.forEach(event=>window.addEventListener(event,markActivity,{passive:true}));
  window.addEventListener('focus',markActivity);document.addEventListener('visibilitychange',onVisibility);
  markActivity();const timer=window.setInterval(refreshPresence,30000);
  return ()=>{events.forEach(event=>window.removeEventListener(event,markActivity));window.removeEventListener('focus',markActivity);document.removeEventListener('visibilitychange',onVisibility);window.clearInterval(timer)};
 },[activeUserId,recordActivity,refreshPresence]);
 if(signedOut)return <div className={darkMode?'dark-mode':''}><LoginPage demoUsers={users} onDemoAccess={userId=>{setActiveUser(userId);setSignedOut(false)}} onLogin={async(email,password)=>{const user=await login(email,password);setSessionUser({...user,online:true});setSignedOut(false);return user}}/></div>;
 return <div className={`app-shell ${page==='tasks'?'tasks-page-layout':''} ${fontSize==='large'?'font-large':''} ${darkMode?'dark-mode':''} ${mobileNavOpen?'mobile-nav-open':''} ${sidebarCollapsed?'sidebar-collapsed':''}`}><div className="app-frame"><button className="mobile-nav-backdrop" aria-label="Fermer le menu" onClick={()=>setMobileNavOpen(false)}/><Sidebar collapsed={sidebarCollapsed} onToggleCollapse={()=>setSidebarCollapsed(value=>{localStorage.setItem('ev-sidebar-collapsed',String(!value));return !value})} onNavigate={()=>setMobileNavOpen(false)}/><main className="main-panel"><Topbar onLogout={()=>{void logout().finally(()=>setSignedOut(true))}} onMenu={()=>setMobileNavOpen(open=>!open)} menuOpen={mobileNavOpen}/><AnimatePresence mode="wait" initial={false}><motion.div key={page} className="route-transition" initial={reduceMotion?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={reduceMotion?undefined:{opacity:0,y:-4}} transition={reduceMotion?{duration:0}:{duration:.22,ease:[.32,.72,0,1]}}>{page==='overview'?<Dashboard/>:<WorkspacePage page={page}/>}</motion.div></AnimatePresence></main></div><nav className="mobile-bottom-nav" aria-label="Navigation mobile">{([{key:'overview',label:'Accueil',Icon:Home},{key:'projects',label:'Projets',Icon:FolderKanban},{key:'tasks',label:'Tâches',Icon:CheckCheck},{key:'profile',label:'Profil',Icon:UserRound}] as const).map(({key,label,Icon})=><button key={key} type="button" aria-label={label} aria-current={page===key?'page':undefined} className={page===key?'active':''} onClick={()=>{if(key==='tasks')openProject(null);setPage(key);setMobileNavOpen(false)}}><Icon size={20} aria-hidden="true"/></button>)}</nav><ActionFeedbackToast/></div>
}
