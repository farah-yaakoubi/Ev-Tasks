import type { Activity, EvaluationCriterion, ForumTopic, MemberEvaluation, MessageGroup, Project, Task, TeamMedia, User } from '@/shared/types';
import { useStore } from '@/app/state/store';
import { appConfig } from '@/config/env';
import { ApiClient } from './api-client';

type ResourceName = 'projects' | 'tasks' | 'members' | 'message-groups' | 'forum-topics' | 'media' | 'evaluation-criteria' | 'evaluations' | 'activities';

export interface ReadService<T> {
  list(): Promise<T[]>;
}

function createReadService<T>(resource: ResourceName, mockRead: () => T[], api: ApiClient): ReadService<T> {
  return {
    list: () => appConfig.dataMode === 'mock'
      ? Promise.resolve(mockRead())
      : api.get<T[]>(`/${resource}`),
  };
}

const api = new ApiClient(appConfig.apiBaseUrl);

// Les écrans actuels gardent Zustand; cette couche prépare le basculement progressif vers l’API.
export const services = {
  projects: createReadService<Project>('projects', () => useStore.getState().projects, api),
  tasks: createReadService<Task>('tasks', () => useStore.getState().tasks, api),
  members: createReadService<User>('members', () => useStore.getState().users, api),
  messageGroups: createReadService<MessageGroup>('message-groups', () => useStore.getState().messageGroups, api),
  forumTopics: createReadService<ForumTopic>('forum-topics', () => useStore.getState().forumTopics, api),
  media: createReadService<TeamMedia>('media', () => useStore.getState().mediaLibrary, api),
  evaluationCriteria: createReadService<EvaluationCriterion>('evaluation-criteria', () => useStore.getState().evaluationCriteria, api),
  evaluations: createReadService<MemberEvaluation>('evaluations', () => useStore.getState().evaluations, api),
  activities: createReadService<Activity>('activities', () => useStore.getState().activities, api),
};
