import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Activity, Comment, CustomField, EvaluationCriterion, EvaluationPeriod, ForumGroup, ForumTopic, GroupMessage, MemberEvaluation, MessageGroup, Notification, PrivateMessage, Project, ProjectComment, ProjectSection, ProjectTemplate, Role, Task, TaskType, TaskViewMode, TeamMedia, TeamMessage, User } from '@/shared/types';
import { users, projects, tasks } from '@/mocks/seed';
import { can } from '@/shared/lib/permissions';

export type Page = 'overview'|'projects'|'tasks'|'planning'|'team'|'messages'|'forum'|'files'|'reporting'|'evaluations'|'archives'|'settings'|'profile';
export type ProfilePreferences = { textSize: 'normal'|'large' };
export type ActionFeedback = { id: number; type: 'success'|'error'; message: string };

export interface StoreState {
  role: Role; activeUserId: string; activeProjectId: string | null; selectedTaskId: string | null; taskViewResetKey:number; page: Page; collapsed: boolean; darkMode:boolean;
  users: User[]; projects: Project[]; tasks: Task[]; messageGroups:MessageGroup[]; groupMessages:GroupMessage[]; forumGroups:ForumGroup[];
  evaluationCriteria:EvaluationCriterion[]; evaluations:MemberEvaluation[];
  lastActiveAt: Record<string,number>;
  profilePreferences: Record<string,ProfilePreferences>;
  customFields: CustomField[]; taskTypes: TaskType[]; sections: ProjectSection[];
  projectViews: Record<string, TaskViewMode>; comments: Comment[]; projectComments: ProjectComment[];
  teamMessages: TeamMessage[]; forumTopics: ForumTopic[]; privateMessages: PrivateMessage[]; mediaLibrary: TeamMedia[]; activities: Activity[]; notifications: Notification[]; projectTemplates: ProjectTemplate[];
  lastActionError: string | null; actionFeedback: ActionFeedback | null;
  teamMessageFocusId: string | null; privateMessageFocusId: string | null; privateChatPeerId: string | null;
  setRole: (role: Role) => void; setActiveUser: (id: string) => void; setSessionUser: (user: Omit<User, 'online'> & { online?: boolean }) => void; setPage: (page: Page) => void; openProject: (id: string | null) => void; openTask: (id: string | null) => void;
  toggleSidebar: () => void; setProjectView: (projectId: string, view: TaskViewMode) => void;
  setActionError: (message: string | null) => void; dismissActionFeedback: () => void;
  updateOwnProfile:(name:string,title:string)=>void; setTextSize:(size:ProfilePreferences['textSize'])=>void; recordActivity:()=>void; refreshPresence:()=>void;
  setOwnAvatar:(avatarDataUrl:string|null)=>void;
  toggleDarkMode:()=>void;
  createEvaluationCriterion:(label:string,description:string,maxScore:number)=>void; updateEvaluationCriterion:(id:string,label:string,description:string,maxScore:number)=>void; deleteEvaluationCriterion:(id:string)=>void; setEvaluationCriterionActive:(id:string,active:boolean)=>void; saveMemberEvaluation:(input:{userId:string;period:EvaluationPeriod;evaluatedAt:string;scores:Record<string,number>;notes:Record<string,string>;comment?:string})=>void; updateMemberEvaluation:(id:string,input:{userId:string;period:EvaluationPeriod;evaluatedAt:string;scores:Record<string,number>;notes:Record<string,string>;comment?:string})=>void; deleteMemberEvaluation:(id:string)=>void;
  createMessageGroup:(name:string,memberIds:string[])=>void; updateMessageGroup:(id:string,name:string,memberIds:string[])=>void; deleteMessageGroup:(id:string)=>void; sendGroupMessage:(groupId:string,text:string,mediaId?:string)=>void; editGroupMessage:(id:string,text:string)=>void; deleteGroupMessage:(id:string)=>void; markGroupMessagesSeen:(groupId:string)=>void;
  createForumGroup:(name:string,description:string,memberIds:string[])=>void; updateForumGroup:(id:string,name:string,description:string,memberIds:string[])=>void; deleteForumGroup:(id:string)=>void;
  createProject: (name: string, description: string) => void; updateProject: (id:string,name:string,description:string) => void; deleteProject:(id:string)=>void;
  createTask: (title: string) => void; createAssignedTask: (input: CreateAssignedTaskInput) => void; updateAssignedTask:(id:string,input:CreateAssignedTaskInput)=>void; deleteTask:(id:string)=>void;
  postTaskComment: (taskId: string, text: string) => void; editTaskComment:(id:string,text:string)=>void; deleteTaskComment:(id:string)=>void; markTaskCommentsSeen: (taskId: string) => void;
  sendTeamMessage: (text: string, mediaId?: string) => void; editTeamMessage:(id:string,text:string)=>void; deleteTeamMessage:(id:string)=>void; markTeamMessagesSeen: () => void;
  createForumTopic:(title:string,body:string,category:string,groupId?:string)=>void; replyForumTopic:(topicId:string,text:string)=>void; deleteForumTopic:(id:string)=>void; deleteForumReply:(topicId:string,replyId:string)=>void; toggleForumLike:(id:string)=>void; toggleForumBookmark:(id:string)=>void;
  sendPrivateMessage: (recipientId: string, text: string, mediaId?: string) => void; editPrivateMessage:(id:string,text:string)=>void; deletePrivateMessage:(id:string)=>void; markPrivateMessagesSeen: (peerId: string) => void; markNotificationsRead: () => void;
  openTeamMessage:(id:string)=>void; openPrivateChat:(peerId:string,messageId?:string)=>void; clearMessageFocus:()=>void; clearPrivateChat:()=>void;
  addTeamMedia: (media: Omit<TeamMedia, 'id'|'uploadedBy'|'uploadedAt'>) => string | null; removeTeamMedia: (id: string) => void;
  setProgress: (id: string, progress: number) => void;
  setPriority: (id: string, priority: Task['priority']) => void;
  setTaskStatus: (id: string, status: Task['status']) => void;
  moveTask: (id: string, status: Task['status']) => void; reset: () => void;
}

export interface CreateAssignedTaskInput { title: string; description: string; projectId: string; assigneeIds: string[]; end: string; priority: Task['priority'] }

type StoreAction = 'setRole'|'setActiveUser'|'setSessionUser'|'setPage'|'openProject'|'openTask'|'toggleSidebar'|'setProjectView'|'setActionError'|'dismissActionFeedback'|'updateOwnProfile'|'setTextSize'|'recordActivity'|'refreshPresence'|'setOwnAvatar'|'toggleDarkMode'|'createEvaluationCriterion'|'updateEvaluationCriterion'|'deleteEvaluationCriterion'|'setEvaluationCriterionActive'|'saveMemberEvaluation'|'updateMemberEvaluation'|'deleteMemberEvaluation'|'createMessageGroup'|'updateMessageGroup'|'deleteMessageGroup'|'sendGroupMessage'|'editGroupMessage'|'deleteGroupMessage'|'markGroupMessagesSeen'|'createForumGroup'|'updateForumGroup'|'deleteForumGroup'|'createProject'|'updateProject'|'deleteProject'|'createTask'|'createAssignedTask'|'updateAssignedTask'|'deleteTask'|'postTaskComment'|'editTaskComment'|'deleteTaskComment'|'markTaskCommentsSeen'|'sendTeamMessage'|'editTeamMessage'|'deleteTeamMessage'|'markTeamMessagesSeen'|'createForumTopic'|'replyForumTopic'|'deleteForumTopic'|'deleteForumReply'|'toggleForumLike'|'toggleForumBookmark'|'sendPrivateMessage'|'editPrivateMessage'|'deletePrivateMessage'|'markPrivateMessagesSeen'|'markNotificationsRead'|'openTeamMessage'|'openPrivateChat'|'clearMessageFocus'|'clearPrivateChat'|'addTeamMedia'|'removeTeamMedia'|'setProgress'|'setPriority'|'setTaskStatus'|'moveTask'|'reset';
type StoreData = Omit<StoreState, StoreAction>;

