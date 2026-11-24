import type { Status } from '@/shared/types';

/** One canonical order and label for status columns, filters, badges and reports. */
export const STATUS_ORDER: readonly Status[] = ['todo','doing','waiting','review','fix','done'];
export const STATUS_LABELS: Record<Status,string> = {
  todo:'À faire',
  doing:'En cours',
  waiting:'En attente',
  review:'À valider',
  fix:'À corriger',
  done:'Terminée',
};
