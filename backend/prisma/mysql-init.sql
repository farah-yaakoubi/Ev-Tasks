-- Dedicated shadow database used by `prisma migrate dev`.
CREATE DATABASE IF NOT EXISTS ev_tasks_shadow;
GRANT ALL PRIVILEGES ON ev_tasks_shadow.* TO 'evtasks_app'@'%';