const defaultEvaluationCriteria:EvaluationCriterion[]=[
  {id:'ec_quality',label:'Qualité du travail',description:'Évalue la qualité et la rigueur du travail fourni.',maxScore:5,active:true},
  {id:'ec_deadlines',label:'Respect des délais',description:'Respecte les délais et les engagements.',maxScore:5,active:true},
  {id:'ec_teamwork',label:'Esprit d’équipe',description:'Collabore efficacement avec l’équipe.',maxScore:5,active:true},
  {id:'ec_initiative',label:'Initiative et proactivité',description:'Propose des idées et prend des initiatives.',maxScore:5,active:true},
  {id:'ec_communication',label:'Communication',description:'Communique clairement et efficacement.',maxScore:5,active:true},
];

const initial = (): StoreData => ({
  role: 'directeur', activeUserId: 'u1', activeProjectId: null, selectedTaskId:null, taskViewResetKey:0, page: 'overview', collapsed: false, darkMode:true,
  users, projects, tasks, messageGroups:[],groupMessages:[],forumGroups:[],evaluationCriteria:defaultEvaluationCriteria, evaluations:[], lastActiveAt:{}, profilePreferences:Object.fromEntries(users.map(user=>[user.id,{textSize:'large' as const}])), customFields: [], taskTypes: [], sections: [], projectViews: {},
  comments: [], projectComments: [], teamMessages: [], forumTopics: [
    {id:'ft1',title:'Quelles priorités pour la prochaine campagne ?',body:'Nous préparons le lancement de la campagne de fin d’année. Quelles idées de contenus et quels canaux devrions-nous privilégier ?',category:'idées',authorId:'u1',at:'2026-11-17T09:30:00.000Z',replies:[{id:'fr1',authorId:'u3',text:'Je peux préparer quelques propositions de visuels pour les réseaux sociaux.',at:'2026-11-17T10:05:00.000Z'},{id:'fr2',authorId:'u5',text:'Une série de courtes vidéos pourrait bien fonctionner.',at:'2026-11-17T10:42:00.000Z'}],likedBy:['u2','u3','u5'],bookmarkedBy:[]},
    {id:'ft2',title:'Organisation du calendrier éditorial',body:'Partageons ici les sujets prévus pour les prochaines semaines afin de mieux coordonner les publications.',category:'organisation',authorId:'u1',at:'2026-11-16T13:15:00.000Z',replies:[{id:'fr3',authorId:'u4',text:'Je mets à jour le calendrier avec les dates des prochaines publications.',at:'2026-11-16T14:00:00.000Z'}],likedBy:['u2','u4'],bookmarkedBy:['u3']},
    {id:'ft3',title:'Vos retours sur les nouveaux supports',body:'Les maquettes sont prêtes. Quels ajustements vous semblent nécessaires avant validation ?',category:'questions',authorId:'u1',at:'2026-11-15T08:20:00.000Z',replies:[],likedBy:['u3'],bookmarkedBy:[]},
  ], privateMessages: [], mediaLibrary: [], activities: [], notifications: [], projectTemplates: [],
  lastActionError: null, actionFeedback:null, teamMessageFocusId:null, privateMessageFocusId:null, privateChatPeerId:null,
});

function normalizeTask(task: Task): Task {
  const legacy = task as Task & Partial<Pick<Task, 'customValues'|'blockedBy'|'attachments'|'sectionId'|'taskTypeId'|'recurrence'>>;
  return { ...legacy, subtasks: (legacy.subtasks ?? []).map(subtask => ({ ...subtask, assigneeIds: subtask.assigneeIds ?? [] })), customValues: legacy.customValues ?? {}, blockedBy: legacy.blockedBy ?? [], attachments: legacy.attachments ?? [] };
}

function mayEditTask(state: StoreState, task: Task, action: 'task.progress'|'task.priority'|'task.reorder.all'|'task.reorder.own'|'task.custom.edit'|'task.comment.add'|'task.attachment.add') {
  return can(state.role, action) && (state.role === 'directeur' || task.assigneeIds.includes(state.activeUserId));
}

export const currentUser = (state: StoreState) => state.users.find(user => user.id === state.activeUserId)!;

type FeedbackCollectionKey = 'tasks'|'projects'|'messageGroups'|'groupMessages'|'forumGroups'|'evaluationCriteria'|'evaluations'|'customFields'|'taskTypes'|'sections'|'projectTemplates'|'comments'|'projectComments'|'teamMessages'|'forumTopics'|'privateMessages'|'mediaLibrary'|'users';
const feedbackCollections: Array<{ key: FeedbackCollectionKey; added: string; updated: string; removed: string }> = [
  { key:'tasks',added:'Tâche créée.',updated:'Tâche mise à jour.',removed:'Tâche supprimée.' },
  { key:'projects',added:'Projet créé.',updated:'Projet mis à jour.',removed:'Projet supprimé.' },
  { key:'messageGroups',added:'Groupe créé.',updated:'Groupe mis à jour.',removed:'Groupe supprimé.' },
  { key:'groupMessages',added:'Message envoyé.',updated:'Message modifié.',removed:'Message supprimé.' },
  { key:'forumGroups',added:'Espace créé.',updated:'Espace mis à jour.',removed:'Espace supprimé.' },
  { key:'evaluationCriteria',added:'Critère ajouté.',updated:'Critère mis à jour.',removed:'Critère supprimé.' },
  { key:'evaluations',added:'Évaluation enregistrée.',updated:'Évaluation mise à jour.',removed:'Évaluation supprimée.' },
  { key:'customFields',added:'Champ personnalisé ajouté.',updated:'Champ personnalisé mis à jour.',removed:'Champ personnalisé supprimé.' },
  { key:'taskTypes',added:'Type de tâche créé.',updated:'Type de tâche mis à jour.',removed:'Type de tâche supprimé.' },
  { key:'sections',added:'Section ajoutée.',updated:'Section mise à jour.',removed:'Section supprimée.' },
  { key:'projectTemplates',added:'Modèle de projet créé.',updated:'Modèle de projet mis à jour.',removed:'Modèle de projet supprimé.' },
  { key:'comments',added:'Commentaire ajouté.',updated:'Commentaire modifié.',removed:'Commentaire supprimé.' },
  { key:'projectComments',added:'Commentaire de projet ajouté.',updated:'Commentaire de projet modifié.',removed:'Commentaire de projet supprimé.' },
  { key:'teamMessages',added:'Message envoyé.',updated:'Message modifié.',removed:'Message supprimé.' },
  { key:'forumTopics',added:'Publication créée.',updated:'Publication mise à jour.',removed:'Publication supprimée.' },
  { key:'privateMessages',added:'Message privé envoyé.',updated:'Message privé modifié.',removed:'Message privé supprimé.' },
  { key:'mediaLibrary',added:'Fichier ajouté à la médiathèque.',updated:'Fichier mis à jour.',removed:'Fichier supprimé de la médiathèque.' },
  { key:'users',added:'Profil ajouté.',updated:'Profil mis à jour.',removed:'Profil supprimé.' },
];
let feedbackId = 0;

