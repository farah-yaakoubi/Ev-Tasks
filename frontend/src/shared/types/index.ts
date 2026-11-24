export type Role = 'directeur' | 'collaborateur';
export type Status = 'todo' | 'doing' | 'waiting' | 'review' | 'fix' | 'done';
export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type CustomFieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox';
export type CustomFieldValue = string | number | boolean | null;
export type TaskViewMode = 'list' | 'kanban' | 'calendar' | 'timeline';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';
export type AttachmentSource = 'local' | 'url';

export interface User { id: string; name: string; title: string; role: Role; online: boolean; avatarDataUrl?: string }
export interface Project {
  id: string; name: string; description: string; ownerId: string; memberIds: string[];
  start: string; end: string; priority: Priority; status: 'active' | 'closed';
}
export interface CustomField { id: string; projectId: string; label: string; type: CustomFieldType; options?: string[] }
export interface Subtask { id: string; label: string; done: boolean; assigneeIds: string[] }
export interface TaskRecurrence { frequency: RecurrenceFrequency; interval: number }
export interface AttachmentVersion { id: string; name: string; url: string; addedBy: string; addedAt: string }
export interface TaskAttachment { id: string; source: AttachmentSource; name: string; url: string; addedBy: string; addedAt: string; versions: AttachmentVersion[] }
export interface Task {
  id: string; projectId?: string; sectionId?: string; taskTypeId?: string; title: string; description: string;
  assigneeIds: string[]; creatorId: string; start: string; end: string; priority: Priority; status: Status;
  progress: number; points: number; order: number; subtasks: Subtask[]; archived?: boolean;
  customValues: Record<string, CustomFieldValue>; blockedBy: string[]; recurrence?: TaskRecurrence;
  attachments: TaskAttachment[];
}
export interface TaskTypeChecklistItem { id: string; label: string }
export interface TaskType {
  id: string; name: string; icon: string; color: string; defaultPriority: Priority;
  checklist: TaskTypeChecklistItem[]; fieldDefaults: Record<string, CustomFieldValue>;
}
export interface ProjectSection { id: string; projectId: string; name: string; order: number; collapsed: boolean }
export interface ProjectTemplateTask { title: string; taskTypeId?: string; priority?: Priority }
export interface ProjectTemplateSection { name: string; tasks: ProjectTemplateTask[] }
export interface ProjectTemplate {
  id: string; name: string; description: string; sections: ProjectTemplateSection[];
  customFields: Omit<CustomField, 'id' | 'projectId'>[];
}
export interface Comment { id: string; taskId: string; authorId: string; text: string; at: string; editedAt?: string; seenBy: string[] }
export interface ProjectComment { id: string; projectId: string; authorId: string; text: string; at: string; seenBy: string[] }
export interface TeamMessage { id: string; authorId: string; text: string; at: string; editedAt?: string; seenBy: string[]; mediaId?: string }
export interface ForumReply { id: string; authorId: string; text: string; at: string }
export interface ForumTopic { id: string; title: string; body: string; category: string; authorId: string; at: string; replies: ForumReply[]; likedBy: string[]; bookmarkedBy: string[]; groupId?:string }
export interface MessageGroup { id:string; name:string; memberIds:string[]; createdBy:string; createdAt:string }
export interface GroupMessage { id:string; groupId:string; authorId:string; text:string; at:string; editedAt?:string; seenBy:string[]; mediaId?:string }
export interface ForumGroup { id:string; name:string; description:string; memberIds:string[]; createdBy:string; createdAt:string }
export interface PrivateMessage { id: string; senderId: string; recipientId: string; text: string; at: string; editedAt?: string; seenBy: string[]; mediaId?: string }
export interface TeamMedia { id: string; name: string; mimeType: string; size: number; dataUrl: string; uploadedBy: string; uploadedAt: string }
export interface Activity { id: string; projectId: string; taskId?: string; userId: string; kind: 'comment' | 'file' | 'history'; text: string; at: string }
export interface Notification { id: string; userId: string; kind: string; text: string; ref?: string; read: boolean; at: string }
export type EvaluationPeriod='daily'|'monthly'|'yearly';
export interface EvaluationCriterion { id:string; label:string; description:string; maxScore:number; active:boolean }
export interface MemberEvaluation { id:string; userId:string; evaluatorId:string; period:EvaluationPeriod; evaluatedAt:string; scores:Record<string,number>; notes:Record<string,string>; comment?:string; createdAt:string }
