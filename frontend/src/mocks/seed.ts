import type {User,Project,Task} from '@/shared/types';

export const users:User[]=[
 {id:'u1',name:'Aymen Rebai',title:'Directeur Marketing',role:'directeur',online:true},
 {id:'u2',name:'Farah Yaakoubi',title:'Développeuse full stack',role:'collaborateur',online:true},
 {id:'u3',name:'Bechir Mahouchi',title:'Graphiste designer',role:'collaborateur',online:true},
 {id:'u4',name:'Achref Khemaja',title:'Community manager',role:'collaborateur',online:false},
 {id:'u5',name:'Ramzi Meddeb',title:'Marketing digital',role:'collaborateur',online:true}
];

export const projects:Project[]=[
 {id:'p1',name:'Refonte du site web Groupe Espace Vert',description:'Nouveau site vitrine du groupe.',ownerId:'u1',memberIds:['u2','u3','u5'],start:'2026-10-01',end:'2026-12-20',priority:'high',status:'active'},
 {id:'p2',name:'Développement de la plateforme EV-TASKS',description:'Outil interne de suivi des tâches.',ownerId:'u1',memberIds:['u2','u5'],start:'2026-10-15',end:'2027-01-31',priority:'urgent',status:'active'},
 {id:'p3',name:'Création des supports marketing',description:'Brochures, kakémonos, visuels.',ownerId:'u1',memberIds:['u3','u4'],start:'2026-09-20',end:'2026-12-05',priority:'medium',status:'active'}
];

const t=(id:string,projectId:string,title:string,a:string[],end:string,priority:Task['priority'],status:Task['status'],progress:number,order:number,points=3):Task=>({id,projectId,title,description:'',assigneeIds:a,creatorId:'u1',start:'2026-11-01',end,priority,status,progress,points,order,subtasks:[],customValues:{},blockedBy:[],attachments:[]});
export const tasks:Task[]=[
 t('t1','p2','Concevoir la nouvelle interface',['u3'],'2026-11-25','high','doing',60,0,5),
 t('t2','p2','Développer le module de gestion des projets',['u2'],'2026-11-30','urgent','doing',45,1,8),
 t('t3','p2','Intégrer l’authentification',['u2'],'2026-11-24','high','doing',70,2,5),
 t('t4','p1','Préparer les maquettes responsive',['u3'],'2026-11-22','medium','review',100,0),
 t('t5','p1','Optimiser les performances frontend',['u2'],'2026-12-02','medium','todo',0,0),
 t('t6','p2','Préparer la campagne de lancement',['u5'],'2026-12-10','low','waiting',10,0),
 t('t7','p3','Créer les visuels pour les réseaux sociaux',['u4'],'2026-12-15','low','fix',80,0),
 {...t('t8','p1','Valider la charte graphique',['u3'],'2026-10-30','high','done',100,0),archived:true}
];