function getActionFeedback(previous: StoreState, next: Partial<StoreState>): Omit<ActionFeedback, 'id'> | null {
  if (Object.prototype.hasOwnProperty.call(next, 'lastActionError') && next.lastActionError) {
    return { type:'error', message:next.lastActionError };
  }

  for (const { key, added, updated, removed } of feedbackCollections) {
    const before = previous[key];
    const after = next[key];
    if (after === undefined || after === before) continue;
    if (key === 'users' && Array.isArray(before) && Array.isArray(after) && before.length !== after.length) continue;

    const serialize = (value: unknown) => JSON.stringify(value, (property, item) => {
      if (property === 'seenBy' || (key === 'users' && property === 'online')) return undefined;
      return item;
    });
    if (serialize(before) === serialize(after)) continue;

    if (Array.isArray(before) && Array.isArray(after)) {
      if (after.length > before.length) return { type:'success', message:added };
      if (after.length < before.length) return { type:'success', message:removed };
    }
    return { type:'success', message:updated };
  }

  if (next.profilePreferences !== undefined && next.profilePreferences !== previous.profilePreferences) return { type:'success', message:'Préférences mises à jour.' };
  if (next.darkMode !== undefined && next.darkMode !== previous.darkMode) return { type:'success', message:'Mode d’affichage modifié.' };
  return null;
}

