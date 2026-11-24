import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  ClipboardCheck,
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  Sun,
  UsersRound,
  UserRound,
  X,
  Menu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/app/state/store';
import type { Notification, Role, Task } from '@/shared/types';

type DeadlineAlert = { task: Task; daysAway: number };
type NotificationIcon = { Icon: LucideIcon; tone: string };

function notificationIcon(kind: string): NotificationIcon {
  if (kind === 'private-message' || kind === 'group-message' || kind === 'team-message' || kind === 'task-comment') {
    return { Icon: MessageSquare, tone: 'message' };
  }
  if (kind === 'task-review') return { Icon: ClipboardCheck, tone: 'review' };
  if (kind === 'task-validated') return { Icon: CheckCheck, tone: 'success' };
  if (kind === 'task-assigned') return { Icon: CheckSquare, tone: 'task' };
  return { Icon: Bell, tone: 'default' };
}

function getDeadlineAlerts(tasks: Task[], activeUserId: string, role: Role): DeadlineAlert[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks
    .filter(task => !task.archived && task.status !== 'done' && (role === 'directeur' || task.assigneeIds.includes(activeUserId)))
    .flatMap(task => {
      if (!task.end) return [];
      const dueDate = new Date(`${task.end}T00:00:00`);
      if (Number.isNaN(dueDate.getTime())) return [];
      const daysAway = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);
      return daysAway <= 3 ? [{ task, daysAway }] : [];
    })
    .sort((a, b) => {
      const overdueOrder = Number(a.daysAway >= 0) - Number(b.daysAway >= 0);
      if (overdueOrder !== 0) return overdueOrder;
      return a.daysAway < 0 ? b.daysAway - a.daysAway : a.daysAway - b.daysAway;
    });
}

