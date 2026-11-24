import type { Role } from '@/shared/types';

export type Action =
  | 'project.write' | 'project.delete' | 'member.invite' | 'task.create' | 'task.edit' | 'task.delete' | 'task.priority' | 'task.progress' | 'task.validate'
  | 'task.reorder.all' | 'task.reorder.own' | 'task.custom.edit' | 'tasktype.manage' | 'field.manage'
  | 'template.use' | 'dependency.edit' | 'section.manage' | 'subtask.manage' | 'task.recurrence.manage'
  | 'task.attachment.add' | 'task.comment.add' | 'message.manage' | 'planning.view.all' | 'reporting.all';

const permissions: Record<Role, Action[]> = {
  directeur: [
    'project.write', 'project.delete', 'member.invite', 'task.create', 'task.edit', 'task.delete', 'task.priority', 'task.progress', 'task.validate',
    'task.reorder.all', 'task.reorder.own', 'task.custom.edit', 'tasktype.manage', 'field.manage',
    'template.use', 'dependency.edit', 'section.manage', 'subtask.manage', 'task.recurrence.manage',
    'task.attachment.add', 'task.comment.add', 'message.manage', 'planning.view.all', 'reporting.all',
  ],
  collaborateur: ['task.progress', 'task.reorder.own', 'task.custom.edit', 'subtask.manage', 'task.attachment.add', 'task.comment.add'],
};

export const can = (role: Role, action: Action): boolean => permissions[role].includes(action);

export const denyReason: Record<Action, string> = {
  'project.write': 'Réservé au directeur', 'project.delete': 'Réservé au directeur', 'member.invite': 'Réservé au directeur',
  'task.create': 'Réservé au directeur', 'task.edit': 'Réservé au directeur', 'task.delete': 'Réservé au directeur', 'task.priority': 'Réservé au directeur',
  'task.progress': 'Vous ne pouvez modifier que vos tâches assignées',
  'task.validate': 'Seul le directeur peut valider une tâche',
  'task.reorder.all': 'Réservé au directeur', 'task.reorder.own': 'Réservé aux tâches qui vous sont assignées',
  'task.custom.edit': 'Vous ne pouvez modifier que les valeurs de vos tâches assignées',
  'tasktype.manage': 'Seul le directeur peut gérer les types de tâches',
  'field.manage': 'Seul le directeur peut gérer les champs personnalisés',
  'template.use': 'Seul le directeur peut créer un projet depuis un modèle',
  'dependency.edit': 'Seul le directeur peut modifier les dépendances',
  'section.manage': 'Seul le directeur peut organiser les sections',
  'subtask.manage': 'Vous ne pouvez modifier que les sous-tâches de vos tâches assignées',
  'task.recurrence.manage': 'Seul le directeur peut gérer les récurrences',
  'task.attachment.add': 'Vous ne pouvez joindre des fichiers qu’à vos tâches assignées',
  'task.comment.add': 'Vous ne pouvez commenter que vos tâches assignées',
  'message.manage': 'Seul le directeur peut modérer les messages de l’équipe',
  'planning.view.all': 'Réservé au directeur', 'reporting.all': 'Réservé au directeur',
};
