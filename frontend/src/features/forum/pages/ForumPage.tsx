import { useMemo, useState, type FormEvent } from 'react';
import { Bookmark, BadgeCheck, Flame, MessageCircle, MessagesSquare, Plus, Search, Send, Settings, SlidersHorizontal, ThumbsUp, Trash2, UserRound, UsersRound, X, Eye, MessageSquareText, Users } from 'lucide-react';
import { useStore } from '@/app/state/store';
import { useConfirmAction } from '@/shared/ui/ConfirmDialog';
import './ForumPage.css';
import './ForumPage.redesign.css';

type ForumTab='community'|'profile'|'answers';
const ago=(value:string)=>{const minutes=Math.max(1,Math.floor((Date.now()-new Date(value).getTime())/60000));if(minutes<60)return `il y a ${minutes} min`;const hours=Math.floor(minutes/60);if(hours<24)return `il y a ${hours} h`;const days=Math.floor(hours/24);return `il y a ${days} j`;};

export default function ForumPage(){
  const state=useStore();
  const confirm=useConfirmAction();
  const [tab,setTab]=useState<ForumTab>('community');
  const [composeOpen,setComposeOpen]=useState(false);
  const [title,setTitle]=useState('');const [body,setBody]=useState('');const [category,setCategory]=useState('questions');
  const [search,setSearch]=useState('');const [topicFilter,setTopicFilter]=useState('all');const [sort,setSort]=useState('recent');const [bookmarksOnly,setBookmarksOnly]=useState(false);
  const [replyText,setReplyText]=useState<Record<string,string>>({});const [replyOpen,setReplyOpen]=useState<string|null>(null);
  const [groupId,setGroupId]=useState<string|null>(null);const [groupDialog,setGroupDialog]=useState(false);const [groupName,setGroupName]=useState('');const [groupDescription,setGroupDescription]=useState('');const [groupMembers,setGroupMembers]=useState<string[]>([]);
  const isDirector=state.role==='directeur';
  const forumGroups=state.forumGroups.filter(group=>group.memberIds.includes(state.activeUserId));
  const activeGroup=forumGroups.find(group=>group.id===groupId)??null;
  const visibleTopics=state.forumTopics.filter(topic=>activeGroup?topic.groupId===activeGroup.id:!topic.groupId);
  const categories=[...new Set(visibleTopics.map(topic=>topic.category))];
  const canManageGroup=!!activeGroup&&(activeGroup.createdBy===state.activeUserId||isDirector);
  const openCreateGroup=()=>{setGroupId(null);setGroupName('');setGroupDescription('');setGroupMembers([]);setGroupDialog(true)};
  const openEditGroup=()=>{if(!activeGroup)return;setGroupName(activeGroup.name);setGroupDescription(activeGroup.description);setGroupMembers(activeGroup.memberIds);setGroupDialog(true)};
  const saveGroup=(event:FormEvent)=>{event.preventDefault();if(activeGroup){state.updateForumGroup(activeGroup.id,groupName,groupDescription,groupMembers);if(!useStore.getState().lastActionError)setGroupDialog(false)}else{state.createForumGroup(groupName,groupDescription,groupMembers);if(!useStore.getState().lastActionError)setGroupDialog(false)}};
  const topics=useMemo(()=>{
    let result=[...visibleTopics];
    if(tab==='answers')result=result.filter(topic=>topic.replies.some(reply=>reply.authorId===state.activeUserId));
    if(tab==='profile')result=result.filter(topic=>topic.authorId===state.activeUserId);
    if(topicFilter!=='all')result=result.filter(topic=>topic.category===topicFilter);
    if(bookmarksOnly)result=result.filter(topic=>topic.bookmarkedBy.includes(state.activeUserId));
    if(search.trim()){const query=search.toLowerCase();result=result.filter(topic=>`${topic.title} ${topic.body} ${topic.category}`.toLowerCase().includes(query));}
    return result.sort((a,b)=>sort==='popular'?b.likedBy.length-a.likedBy.length||b.replies.length-a.replies.length:new Date(b.at).getTime()-new Date(a.at).getTime());
  },[visibleTopics,state.forumTopics,state.activeUserId,tab,topicFilter,bookmarksOnly,search,sort]);
  const topUsers=useMemo(()=>state.users.map(user=>({user,score:visibleTopics.reduce((sum,topic)=>sum+(topic.authorId===user.id?topic.likedBy.length*10:0),0)})).sort((a,b)=>b.score-a.score).slice(0,5),[state.users,visibleTopics]);
  const activeTopics=categories.map(category=>({category,count:visibleTopics.filter(topic=>topic.category===category).length})).sort((a,b)=>b.count-a.count).slice(0,6);
  const totalLikes=visibleTopics.reduce((sum,topic)=>sum+topic.likedBy.length,0);
  const totalReplies=visibleTopics.reduce((sum,topic)=>sum+topic.replies.length,0);
  const activeMembers=state.users.filter(user=>user.online).length;
  const popularCount=visibleTopics.filter(topic=>topic.likedBy.length>=2||topic.replies.length>=2).length;

  const createTopic=(event:FormEvent)=>{event.preventDefault();state.createForumTopic(title,body,category,activeGroup?.id);if(!useStore.getState().lastActionError){setTitle('');setBody('');setComposeOpen(false);setTab('community');}};

  return <div className="workspace-page forum-page forum-premium">
    <header className="forum-hero"><div className="forum-hero-icon"><MessagesSquare size={31}/><i><MessageCircle size={16}/></i></div><div className="forum-hero-copy"><span>ESPACE COLLABORATIF · GROUPE ESPACE VERT</span><h1>Forum Espace Vert</h1><p>Échangez, posez vos questions et partagez vos idées avec l’équipe.</p></div>{(isDirector||activeGroup)&&<button className="forum-hero-cta" onClick={()=>setComposeOpen(open=>!open)}><Plus size={17}/> Nouveau sujet</button>}</header>
    <section className="forum-kpis" aria-label="Statistiques du forum"><article><i className="forum-kpi-green"><MessageSquareText size={20}/></i><span><b>{visibleTopics.length}</b><small>Sujets</small></span><em><span>↗</span> {visibleTopics.length?'+1':''}</em></article><article><i className="forum-kpi-blue"><MessageCircle size={20}/></i><span><b>{totalReplies}</b><small>Réponses</small></span><em><span>↗</span> {totalReplies?`+${totalReplies}`:''}</em></article><article><i className="forum-kpi-purple"><Users size={20}/></i><span><b>{activeMembers}</b><small>Membres actifs</small></span><em>●</em></article><article><i className="forum-kpi-orange"><Flame size={20}/></i><span><b>{popularCount}</b><small>Sujets populaires</small></span><em>♨</em></article></section>
    <div className="forum-layout">
      <main className="forum-main">
        <nav className="forum-tabs" aria-label="Navigation du forum">
          <button className={tab==='community'?'selected':''} onClick={()=>setTab('community')}><MessagesSquare size={16}/>Communauté</button>
          <button className={tab==='profile'?'selected':''} onClick={()=>setTab('profile')}><UserRound size={16}/>Profil</button>
          <button className={tab==='answers'?'selected':''} onClick={()=>setTab('answers')}><MessageCircle size={16}/>Mes réponses</button>
        </nav>
        <div className="forum-list-heading"><div><span className="eyebrow">{activeGroup?`GROUPE · ${activeGroup.memberIds.length} MEMBRES`:'DIRECTION MARKETING · ESPACE COMMUN'}</span><h1>{tab==='community'?(activeGroup?.name??'Discussions'):tab==='profile'?'Mes sujets':'Mes réponses'}</h1></div>
          <div className="forum-tools"><label className="forum-filter"><SlidersHorizontal size={14}/><select value={topicFilter} onChange={event=>setTopicFilter(event.target.value)} aria-label="Filtrer par sujet"><option value="all">Tous les sujets</option>{categories.map(item=><option value={item} key={item}># {item}</option>)}</select></label>
            <label className="forum-filter"><select value={sort} onChange={event=>setSort(event.target.value)} aria-label="Trier les discussions"><option value="recent">Plus récents</option><option value="popular">Populaires</option></select></label>
            <button className={`forum-tool-button ${bookmarksOnly?'active':''}`} onClick={()=>setBookmarksOnly(value=>!value)} aria-pressed={bookmarksOnly} title="Favoris"><Bookmark size={15}/><span>Favoris</span></button>
            <label className="forum-search"><Search size={16}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Rechercher" aria-label="Rechercher dans le forum"/>{search&&<button type="button" onClick={()=>setSearch('')} aria-label="Effacer la recherche"><X size={14}/></button>}</label>
          </div>
        </div>
        {composeOpen&&<form className="forum-create" onSubmit={createTopic}>
          <div className="forum-form-heading"><span><Plus size={17}/></span><div><strong>Nouveau sujet</strong><small>Les membres de l’équipe pourront y répondre.</small></div><button className="forum-close-compose" type="button" onClick={()=>setComposeOpen(false)} aria-label="Fermer"><X size={17}/></button></div>
          <label htmlFor="forum-title">Titre</label><input id="forum-title" value={title} onChange={event=>setTitle(event.target.value)} maxLength={140} placeholder="Ex. Préparation de la prochaine campagne" required/>
          <label htmlFor="forum-category">Catégorie</label><input id="forum-category" value={category} onChange={event=>setCategory(event.target.value)} maxLength={32} placeholder="questions, idées, jobs…" required/>
          <label htmlFor="forum-body">Message</label><textarea id="forum-body" value={body} onChange={event=>setBody(event.target.value)} rows={3} placeholder="Donnez le contexte et les informations utiles…" required/>
          <div className="forum-form-foot"><span>{activeGroup?'Publication réservée aux membres de cet espace':'Publication réservée au directeur du service'}</span><button className="hub-primary" type="submit"><Send size={15}/> Publier le sujet</button></div>
        </form>}
        {state.lastActionError&&<div className="inline-error" role="alert">{state.lastActionError}</div>}
        <section className="forum-thread-list" aria-label="Discussions">
          {topics.length===0?<div className="forum-empty"><MessagesSquare size={27}/><strong>Aucune discussion à afficher</strong><span>{bookmarksOnly?'Ajoutez des discussions à vos favoris pour les retrouver ici.':isDirector?'Lancez la discussion en publiant un sujet.':'Les sujets publiés par le directeur apparaîtront ici.'}</span></div>:topics.map(topic=>{
            const author=state.users.find(user=>user.id===topic.authorId);const liked=topic.likedBy.includes(state.activeUserId);const bookmarked=topic.bookmarkedBy.includes(state.activeUserId);
            return <article className="forum-thread" key={topic.id}>
              <header className="forum-thread-author"><span className={`forum-avatar avatar-${Math.max(0,state.users.findIndex(user=>user.id===topic.authorId)%5)}`}>{author?.name.split(' ').map(part=>part[0]).join('')??'?'}</span><strong>{author?.name??'Membre'}</strong><BadgeCheck className="forum-verified" size={16} aria-label="Membre de l’équipe"/><span className="forum-thread-time">{ago(topic.at)}</span>{(isDirector||topic.authorId===state.activeUserId||canManageGroup)&&<button className="forum-delete" type="button" aria-label="Supprimer le sujet" title="Supprimer le sujet" onClick={async()=>{if(await confirm({title:'Supprimer le sujet ?',message:'Ce sujet et toutes ses réponses seront supprimés définitivement.',confirmLabel:'Supprimer'}))state.deleteForumTopic(topic.id)}}><Trash2 size={15}/></button>}</header>
              <h2>{topic.title}</h2><p className="forum-thread-body">{topic.body}</p>
              <div className="forum-thread-bottom"><span className="forum-category"># {topic.category}</span><span>{topic.replies.length} réponse{topic.replies.length===1?'':'s'}</span><div className="forum-thread-actions"><button className={`forum-action ${bookmarked?'on':''}`} onClick={()=>state.toggleForumBookmark(topic.id)} aria-label={bookmarked?'Retirer des favoris':'Ajouter aux favoris'} title={bookmarked?'Retirer des favoris':'Ajouter aux favoris'}><Bookmark size={15}/></button><button className={`forum-action forum-like ${liked?'on':''}`} onClick={()=>state.toggleForumLike(topic.id)} aria-pressed={liked} aria-label="J’aime"><ThumbsUp size={14}/><span>{topic.likedBy.length}</span></button><button className="forum-action forum-reply-toggle" onClick={()=>setReplyOpen(replyOpen===topic.id?null:topic.id)}><MessageCircle size={14}/><span>Répondre</span></button></div>
              </div>
              {replyOpen===topic.id&&<div className="forum-replies">
                {topic.replies.map(reply=>{const replyAuthor=state.users.find(user=>user.id===reply.authorId);return <div className="forum-reply" key={reply.id}><span className="forum-avatar small">{replyAuthor?.name.split(' ').map(part=>part[0]).join('')??'?'}</span><div className="forum-reply-copy"><div><strong>{replyAuthor?.name??'Membre'}</strong><small>{ago(reply.at)}</small></div><p>{reply.text}</p></div>{(isDirector||reply.authorId===state.activeUserId||canManageGroup)&&<button className="forum-delete reply-delete" type="button" aria-label="Supprimer la réponse" onClick={async()=>{if(await confirm({title:'Supprimer la réponse ?',message:'Cette réponse sera supprimée définitivement.',confirmLabel:'Supprimer'}))state.deleteForumReply(topic.id,reply.id)}}><Trash2 size={14}/></button>}</div>})}
                <form className="forum-reply-form" onSubmit={event=>{event.preventDefault();state.replyForumTopic(topic.id,replyText[topic.id]??'');if(!useStore.getState().lastActionError)setReplyText(current=>({...current,[topic.id]:''}));}}><input aria-label={`Répondre à ${topic.title}`} value={replyText[topic.id]??''} onChange={event=>setReplyText(current=>({...current,[topic.id]:event.target.value}))} placeholder="Écrire une réponse…"/><button type="submit" aria-label="Publier la réponse"><Send size={15}/></button></form>
              </div>}
            </article>;
          })}
        </section>
      </main>
      <aside className="forum-sidebar">
        <section className="forum-side-card forum-groups-panel"><header><h2>Espaces de discussion</h2><button aria-label="Créer un espace" title="Créer un espace" onClick={openCreateGroup}><Plus size={15}/></button></header><button className={`forum-group-choice ${!activeGroup?'active':''}`} onClick={()=>{setGroupId(null);setTopicFilter('all')}}><MessagesSquare size={15}/><span>Forum général</span></button>{forumGroups.map(group=><div className="forum-group-choice-row" key={group.id}><button className={`forum-group-choice ${activeGroup?.id===group.id?'active':''}`} onClick={()=>{setGroupId(group.id);setTopicFilter('all')}}><UsersRound size={15}/><span>{group.name}</span></button>{(group.createdBy===state.activeUserId||isDirector)&&<button className="forum-group-settings" aria-label={`Paramètres de ${group.name}`} onClick={()=>{setGroupId(group.id);setGroupName(group.name);setGroupDescription(group.description);setGroupMembers(group.memberIds);setGroupDialog(true)}}><Settings size={14}/></button>}</div>)}{forumGroups.length===0&&<p className="forum-side-empty">Crée un espace privé et sélectionne ses membres.</p>}</section>
        {(isDirector||activeGroup)&&<button className="forum-new-thread" onClick={()=>setComposeOpen(open=>!open)}><Plus size={17}/>Démarrer un sujet</button>}
        <section className="forum-side-card"><h2>Membres actifs</h2>{topUsers.map(({user,score},index)=><div className="forum-top-user" key={user.id}><span className={`forum-avatar avatar-${index}`}>{user.name.split(' ').map(part=>part[0]).join('')}</span><span className="forum-user-name">{user.name}</span><BadgeCheck size={15} className="forum-verified"/><span className="forum-user-score"><ThumbsUp size={12}/>{score>999?`${(score/1000).toFixed(1)}k`:score}</span></div>)}</section>
        <section className="forum-side-card"><h2>Sujets actifs</h2>{activeTopics.length?activeTopics.map(({category,count})=><button className="forum-active-topic" key={category} onClick={()=>{setTopicFilter(category);setTab('community');setBookmarksOnly(false)}}><span># {category}</span><small>{count} discussion{count===1?'':'s'}</small></button>):<p className="forum-side-empty">Aucun sujet pour le moment.</p>}</section>
        <div className="forum-community-stats"><strong>{activeGroup?activeGroup.memberIds.length:state.users.length}</strong><span>membres</span><i/><strong>{visibleTopics.length}</strong><span>discussions</span><i/><strong>{totalLikes}</strong><span>mentions J’aime</span></div>
      </aside>
    </div>
    {groupDialog&&<div className="messages-dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setGroupDialog(false)}}><form className="messages-group-dialog" onSubmit={saveGroup}><button className="messages-dialog-close" type="button" aria-label="Fermer" onClick={()=>setGroupDialog(false)}><X size={18}/></button><span className="messages-dialog-icon"><UsersRound size={19}/></span><h2>{activeGroup?'Paramètres de l’espace':'Créer un espace de discussion'}</h2><p>Définis son nom, sa description et les membres autorisés.</p><label>Nom<input value={groupName} onChange={event=>setGroupName(event.target.value)} maxLength={70} required/></label><label>Description<input value={groupDescription} onChange={event=>setGroupDescription(event.target.value)} maxLength={240} placeholder="Sujet ou objectif de ce groupe"/></label><fieldset><legend>Membres <small>{groupMembers.length} sélectionné(s)</small></legend>{state.users.map(user=><label className="message-member-option" key={user.id}><input type="checkbox" checked={groupMembers.includes(user.id)} onChange={()=>setGroupMembers(current=>current.includes(user.id)?current.filter(id=>id!==user.id):[...current,user.id])}/><span className="evaluation-member-avatar">{user.name.split(' ').map(part=>part[0]).join('')}</span><span><b>{user.name}</b><small>{user.title}</small></span></label>)}</fieldset>{state.lastActionError&&<small className="messages-dialog-error">{state.lastActionError}</small>}<button className="hub-primary" type="submit">{activeGroup?'Enregistrer les paramètres':'Créer l’espace'}</button>{activeGroup&&canManageGroup&&<button className="forum-delete-group" type="button" onClick={async()=>{if(await confirm({title:'Supprimer l’espace ?',message:`L’espace « ${activeGroup.name} » et ses sujets seront supprimés définitivement.`,confirmLabel:'Supprimer'})){state.deleteForumGroup(activeGroup.id);setGroupId(null);setGroupDialog(false)}}}><Trash2 size={14}/> Supprimer cet espace</button>}</form></div>}
  </div>;
}