export default function Topbar({ onLogout, onMenu, menuOpen = false }: { onLogout: () => void; onMenu?: () => void; menuOpen?: boolean }) {
  const s = useStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const seenNotifications = useRef<{ userId: string; ids: Set<string> }>({ userId: '', ids: new Set() });
  const currentUser = s.users.find(user => user.id === s.activeUserId);
  const currentNotifications = s.notifications
    .filter(notification => notification.userId === s.activeUserId)
    .sort((a, b) => b.at.localeCompare(a.at));
  const unread = currentNotifications.filter(notification => !notification.read).length;
  const deadlineAlerts = getDeadlineAlerts(s.tasks, s.activeUserId, s.role);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, []);

  useEffect(() => {
    const previous = seenNotifications.current;
    if (previous.userId !== s.activeUserId) {
      seenNotifications.current = { userId: s.activeUserId, ids: new Set(currentNotifications.map(item => item.id)) };
      setToast(null);
      return;
    }

    const nextIds = new Set(currentNotifications.map(item => item.id));
    const newest = currentNotifications.find(item => !previous.ids.has(item.id) && !item.read);
    seenNotifications.current = { userId: s.activeUserId, ids: nextIds };
    if (newest) setToast(newest);
  }, [s.notifications, s.activeUserId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 6500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const openNotification = (item: Notification) => {
    if (item.kind === 'team-message' && item.ref) {
      s.openTeamMessage(item.ref);
    } else if (item.kind === 'private-message' && item.ref) {
      const message = s.privateMessages.find(candidate => candidate.id === item.ref);
      if (message) s.openPrivateChat(message.senderId === s.activeUserId ? message.recipientId : message.senderId, message.id);
      else s.openPrivateChat(item.ref);
    } else if (item.ref) {
      const task = s.tasks.find(candidate => candidate.id === item.ref);
      if (task) s.openTask(task.id);
    }
    setNotificationsOpen(false);
    setToast(null);
    s.markNotificationsRead();
  };

  const deadlineLabel = (daysAway: number) => {
    if (daysAway < 0) {
      const daysLate = Math.abs(daysAway);
      return `En retard de ${daysLate} jour${daysLate === 1 ? '' : 's'}`;
    }
    if (daysAway === 0) return 'Échéance aujourd’hui';
    if (daysAway === 1) return 'Échéance demain';
    return `Échéance dans ${daysAway} jours`;
  };

  return (
    <>
      <header className="topbar">
        <button className="mobile-menu-button" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} onClick={onMenu}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="topbar-context">
          <span className="topbar-dot" />
          <span>EV TASKS</span>
          <span className="topbar-divider">/</span>
          <span className="topbar-current">Service Marketing</span>
        </div>
        <div className="topbar-controls">
          <label className="search-box">
            <Search size={15} />
            <input aria-label="Rechercher" placeholder="Rechercher…" />
            <kbd>⌘ K</kbd>
          </label>
          <button aria-label="Messages" className="topbar-icon" onClick={() => s.setPage('messages')}>
            <MessageSquare size={17} />
          </button>
          <div className="notification-wrap">
            <button
              aria-label={`Notifications${unread ? `, ${unread} non lues` : ''}`}
              aria-expanded={notificationsOpen}
              className="topbar-icon notification-button"
              onClick={() => setNotificationsOpen(open => !open)}
            >
              <Bell size={19} />
              {unread > 0 && <span className="notification-count">{unread}</span>}
            </button>
            {notificationsOpen && (
              <section className="notification-popover" aria-label="Centre de notifications">
                <header>
                  <div>
                    <strong>Notifications</strong>
                    <small>
                      {unread ? `${unread} nouvelle(s)` : 'Tout est à jour'}
                      {deadlineAlerts.length > 0 && ` · ${deadlineAlerts.length} échéance(s) à surveiller`}
                    </small>
                  </div>
                  <button onClick={() => s.markNotificationsRead()} title="Tout marquer comme lu" aria-label="Tout marquer comme lu">
                    <CheckCheck size={17} />
                  </button>
                </header>
                {deadlineAlerts.length > 0 && (
                  <section className="notification-deadlines" aria-label="Alertes d’échéance">
                    <h3><AlertTriangle size={14} /> Échéances à surveiller</h3>
                    <div className="notification-deadline-list">
                      {deadlineAlerts.slice(0, 5).map(({ task, daysAway }) => (
                        <button
                          className={`notification-deadline ${daysAway < 0 ? 'overdue' : ''}`}
                          key={`${task.id}-${task.end}`}
                          onClick={() => {
                            s.openTask(task.id);
                            setNotificationsOpen(false);
                          }}
                        >
                          <span className="notification-deadline-icon">
                            {daysAway < 0 ? <AlertTriangle size={16} /> : <CalendarDays size={16} />}
                          </span>
                          <span className="notification-deadline-copy">
                            <b>{task.title}</b>
                            <small>{deadlineLabel(daysAway)}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                <div className="notification-list">
                  {currentNotifications.length === 0 ? (
                    deadlineAlerts.length === 0 && <p className="notification-empty">Vous n’avez pas encore de notification.</p>
                  ) : currentNotifications.slice(0, 20).map(item => {
                    const { Icon, tone } = notificationIcon(item.kind);
                    return (
                      <button className={`notification-item ${item.read ? 'read' : ''}`} key={item.id} onClick={() => openNotification(item)}>
                        <span className={`notification-kind-icon tone-${tone}`} aria-hidden="true"><Icon size={16} /></span>
                        <span className="notification-item-copy">
                          <b>{item.text}</b>
                          <small>{new Date(item.at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small>
                        </span>
                        {!item.read && <i className="notification-unread-dot" aria-label="Non lue" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
          <div className={`topbar-profile-menu-wrap ${profileMenuOpen ? 'open' : ''}`} ref={profileMenuRef}>
            <button
              className="topbar-user-summary topbar-profile-trigger"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen(open => !open)}
            >
              <span className="topbar-avatar">
                {currentUser?.avatarDataUrl ? <img src={currentUser.avatarDataUrl} alt="" /> : currentUser?.name.split(' ').map(part => part[0]).join('')}
              </span>
              <span className="topbar-profile-copy"><strong>{currentUser?.name}</strong></span>
              <ChevronDown size={15} />
            </button>
            {profileMenuOpen && (
              <>
                <div className="account-menu-backdrop" aria-hidden="true" onClick={() => setProfileMenuOpen(false)} />
                <section className="account-dropdown" role="menu">
                  <header className="account-dropdown-header">
                    <span className="topbar-avatar">
                      {currentUser?.avatarDataUrl ? <img src={currentUser.avatarDataUrl} alt="" /> : currentUser?.name.split(' ').map(part => part[0]).join('')}
                    </span>
                    <span><strong>{currentUser?.name}</strong><small>{currentUser?.title} · Service Marketing</small></span>
                  </header>
                  <div className="account-dropdown-links">
                    <button role="menuitem" onClick={() => { s.setPage('profile'); setProfileMenuOpen(false); }}><UserRound size={16} /> Mon profil</button>
                    <button role="menuitem" onClick={() => { s.setPage('settings'); setProfileMenuOpen(false); }}><Settings size={16} /> Paramètres</button>
                    <button role="menuitem" onClick={() => { s.setPage('forum'); setProfileMenuOpen(false); }}><UsersRound size={16} /> Forum</button>
                  </div>
                  <div className="account-dark-row">
                    <span>{s.darkMode ? <Moon size={16} /> : <Sun size={16} />} Mode sombre</span>
                    <button
                      type="button"
                      role="switch"
                      aria-label="Activer le mode sombre"
                      aria-checked={s.darkMode}
                      className={`account-dark-switch ${s.darkMode ? 'enabled' : ''}`}
                      onClick={() => s.toggleDarkMode()}
                    >
                      <i />
                    </button>
                  </div>
                  <button className="account-logout" role="menuitem" onClick={() => { setProfileMenuOpen(false); onLogout(); }}>
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </section>
              </>
            )}
          </div>
        </div>
      </header>
      {toast && (() => {
        const { Icon, tone } = notificationIcon(toast.kind);
        return (
          <div className="notification-toast" role="status" aria-live="polite">
            <button className="notification-toast-open" onClick={() => openNotification(toast)}>
              <span className={`notification-kind-icon tone-${tone}`} aria-hidden="true"><Icon size={17} /></span>
              <span><strong>Nouvelle notification</strong><small>{toast.text}</small></span>
            </button>
            <button className="notification-toast-close" aria-label="Fermer l’alerte" onClick={() => setToast(null)}><X size={16} /></button>
          </div>
        );
      })()}
    </>
  );
}