export const useStore = create<StoreState>()(persist((baseSet, get) => {
  const set: typeof baseSet = (partial, replace) => {
    const previous = get();
    const next = typeof partial === 'function' ? partial(previous) : partial;
    const feedback = next ? getActionFeedback(previous, next) : null;
    if (feedback && next) {
      baseSet({ ...next, actionFeedback:{ ...feedback, id:++feedbackId } }, replace);
      return;
    }
    baseSet(next, replace);
  };

  return ({
  ...initial(),
  setRole: role => set({ role, activeUserId: role === 'directeur' ? 'u1' : 'u2', activeProjectId: null, selectedTaskId:null, page: 'overview' }),
  setActiveUser: id => { const user = get().users.find(item => item.id === id); if (user) set({ activeUserId: id, role: user.role, activeProjectId: null, selectedTaskId:null, page: 'overview' }); },
  setSessionUser: user => set(state => ({ users: state.users.some(item => item.id === user.id) ? state.users.map(item => item.id === user.id ? { ...item, ...user, online: true } : item) : [...state.users, { ...user, online: true }], activeUserId: user.id, role: user.role, activeProjectId: null, selectedTaskId: null, page: 'overview' })),
  setPage: page => set(state => ({ page, ...(page === 'tasks' ? { selectedTaskId: null, taskViewResetKey:state.taskViewResetKey+1 } : {}) })),
  openProject: activeProjectId => set({ activeProjectId, page: activeProjectId ? 'tasks' : 'projects', lastActionError: null }),
  openTask: id => {const state=get();const task=state.tasks.find(item=>item.id===id);if(task&&state.role==='collaborateur'&&!task.assigneeIds.includes(state.activeUserId))return set({selectedTaskId:null,lastActionError:'Cette tâche ne vous est pas affectée.'});set({selectedTaskId:task?.id??null,...(task?{activeProjectId:task.projectId??null,page:'tasks' as Page}:{})})},
  toggleSidebar: () => set(state => ({ collapsed: !state.collapsed })),
  setProjectView: (projectId, view) => set(state => ({ projectViews: { ...state.projectViews, [projectId]: view } })),
  setActionError: lastActionError => set({ lastActionError }),
  dismissActionFeedback: () => set({ actionFeedback:null }),
  updateOwnProfile:(name,title)=>set(state=>{
    const cleanName=name.trim().slice(0,80),cleanTitle=title.trim().slice(0,100);
    if(!cleanName||!cleanTitle)return {lastActionError:'Le nom et la fonction ne peuvent pas être vides.'};
    return {users:state.users.map(user=>user.id===state.activeUserId?{...user,name:cleanName,title:cleanTitle}:user),lastActionError:null};
  }),
  setTextSize:textSize=>set(state=>({profilePreferences:{...state.profilePreferences,[state.activeUserId]:{...state.profilePreferences[state.activeUserId],textSize}}})),
  setOwnAvatar:avatarDataUrl=>set(state=>({users:state.users.map(user=>user.id===state.activeUserId?{...user,avatarDataUrl:avatarDataUrl??undefined}:user)})),
  toggleDarkMode:()=>set(state=>({darkMode:!state.darkMode})),
  createEvaluationCriterion:(label,description,maxScore)=>set(state=>{
    if(state.role!=='directeur')return {lastActionError:'Seul le directeur peut gérer les critères d’évaluation.'};
    const cleanLabel=label.trim().slice(0,80);if(!cleanLabel)return {lastActionError:'Le nom du critère est obligatoire.'};
    if(state.evaluationCriteria.some(item=>item.label.toLocaleLowerCase()===cleanLabel.toLocaleLowerCase()))return {lastActionError:'Ce critère existe déjà.'};
    return {evaluationCriteria:[...state.evaluationCriteria,{id:`ec${Date.now()}`,label:cleanLabel,description:description.trim().slice(0,240),maxScore:Math.max(1,Math.min(10,Math.round(maxScore))),active:true}],lastActionError:null};
  }),
  updateEvaluationCriterion:(id,label,description,maxScore)=>set(state=>{
    if(state.role!=='directeur')return {lastActionError:'Seul le directeur peut gérer les critères d’évaluation.'};
    const cleanLabel=label.trim().slice(0,80),criterion=state.evaluationCriteria.find(item=>item.id===id);if(!criterion)return {lastActionError:'Ce critère n’existe plus.'};if(!cleanLabel)return {lastActionError:'Le nom du critère est obligatoire.'};
    if(state.evaluationCriteria.some(item=>item.id!==id&&item.label.toLocaleLowerCase()===cleanLabel.toLocaleLowerCase()))return {lastActionError:'Ce critère existe déjà.'};
    const nextMax=Math.max(1,Math.min(10,Math.round(maxScore)));
    return {evaluationCriteria:state.evaluationCriteria.map(item=>item.id===id?{...item,label:cleanLabel,description:description.trim().slice(0,240),maxScore:nextMax}:item),evaluations:state.evaluations.map(evaluation=>evaluation.scores[id]===undefined?evaluation:{...evaluation,scores:{...evaluation.scores,[id]:evaluation.scores[id]/criterion.maxScore*nextMax}}),lastActionError:null};
  }),
  deleteEvaluationCriterion:id=>set(state=>state.role!=='directeur'?{lastActionError:'Seul le directeur peut gérer les critères d’évaluation.'}:{evaluationCriteria:state.evaluationCriteria.filter(item=>item.id!==id),evaluations:state.evaluations.map(item=>{const scores={...item.scores},notes={...item.notes};delete scores[id];delete notes[id];return {...item,scores,notes}}),lastActionError:null}),
  setEvaluationCriterionActive:(id,active)=>set(state=>state.role!=='directeur'?{lastActionError:'Seul le directeur peut gérer les critères d’évaluation.'}:{evaluationCriteria:state.evaluationCriteria.map(item=>item.id===id?{...item,active}:item),lastActionError:null}),
  saveMemberEvaluation:input=>set(state=>{
    if(state.role!=='directeur')return {lastActionError:'Seul le directeur peut évaluer les membres.'};
    if(!state.users.some(user=>user.id===input.userId&&user.role==='collaborateur'))return {lastActionError:'Choisissez un membre valide.'};
    const criteria=state.evaluationCriteria.filter(item=>item.active);if(!criteria.length)return {lastActionError:'Ajoutez au moins un critère actif avant de noter un membre.'};
    const scores=Object.fromEntries(criteria.map(item=>[item.id,Math.max(0,Math.min(item.maxScore,Number(input.scores[item.id]??0)))]));
    const notes=Object.fromEntries(criteria.map(item=>[item.id,(input.notes[item.id]??'').trim().slice(0,500)]));
    const evaluation:MemberEvaluation={id:`ev${Date.now()}`,userId:input.userId,evaluatorId:state.activeUserId,period:input.period,evaluatedAt:input.evaluatedAt,createdAt:new Date().toISOString(),scores,notes,comment:(input.comment??'').trim().slice(0,1000)};
    return {evaluations:[evaluation,...state.evaluations],lastActionError:null};
  }),
  updateMemberEvaluation:(id,input)=>set(state=>{
    if(state.role!=='directeur')return {lastActionError:'Seul le directeur peut modifier les évaluations.'};
    if(!state.evaluations.some(item=>item.id===id))return {lastActionError:'Cette évaluation n’existe plus.'};
    if(!state.users.some(user=>user.id===input.userId&&user.role==='collaborateur'))return {lastActionError:'Choisissez un membre valide.'};
    const criteria=state.evaluationCriteria.filter(item=>item.active);if(!criteria.length)return {lastActionError:'Ajoutez au moins un critère actif avant de noter un membre.'};
    const scores=Object.fromEntries(criteria.filter(item=>input.scores[item.id]!==undefined).map(item=>[item.id,Math.max(0,Math.min(item.maxScore,Number(input.scores[item.id])))]));
    const notes=Object.fromEntries(criteria.map(item=>[item.id,(input.notes[item.id]??'').trim().slice(0,500)]));
    if(!Object.keys(scores).length)return {lastActionError:'Attribuez au moins une note avant d’enregistrer.'};
    return {evaluations:state.evaluations.map(item=>item.id===id?{...item,userId:input.userId,evaluatorId:state.activeUserId,period:input.period,evaluatedAt:input.evaluatedAt,scores,notes,comment:(input.comment??'').trim().slice(0,1000)}:item),lastActionError:null};
  }),
  deleteMemberEvaluation:id=>set(state=>state.role!=='directeur'?{lastActionError:'Seul le directeur peut supprimer les évaluations.'}:{evaluations:state.evaluations.filter(item=>item.id!==id),lastActionError:null}),
  recordActivity:()=>set(state=>{
    const now=Date.now(),userId=state.activeUserId,lastActiveAt={...state.lastActiveAt,[userId]:now},cutoff=now-5*60*1000;
    return {lastActiveAt,users:state.users.map(user=>({...user,online:(lastActiveAt[user.id]??0)>=cutoff}))};
  }),
  refreshPresence:()=>set(state=>{
    const cutoff=Date.now()-5*60*1000;
    if(state.users.every(user=>user.online===((state.lastActiveAt[user.id]??0)>=cutoff)))return state;
    return {users:state.users.map(user=>({...user,online:(state.lastActiveAt[user.id]??0)>=cutoff}))};
  }),
  createProject: (name, description) => {
    if (!can(get().role, 'project.write')) return set({ lastActionError: 'Seul le directeur peut créer un projet.' });
    set(state => ({ projects: [...state.projects, { id: `p${Date.now()}`, name, description, ownerId: state.activeUserId, memberIds: state.users.filter(user => user.role === 'collaborateur').map(user => user.id), start: new Date().toISOString().slice(0, 10), end: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), priority: 'medium', status: 'active' }], lastActionError: null }));
  },
  updateProject: (id,name,description) => set(state=>{
    if(!can(state.role,'project.write'))return {lastActionError:'Seul le directeur peut modifier un projet.'};
    const project=state.projects.find(item=>item.id===id);if(!project)return {lastActionError:'Ce projet n’existe plus.'};
    const updated={...project,name:name.trim(),description:description.trim()};
    if(!updated.name)return {lastActionError:'Le nom du projet est obligatoire.'};
    const at=new Date().toISOString();
    return {projects:state.projects.map(item=>item.id===id?updated:item),activities:[...state.activities,{id:`a${Date.now()}`,projectId:id,userId:state.activeUserId,kind:'history',text:`Projet modifié : ${updated.name}`,at}],lastActionError:null};
  }),
  deleteProject: id => set(state=>{
    if(!can(state.role,'project.delete'))return {lastActionError:'Seul le directeur peut supprimer un projet.'};
    const project=state.projects.find(item=>item.id===id);if(!project)return {lastActionError:'Ce projet n’existe plus.'};
    const removedIds=state.tasks.filter(task=>task.projectId===id).map(task=>task.id);const at=new Date().toISOString();
    return {projects:state.projects.filter(item=>item.id!==id),tasks:state.tasks.filter(task=>task.projectId!==id),comments:state.comments.filter(comment=>!removedIds.includes(comment.taskId)),activities:[...state.activities.filter(activity=>activity.projectId!==id),{id:`a${Date.now()}`,projectId:'',userId:state.activeUserId,kind:'history',text:`Projet supprimé : ${project.name}`,at}],activeProjectId:state.activeProjectId===id?null:state.activeProjectId,selectedTaskId:state.selectedTaskId&&removedIds.includes(state.selectedTaskId)?null:state.selectedTaskId,lastActionError:null};
  }),
  createTask: title => {
    if (!can(get().role, 'task.create')) return set({ lastActionError: 'Seul le directeur peut créer une tâche.' });
    set(state => ({ tasks: [...state.tasks, { id: `t${Date.now()}`, projectId: state.projects[0]?.id, title, description: '', assigneeIds: [], creatorId: state.activeUserId, start: new Date().toISOString().slice(0, 10), end: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), priority: 'medium', status: 'todo', progress: 0, points: 1, order: state.tasks.length, subtasks: [], customValues: {}, blockedBy: [], attachments: [] }], lastActionError: null }));
  },
  createAssignedTask: input => {
    const state = get();
    if (!can(state.role, 'task.create')) return set({ lastActionError: 'Seul le directeur peut créer et affecter une tâche.' });
    const project = state.projects.find(item => item.id === input.projectId);
    if (!project) return set({ lastActionError: 'Choisis un projet valide pour cette tâche.' });
    const assigneeIds = input.assigneeIds.filter(id => project.memberIds.includes(id) && state.users.some(user => user.id === id && user.role === 'collaborateur'));
    const task: Task = { id: `t${Date.now()}`, projectId: project.id, title: input.title.trim(), description: input.description.trim(), assigneeIds, creatorId: state.activeUserId, start: new Date().toISOString().slice(0, 10), end: input.end, priority: input.priority, status: 'todo', progress: 0, points: 1, order: state.tasks.length, subtasks: [], customValues: {}, blockedBy: [], attachments: [] };
    const at=new Date().toISOString();
    set(current => ({ tasks: [...current.tasks, task],activities:[...current.activities,{id:`a${Date.now()}`,projectId:project.id,taskId:task.id,userId:current.activeUserId,kind:'history',text:`Tâche créée et affectée : ${task.title}`,at}],notifications:[...current.notifications,...assigneeIds.map(userId=>({id:`n${Date.now()}${userId}`,userId,kind:'task-assigned',text:`Une tâche vous a été affectée : « ${task.title} »`,ref:task.id,read:false,at}))], activeProjectId: project.id, lastActionError: null }));
  },
  updateAssignedTask: (id,input) => set(state=>{
    if(!can(state.role,'task.edit'))return {lastActionError:'Seul le directeur peut modifier les détails d’une tâche.'};
    const task=state.tasks.find(item=>item.id===id);const project=state.projects.find(item=>item.id===input.projectId);
    if(!task)return {lastActionError:'Cette tâche n’existe plus.'};if(!project)return {lastActionError:'Choisis un projet valide pour cette tâche.'};
    const assigneeIds=input.assigneeIds.filter(userId=>project.memberIds.includes(userId)&&state.users.some(user=>user.id===userId&&user.role==='collaborateur'));
    const updated={...task,title:input.title.trim(),description:input.description.trim(),projectId:project.id,assigneeIds,end:input.end,priority:input.priority};
    if(!updated.title)return {lastActionError:'Le titre de la tâche est obligatoire.'};
    const at=new Date().toISOString();
    return {tasks:state.tasks.map(item=>item.id===id?updated:item),activities:[...state.activities,{id:`a${Date.now()}`,projectId:project.id,taskId:id,userId:state.activeUserId,kind:'history',text:`Tâche modifiée : ${updated.title}`,at}],notifications:[...state.notifications,...assigneeIds.filter(userId=>!task.assigneeIds.includes(userId)).map(userId=>({id:`n${Date.now()}${userId}`,userId,kind:'task-assigned',text:`Une tâche vous a été affectée : « ${updated.title} »`,ref:id,read:false,at}))],lastActionError:null};
  }),
  deleteTask: id => set(state=>{
    if(!can(state.role,'task.delete'))return {lastActionError:'Seul le directeur peut supprimer une tâche.'};
    const task=state.tasks.find(item=>item.id===id);if(!task)return {lastActionError:'Cette tâche n’existe plus.'};const at=new Date().toISOString();
    return {tasks:state.tasks.filter(item=>item.id!==id),comments:state.comments.filter(comment=>comment.taskId!==id),activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:id,userId:state.activeUserId,kind:'history',text:`Tâche supprimée : ${task.title}`,at}],selectedTaskId:state.selectedTaskId===id?null:state.selectedTaskId,lastActionError:null};
  }),
  postTaskComment: (taskId, text) => set(state => {
    const task=state.tasks.find(item=>item.id===taskId);
    if(!task||!text.trim()||!mayEditTask(state,task,'task.comment.add')) return { lastActionError:'Vous ne pouvez pas participer à cette conversation.' };
    const comment:Comment={id:`c${Date.now()}`,taskId,authorId:state.activeUserId,text:text.trim(),at:new Date().toISOString(),seenBy:[state.activeUserId]};
    const recipients=[...new Set([...task.assigneeIds,task.creatorId,'u1'])].filter(id=>id!==state.activeUserId);
    const at=comment.at;
    return {comments:[...state.comments,comment],activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId,userId:state.activeUserId,kind:'comment',text:`Message ajouté à « ${task.title} »`,at}],notifications:[...state.notifications,...recipients.map(userId=>({id:`n${Date.now()}${userId}`,userId,kind:'task-comment',text:`${state.users.find(u=>u.id===state.activeUserId)?.name} a commenté « ${task.title} »`,ref:taskId,read:false,at}))],lastActionError:null};
  }),
  editTaskComment:(id,text)=>set(state=>{const comment=state.comments.find(item=>item.id===id),task=comment&&state.tasks.find(item=>item.id===comment.taskId);if(!comment||!task||!text.trim()||!mayEditTask(state,task,'task.comment.add')||(comment.authorId!==state.activeUserId&&!can(state.role,'message.manage')))return {lastActionError:'Vous ne pouvez pas modifier ce commentaire.'};const at=new Date().toISOString();return {comments:state.comments.map(item=>item.id===id?{...item,text:text.trim(),editedAt:at}:item),activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:task.id,userId:state.activeUserId,kind:'history',text:'Commentaire modifié',at}],lastActionError:null}}),
  deleteTaskComment:id=>set(state=>{const comment=state.comments.find(item=>item.id===id),task=comment&&state.tasks.find(item=>item.id===comment.taskId);if(!comment||!task||(comment.authorId!==state.activeUserId&&!can(state.role,'message.manage')))return {lastActionError:'Vous ne pouvez pas supprimer ce commentaire.'};const at=new Date().toISOString();return {comments:state.comments.filter(item=>item.id!==id),activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:task.id,userId:state.activeUserId,kind:'history',text:'Commentaire supprimé',at}],lastActionError:null}}),
  markTaskCommentsSeen: taskId => set(state=>{if(!state.comments.some(comment=>comment.taskId===taskId&&!comment.seenBy.includes(state.activeUserId)))return state;return {comments:state.comments.map(comment=>comment.taskId===taskId&&!comment.seenBy.includes(state.activeUserId)?{...comment,seenBy:[...comment.seenBy,state.activeUserId]}:comment)}}),
  sendTeamMessage: (text,mediaId) => set(state=>{
    if(!can(state.role,'task.comment.add')||(!text.trim()&&!mediaId))return {lastActionError:'Écris un message ou ajoute un média.'};
    const message:TeamMessage={id:`m${Date.now()}`,authorId:state.activeUserId,text:text.trim(),at:new Date().toISOString(),seenBy:[state.activeUserId],...(mediaId?{mediaId}:{})};
    const recipients=state.users.filter(user=>user.id!==state.activeUserId);
    return {teamMessages:[...state.teamMessages,message],activities:[...state.activities,{id:`a${Date.now()}`,projectId:'',userId:state.activeUserId,kind:'comment',text:`Message publié dans le groupe Marketing`,at:message.at}],notifications:[...state.notifications,...recipients.map(user=>({id:`n${Date.now()}${user.id}`,userId:user.id,kind:'team-message',text:`Nouveau message de ${state.users.find(u=>u.id===state.activeUserId)?.name} dans le groupe Marketing`,ref:message.id,read:false,at:message.at}))],lastActionError:null};
  }),
  editTeamMessage:(id,text)=>set(state=>{const message=state.teamMessages.find(item=>item.id===id);if(!message||!text.trim()||(message.authorId!==state.activeUserId&&!can(state.role,'message.manage')))return {lastActionError:'Vous ne pouvez pas modifier ce message.'};return {teamMessages:state.teamMessages.map(item=>item.id===id?{...item,text:text.trim(),editedAt:new Date().toISOString()}:item),lastActionError:null}}),
  deleteTeamMessage:id=>set(state=>{const message=state.teamMessages.find(item=>item.id===id);if(!message||(message.authorId!==state.activeUserId&&!can(state.role,'message.manage')))return {lastActionError:'Vous ne pouvez pas supprimer ce message.'};return {teamMessages:state.teamMessages.filter(item=>item.id!==id),activities:[...state.activities,{id:`a${Date.now()}`,projectId:'',userId:state.activeUserId,kind:'history',text:'Message supprimé du groupe Marketing',at:new Date().toISOString()}],lastActionError:null}}),
  markTeamMessagesSeen: () => set(state=>{if(!state.teamMessages.some(message=>!message.seenBy.includes(state.activeUserId)))return state;return {teamMessages:state.teamMessages.map(message=>!message.seenBy.includes(state.activeUserId)?{...message,seenBy:[...message.seenBy,state.activeUserId]}:message)}}),
  createMessageGroup:(name,memberIds)=>set(state=>{const cleanName=name.trim().slice(0,70);if(!cleanName)return {lastActionError:'Donne un nom au groupe.'};const members=[...new Set([...memberIds,state.activeUserId])].filter(id=>state.users.some(user=>user.id===id));if(members.length<2)return {lastActionError:'Choisis au moins un autre membre.'};const group:MessageGroup={id:`mg${Date.now()}`,name:cleanName,memberIds:members,createdBy:state.activeUserId,createdAt:new Date().toISOString()};return {messageGroups:[group,...state.messageGroups],lastActionError:null}}),
  updateMessageGroup:(id,name,memberIds)=>set(state=>{const group=state.messageGroups.find(item=>item.id===id);if(!group||(group.createdBy!==state.activeUserId&&state.role!=='directeur'))return {lastActionError:'Seul le créateur ou le directeur peut modifier ce groupe.'};const cleanName=name.trim().slice(0,70),members=[...new Set([...memberIds,state.activeUserId])].filter(userId=>state.users.some(user=>user.id===userId));if(!cleanName)return {lastActionError:'Donne un nom au groupe.'};if(members.length<2)return {lastActionError:'Un groupe doit contenir au moins deux membres.'};return {messageGroups:state.messageGroups.map(item=>item.id===id?{...item,name:cleanName,memberIds:members}:item),lastActionError:null}}),
  deleteMessageGroup:id=>set(state=>{const group=state.messageGroups.find(item=>item.id===id);if(!group||(group.createdBy!==state.activeUserId&&state.role!=='directeur'))return {lastActionError:'Seul le créateur ou le directeur peut supprimer ce groupe.'};return {messageGroups:state.messageGroups.filter(item=>item.id!==id),groupMessages:state.groupMessages.filter(message=>message.groupId!==id),lastActionError:null}}),
  sendGroupMessage:(groupId,text,mediaId)=>set(state=>{const group=state.messageGroups.find(item=>item.id===groupId);if(!group||!group.memberIds.includes(state.activeUserId)||(!text.trim()&&!mediaId))return {lastActionError:'Vous ne pouvez pas écrire dans ce groupe.'};const message:GroupMessage={id:`gm${Date.now()}`,groupId,authorId:state.activeUserId,text:text.trim(),at:new Date().toISOString(),seenBy:[state.activeUserId],...(mediaId?{mediaId}:{})};const recipients=group.memberIds.filter(id=>id!==state.activeUserId);return {groupMessages:[...state.groupMessages,message],notifications:[...state.notifications,...recipients.map(userId=>({id:`n${Date.now()}${userId}`,userId,kind:'group-message',text:`Nouveau message dans « ${group.name} »`,ref:groupId,read:false,at:message.at}))],lastActionError:null}}),
  editGroupMessage:(id,text)=>set(state=>{const message=state.groupMessages.find(item=>item.id===id),group=message&&state.messageGroups.find(item=>item.id===message.groupId);if(!message||!group||!text.trim()||(message.authorId!==state.activeUserId&&group.createdBy!==state.activeUserId&&state.role!=='directeur'))return {lastActionError:'Vous ne pouvez pas modifier ce message.'};return {groupMessages:state.groupMessages.map(item=>item.id===id?{...item,text:text.trim(),editedAt:new Date().toISOString()}:item),lastActionError:null}}),
  deleteGroupMessage:id=>set(state=>{const message=state.groupMessages.find(item=>item.id===id),group=message&&state.messageGroups.find(item=>item.id===message.groupId);if(!message||!group||(message.authorId!==state.activeUserId&&group.createdBy!==state.activeUserId&&state.role!=='directeur'))return {lastActionError:'Vous ne pouvez pas supprimer ce message.'};return {groupMessages:state.groupMessages.filter(item=>item.id!==id),lastActionError:null}}),
  markGroupMessagesSeen:groupId=>set(state=>{if(!state.groupMessages.some(message=>message.groupId===groupId&&!message.seenBy.includes(state.activeUserId)))return state;return {groupMessages:state.groupMessages.map(message=>message.groupId===groupId&&!message.seenBy.includes(state.activeUserId)?{...message,seenBy:[...message.seenBy,state.activeUserId]}:message)}}),
  createForumGroup:(name,description,memberIds)=>set(state=>{const cleanName=name.trim().slice(0,70);if(!cleanName)return {lastActionError:'Donne un nom à cet espace de discussion.'};const members=[...new Set([...memberIds,state.activeUserId])].filter(id=>state.users.some(user=>user.id===id));if(members.length<2)return {lastActionError:'Choisis au moins un autre membre.'};const group:ForumGroup={id:`fg${Date.now()}`,name:cleanName,description:description.trim().slice(0,240),memberIds:members,createdBy:state.activeUserId,createdAt:new Date().toISOString()};return {forumGroups:[group,...state.forumGroups],lastActionError:null}}),
  updateForumGroup:(id,name,description,memberIds)=>set(state=>{const group=state.forumGroups.find(item=>item.id===id);if(!group||(group.createdBy!==state.activeUserId&&state.role!=='directeur'))return {lastActionError:'Seul le créateur ou le directeur peut modifier cet espace.'};const cleanName=name.trim().slice(0,70),members=[...new Set([...memberIds,state.activeUserId])].filter(userId=>state.users.some(user=>user.id===userId));if(!cleanName)return {lastActionError:'Donne un nom à cet espace de discussion.'};if(members.length<2)return {lastActionError:'Un espace doit contenir au moins deux membres.'};return {forumGroups:state.forumGroups.map(item=>item.id===id?{...item,name:cleanName,description:description.trim().slice(0,240),memberIds:members}:item),lastActionError:null}}),
  deleteForumGroup:id=>set(state=>{const group=state.forumGroups.find(item=>item.id===id);if(!group||(group.createdBy!==state.activeUserId&&state.role!=='directeur'))return {lastActionError:'Seul le créateur ou le directeur peut supprimer cet espace.'};return {forumGroups:state.forumGroups.filter(item=>item.id!==id),forumTopics:state.forumTopics.filter(topic=>topic.groupId!==id),lastActionError:null}}),
  createForumTopic:(title,body,category,groupId)=>set(state=>{
    const group=groupId?state.forumGroups.find(item=>item.id===groupId):null;
    if(groupId&&(!group||!group.memberIds.includes(state.activeUserId)))return {lastActionError:'Vous n’avez pas accès à cet espace de discussion.'};
    if(!groupId&&state.role!=='directeur')return {lastActionError:'Seul le directeur peut publier un sujet dans le forum général.'};
    if(!title.trim()||!body.trim())return {lastActionError:'Ajoutez un titre et un message.'};
    const topic:ForumTopic={id:`forum${Date.now()}`,title:title.trim(),body:body.trim(),category:category.trim().replace(/^#/,'').toLowerCase()||'discussion',authorId:state.activeUserId,at:new Date().toISOString(),replies:[],likedBy:[],bookmarkedBy:[],...(groupId?{groupId}:{})};
    return {forumTopics:[topic,...state.forumTopics],lastActionError:null};
  }),
  replyForumTopic:(topicId,text)=>set(state=>{
    if(!text.trim())return {lastActionError:'Écrivez une réponse avant de publier.'};
    const topic=state.forumTopics.find(item=>item.id===topicId);
    if(!topic)return {lastActionError:'Ce sujet n’existe plus.'};
    const reply={id:`reply${Date.now()}`,authorId:state.activeUserId,text:text.trim(),at:new Date().toISOString()};
    return {forumTopics:state.forumTopics.map(item=>item.id===topicId?{...item,replies:[...item.replies,reply]}:item),lastActionError:null};
  }),
  deleteForumTopic:id=>set(state=>{
    const topic=state.forumTopics.find(item=>item.id===id);
    const group=topic?.groupId?state.forumGroups.find(item=>item.id===topic.groupId):null;
    if(!topic||(state.role!=='directeur'&&topic.authorId!==state.activeUserId&&group?.createdBy!==state.activeUserId))return {lastActionError:'Vous ne pouvez pas modérer ce sujet.'};
    return {forumTopics:state.forumTopics.filter(item=>item.id!==id),lastActionError:null};
  }),
  deleteForumReply:(topicId,replyId)=>set(state=>{
    const topic=state.forumTopics.find(item=>item.id===topicId),reply=topic?.replies.find(item=>item.id===replyId);
    const group=topic?.groupId?state.forumGroups.find(item=>item.id===topic.groupId):null;
    if(!topic||!reply||(reply.authorId!==state.activeUserId&&state.role!=='directeur'&&group?.createdBy!==state.activeUserId))return {lastActionError:'Vous ne pouvez pas supprimer cette réponse.'};
    return {forumTopics:state.forumTopics.map(item=>item.id===topicId?{...item,replies:item.replies.filter(entry=>entry.id!==replyId)}:item),lastActionError:null};
  }),
  toggleForumLike:id=>set(state=>({forumTopics:state.forumTopics.map(topic=>topic.id!==id?topic:{...topic,likedBy:topic.likedBy.includes(state.activeUserId)?topic.likedBy.filter(userId=>userId!==state.activeUserId):[...topic.likedBy,state.activeUserId]}),lastActionError:null})),
  toggleForumBookmark:id=>set(state=>({forumTopics:state.forumTopics.map(topic=>topic.id!==id?topic:{...topic,bookmarkedBy:topic.bookmarkedBy.includes(state.activeUserId)?topic.bookmarkedBy.filter(userId=>userId!==state.activeUserId):[...topic.bookmarkedBy,state.activeUserId]}),lastActionError:null})),
  sendPrivateMessage: (recipientId,text,mediaId) => set(state=>{
    if(recipientId===state.activeUserId||!state.users.some(user=>user.id===recipientId))return {lastActionError:'Choisissez un autre membre de l’équipe.'};
    if(!text.trim()&&!mediaId)return {lastActionError:'Écrivez un message ou ajoutez une pièce jointe avant d’envoyer.'};
    const at=new Date().toISOString(),message:PrivateMessage={id:`dm${Date.now()}`,senderId:state.activeUserId,recipientId,text:text.trim(),at,seenBy:[state.activeUserId],mediaId};
    const peer=state.users.find(user=>user.id===recipientId)!;
    return {privateMessages:[...state.privateMessages,message],activities:[...state.activities,{id:`a${Date.now()}`,projectId:'',userId:state.activeUserId,kind:'history',text:`Message privé envoyé à ${peer.name}`,at}],notifications:[...state.notifications,{id:`n${Date.now()}`,userId:recipientId,kind:'private-message',text:`${state.users.find(u=>u.id===state.activeUserId)?.name} vous a envoyé un message`,ref:message.id,read:false,at}],lastActionError:null};
  }),
  editPrivateMessage:(id,text)=>set(state=>{const message=state.privateMessages.find(item=>item.id===id);if(!message||message.senderId!==state.activeUserId||!text.trim())return {lastActionError:'Vous ne pouvez modifier que vos messages privés.'};return {privateMessages:state.privateMessages.map(item=>item.id===id?{...item,text:text.trim(),editedAt:new Date().toISOString()}:item),lastActionError:null}}),
  deletePrivateMessage:id=>set(state=>{const message=state.privateMessages.find(item=>item.id===id);if(!message||message.senderId!==state.activeUserId)return {lastActionError:'Vous ne pouvez supprimer que vos messages privés.'};return {privateMessages:state.privateMessages.filter(item=>item.id!==id),activities:[...state.activities,{id:`a${Date.now()}`,projectId:'',userId:state.activeUserId,kind:'history',text:'Message privé supprimé',at:new Date().toISOString()}],lastActionError:null}}),
  openTeamMessage:id=>set({page:'messages',teamMessageFocusId:id,privateChatPeerId:null,privateMessageFocusId:null}),
  openPrivateChat:(peerId,messageId)=>set({page:'messages',privateChatPeerId:peerId,privateMessageFocusId:messageId??null,teamMessageFocusId:null}),
  clearMessageFocus:()=>set({teamMessageFocusId:null,privateMessageFocusId:null}), clearPrivateChat:()=>set({privateChatPeerId:null,privateMessageFocusId:null}),
  markPrivateMessagesSeen: peerId => set(state=>{if(!state.privateMessages.some(message=>message.senderId===peerId&&message.recipientId===state.activeUserId&&!message.seenBy.includes(state.activeUserId)))return state;return {privateMessages:state.privateMessages.map(message=>(message.senderId===peerId&&message.recipientId===state.activeUserId&&!message.seenBy.includes(state.activeUserId))?{...message,seenBy:[...message.seenBy,state.activeUserId]}:message)}}),
  markNotificationsRead: () => set(state=>({notifications:state.notifications.map(item=>item.userId===state.activeUserId&&!item.read?{...item,read:true}:item)})),
  addTeamMedia: media => {
    if(!can(get().role,'task.attachment.add')){set({lastActionError:'Vous ne pouvez pas déposer de fichier.'});return null;}
    if(media.size>3*1024*1024){set({lastActionError:'Le fichier dépasse la limite de 3 Mo pour la médiathèque de démonstration.'});return null;}
    const saved:TeamMedia={...media,id:`media${Date.now()}`,uploadedBy:get().activeUserId,uploadedAt:new Date().toISOString()};
    set(current=>({mediaLibrary:[saved,...current.mediaLibrary],activities:[...current.activities,{id:`a${Date.now()}`,projectId:'',userId:current.activeUserId,kind:'file',text:`Fichier déposé : ${media.name}`,at:saved.uploadedAt}],lastActionError:null}));
    return saved.id;
  },
  removeTeamMedia: id => set(state=>{
    const media=state.mediaLibrary.find(item=>item.id===id);
    if(!media)return {};
    if(state.role!=='directeur'&&media.uploadedBy!==state.activeUserId)return {lastActionError:'Tu peux retirer uniquement les fichiers que tu as déposés.'};
    return {mediaLibrary:state.mediaLibrary.filter(item=>item.id!==id),teamMessages:state.teamMessages.map(message=>message.mediaId===id?{...message,mediaId:undefined}:message),activities:[...state.activities,{id:`a${Date.now()}`,projectId:'',userId:state.activeUserId,kind:'history',text:`Fichier retiré de la médiathèque : ${media.name}`,at:new Date().toISOString()}],lastActionError:null};
  }),
  setProgress: (id, progress) => set(state => {
    const task = state.tasks.find(item => item.id === id);
    if (!task || !mayEditTask(state, task, 'task.progress')) return { lastActionError: 'Vous ne pouvez modifier que vos tâches assignées.' };
    const bounded = Math.max(0, Math.min(100, progress));
    if(bounded===task.progress)return {lastActionError:null};
    const nextStatus=bounded>=100?'review':task.status==='review'?'doing':task.status;
    const at=new Date().toISOString();
    return { tasks: state.tasks.map(item => item.id !== id ? item : { ...item, progress: bounded, status: nextStatus }),activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:id,userId:state.activeUserId,kind:'history',text:`Avancement de « ${task.title} » : ${task.progress}% → ${bounded}%`,at},...(nextStatus!==task.status?[{id:`a${Date.now()}s`,projectId:task.projectId??'',taskId:id,userId:state.activeUserId,kind:'history' as const,text:`Tâche envoyée « À valider »`,at}]:[])],notifications:nextStatus==='review'&&task.status!=='review'?[...state.notifications,{id:`n${Date.now()}`,userId:'u1',kind:'task-review',text:`« ${task.title} » est prête à valider`,ref:id,read:false,at}]:state.notifications, lastActionError: null };
  }),
  setPriority: (id, priority) => set(state => {
    const task = state.tasks.find(item => item.id === id);
    if (!task || !mayEditTask(state, task, 'task.priority')) return { lastActionError: 'Seul le directeur peut changer la priorité.' };
    if(task.priority===priority)return {lastActionError:null};
    const at=new Date().toISOString();
    return { tasks: state.tasks.map(item => item.id === id ? { ...item, priority } : item),activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:id,userId:state.activeUserId,kind:'history',text:`Priorité de « ${task.title} » modifiée : ${task.priority} → ${priority}`,at}], lastActionError: null };
  }),
  setTaskStatus: (id, status) => set(state => {
    const task = state.tasks.find(item => item.id === id);
    if (!task) return { lastActionError: 'Cette tâche n’existe plus.' };
    if (status === 'done') {
      if (!can(state.role, 'task.validate')) return { lastActionError: 'Seul le directeur peut valider une tâche.' };
      const at=new Date().toISOString();
      return { tasks: state.tasks.map(item => item.id === id ? { ...item, status: 'done', progress: 100, archived: true } : item),activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:id,userId:state.activeUserId,kind:'history',text:`Tâche « ${task.title} » validée et archivée`,at}],notifications:[...state.notifications,...task.assigneeIds.filter(userId=>userId!==state.activeUserId).map(userId=>({id:`n${Date.now()}${userId}`,userId,kind:'task-validated',text:`« ${task.title} » a été validée`,ref:id,read:false,at}))], lastActionError: null };
    }
    if (!mayEditTask(state, task, state.role === 'directeur' ? 'task.reorder.all' : 'task.reorder.own')) return { lastActionError: 'Vous ne pouvez pas modifier cette tâche.' };
    if (status === 'doing' && task.blockedBy.some(dependencyId => state.tasks.some(dependency => dependency.id === dependencyId && dependency.status !== 'done'))) return { lastActionError: 'Cette tâche est bloquée : terminez d’abord ses dépendances.' };
    const at=new Date().toISOString();
    return { tasks: state.tasks.map(item => item.id === id ? { ...item, status, progress: status === 'todo' ? 0 : item.progress } : item),activities:task.status===status?state.activities:[...state.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:id,userId:state.activeUserId,kind:'history',text:`Statut de « ${task.title} » changé : ${task.status} → ${status}`,at}], lastActionError: null };
  }),
  moveTask: (id, status) => {
    const state = get(), task = state.tasks.find(item => item.id === id);
    if (!task) return set({ lastActionError: 'Cette tâche n’existe plus.' });
    if (status === 'done') return get().setTaskStatus(id, status);
    const action = state.role === 'directeur' ? 'task.reorder.all' : 'task.reorder.own';
    if (!mayEditTask(state, task, action)) return set({ lastActionError: 'Vous ne pouvez déplacer que vos tâches assignées.' });
    if (status === 'doing' && task.blockedBy.some(dependencyId => state.tasks.some(dependency => dependency.id === dependencyId && dependency.status !== 'done'))) return set({ lastActionError: 'Cette tâche est bloquée : terminez d’abord ses dépendances.' });
    set(current => { const order = Math.max(-1, ...current.tasks.filter(item => item.id !== id && item.status === status && !item.archived).map(item => item.order)) + 1; const at=new Date().toISOString();return { tasks: current.tasks.map(item => item.id !== id ? item : { ...item, status, order, progress: status === 'todo' ? 0 : item.progress }),activities:task.status===status?current.activities:[...current.activities,{id:`a${Date.now()}`,projectId:task.projectId??'',taskId:id,userId:current.activeUserId,kind:'history',text:`Tâche « ${task.title} » déplacée : ${task.status} → ${status}`,at}], lastActionError: null }; });
  },
  reset: () => set(initial()),
});
}, {
  name: 'ev-tasks-v2', version: 17, storage: createJSONStorage(() => localStorage),
  merge: (persistedState, currentState) => ({ ...currentState, ...(persistedState as Partial<StoreState>), selectedTaskId:null, actionFeedback:null }),
  partialize: state => { const { actionFeedback: _actionFeedback, ...persisted } = state; return { ...persisted, selectedTaskId:null }; },
  migrate: persisted => {
    const stored = (persisted ?? {}) as Partial<StoreState>;
    const base = initial();
    const savedUsers = (stored.users ?? base.users).filter(user => !/karim|directeur\s*g[ée]n[ée]ral|\bdg\b/i.test(`${user.name} ${user.title}`));
    const validUserIds = new Set(savedUsers.map(user => user.id));
    const savedActiveId = savedUsers.some(user => user.id === stored.activeUserId) ? stored.activeUserId! : 'u1';
    const active = savedUsers.find(user => user.id === savedActiveId)!;
    const cleanProjects=(stored.projects ?? base.projects).map(project=>({...project,ownerId:validUserIds.has(project.ownerId)?project.ownerId:'u1',memberIds:project.memberIds.filter(id=>validUserIds.has(id))}));
    const cleanTasks=(stored.tasks ?? base.tasks).map(normalizeTask).map(task=>({...task,creatorId:validUserIds.has(task.creatorId)?task.creatorId:'u1',assigneeIds:task.assigneeIds.filter(id=>validUserIds.has(id))}));
    const savedForumTopics=stored.forumTopics?.length?stored.forumTopics:base.forumTopics;
    const messageGroups=(stored.messageGroups??[]).filter(group=>validUserIds.has(group.createdBy)).map(group=>({...group,memberIds:group.memberIds.filter(id=>validUserIds.has(id))}));
    const forumGroups=(stored.forumGroups??[]).filter(group=>validUserIds.has(group.createdBy)).map(group=>({...group,memberIds:group.memberIds.filter(id=>validUserIds.has(id))}));
    const validMessageGroupIds=new Set(messageGroups.map(group=>group.id)),validForumGroupIds=new Set(forumGroups.map(group=>group.id));
    const profilePreferences=Object.fromEntries(savedUsers.map(user=>{const preference=stored.profilePreferences?.[user.id];return [user.id,{textSize:preference?.textSize==='normal'?'normal':'large'}]}));
    return { ...base, ...stored, darkMode:true, selectedTaskId:null, actionFeedback:null, messageGroups,groupMessages:(stored.groupMessages??[]).filter(item=>validMessageGroupIds.has(item.groupId)&&validUserIds.has(item.authorId)).map(item=>({...item,seenBy:item.seenBy.filter(id=>validUserIds.has(id))})),forumGroups,evaluationCriteria:stored.evaluationCriteria?.length?stored.evaluationCriteria:base.evaluationCriteria,evaluations:(stored.evaluations??[]).filter(item=>validUserIds.has(item.userId)&&validUserIds.has(item.evaluatorId)), users: savedUsers, lastActiveAt:stored.lastActiveAt??{}, profilePreferences, activeUserId: savedActiveId, activeProjectId: stored.activeProjectId ?? null, role: active.role, projects: cleanProjects, tasks: cleanTasks, customFields: stored.customFields ?? [], taskTypes: stored.taskTypes ?? [], sections: stored.sections ?? [], projectViews: stored.projectViews ?? {}, comments: (stored.comments ?? []).filter(item=>validUserIds.has(item.authorId)), projectComments: (stored.projectComments ?? []).filter(item=>validUserIds.has(item.authorId)), teamMessages: (stored.teamMessages ?? []).filter(item=>validUserIds.has(item.authorId)), forumTopics: savedForumTopics.filter(topic=>validUserIds.has(topic.authorId)&&topic.replies.every(reply=>validUserIds.has(reply.authorId))&&(!topic.groupId||validForumGroupIds.has(topic.groupId))).map(topic=>({...topic,category:topic.category??'discussion',likedBy:(topic.likedBy??[]).filter(id=>validUserIds.has(id)),bookmarkedBy:(topic.bookmarkedBy??[]).filter(id=>validUserIds.has(id))})), privateMessages: (stored.privateMessages ?? []).filter(item=>validUserIds.has(item.senderId)&&validUserIds.has(item.recipientId)), mediaLibrary: (stored.mediaLibrary ?? []).filter(item=>validUserIds.has(item.uploadedBy)), activities: (stored.activities ?? []).filter(item=>validUserIds.has(item.userId)), notifications: (stored.notifications ?? []).filter(item=>validUserIds.has(item.userId)), projectTemplates: stored.projectTemplates ?? [], lastActionError: null } as StoreState;
  },
}));
