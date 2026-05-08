export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  deadline: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  project_id: string;
  assignee_id: string | null;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
}

export interface ActivityLog {
  id: string;
  project_id: string | null;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug?: string;
  invite: {
    code: string;
    expires_at: string;
    created_at: string;
  };
  team_lead_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  teamMembers: number;
  overdueTasks: number;
  completionRate: number;
}
