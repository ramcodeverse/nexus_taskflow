import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc,
  Timestamp,
  type DocumentData
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Project, Task, Profile, Notification, ProjectMember, Comment, ActivityLog, Team, TeamMember } from '../types';
import { generateInviteCode } from '../lib/invite';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const mapDoc = <T>(doc: DocumentData): T => {
  const data = doc.data();
  // Convert timestamps to ISO strings for the app's existing types
  const convertedData = { ...data };
  Object.keys(convertedData).forEach(key => {
    if (convertedData[key] instanceof Timestamp) {
      convertedData[key] = convertedData[key].toDate().toISOString();
    }
  });
  return { id: doc.id, ...convertedData } as T;
};

const apiCall = async (endpoint: string, method: string, body: any = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required.");
  
  const token = await user.getIdToken();
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "API call failed");
  }
  return data;
};

export const dataService = {
  profiles: {
    get: async (userId: string) => {
      const path = `profiles/${userId}`;
      try {
        const snap = await getDoc(doc(db, path));
        return snap.exists() ? mapDoc<Profile>(snap) : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    },
    update: async (userId: string, updates: Partial<Profile>) => {
      try {
        await updateDoc(doc(db, `profiles/${userId}`), {
          ...updates,
          updated_at: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `profiles/${userId}`);
      }
    }
  },
  teams: {
    list: async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];
      
      try {
        // Optimised: Use array-contains for instant filtering
        const q = query(collection(db, 'teams'), where('members', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map(mapDoc<Team>);
      } catch (error) {
        console.warn('Could not list teams using members query, trying fallback...', error);
        
        // Fallback: collectionGroup on members subcollection (supported by rules now)
        try {
          // This requires a composite index if filtered further, but a simple collectionGroup query might work
          // Note: In client SDK, collectionGroup is available.
          // But it's often easier to just list and join if fallback is needed.
          const snap = await getDocs(collection(db, 'teams'));
          const allTeams = snap.docs.map(mapDoc<Team>);
          
          const membershipQueries = allTeams.map(async (team) => {
            try {
              const memberDoc = await getDoc(doc(db, `teams/${team.id}/members/${userId}`));
              return memberDoc.exists() ? team : null;
            } catch {
              return null;
            }
          });
          
          const myTeams = await Promise.all(membershipQueries);
          return myTeams.filter((t): t is Team => t !== null);
        } catch (err) {
          console.error('Fallback team listing failed:', err);
          return [];
        }
      }
    },
    listAll: async () => {
      try {
        const snap = await getDocs(collection(db, 'teams'));
        return snap.docs.map(mapDoc<Team>);
      } catch (error) {
        console.warn('Full team listing denied');
        handleFirestoreError(error, OperationType.LIST, 'teams');
        return [];
      }
    },
    getMembers: async (teamId: string) => {
      const path = `teams/${teamId}/members`;
      try {
        const snap = await getDocs(collection(db, path));
        const memberDocs = snap.docs.map(mapDoc<TeamMember>);
        return await Promise.all(memberDocs.map(async (m) => {
          m.profile = await dataService.profiles.get(m.user_id) || undefined;
          return m;
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    },
    create: async (name?: string) => {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Auth required');
      
      const path = 'teams';
      
      try {
        const newTeam = {
          name: name || `New Workspace`,
          slug: (name || `workspace`).toLowerCase().replace(/\s+/g, '-'),
          team_lead_id: userId,
          members: [userId], // Hybrid architecture: array for fast queries
          created_by: userId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          invite: {
            code: "",
            expires_at: null,
            created_at: null
          }
        };
        
        const docRef = await addDoc(collection(db, path), newTeam);
        
        // Add creator as leader
        await setDoc(doc(db, `teams/${docRef.id}/members/${userId}`), {
          team_id: docRef.id,
          user_id: userId,
          role: 'leader',
          joined_at: serverTimestamp()
        });

        // Automatically generate initial invite code via backend
        const inviteResult = await apiCall("/api/invites/generate", "POST", { teamId: docRef.id });
        
        // Update team with invite info from backend
        // Note: The backend update is safer but for UX we update here or rely on the reload
        // Actually, the server /generate API only saves into 'invites' collection in my server.ts.
        // Wait, requested structure says store it in team as well? 
        // "GENERATION REQUIREMENTS: Generate codes during team/workspace creation"
        // I should update team doc with the current invite code.
        
        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);
        await updateDoc(docRef, {
          invite: {
            code: inviteResult.code,
            expires_at: Timestamp.fromDate(expiresAt),
            created_at: serverTimestamp()
          }
        });
        
        const snap = await getDoc(docRef);
        return mapDoc<Team>(snap);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    regenerateInvite: async (teamId: string) => {
      try {
        const inviteResult = await apiCall("/api/invites/generate", "POST", { teamId });
        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

        await updateDoc(doc(db, `teams/${teamId}`), {
          invite: {
            code: inviteResult.code,
            expires_at: Timestamp.fromDate(expiresAt),
            created_at: serverTimestamp()
          },
          updated_at: serverTimestamp()
        });
        
        const snap = await getDoc(doc(db, `teams/${teamId}`));
        return mapDoc<Team>(snap);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `teams/${teamId}`);
      }
    },
    join: async (inviteCode: string) => {
      try {
        const result = await apiCall("/api/invites/join", "POST", { code: inviteCode });
        const teamDoc = await getDoc(doc(db, `teams/${result.teamId}`));
        return mapDoc<Team>(teamDoc);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    removeMember: async (teamId: string, memberId: string) => {
      try {
        await deleteDoc(doc(db, `teams/${teamId}/members/${memberId}`));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `teams/${teamId}/members/${memberId}`);
      }
    }
  },
  projects: {
    list: async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return [];
      
      const path = 'projects';
      try {
        const q = query(collection(db, path), where('members', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map(mapDoc<Project>);
      } catch (error) {
        console.warn('Could not list projects using members query, trying fallback...', error);
        try {
          const snap = await getDocs(collection(db, path));
          return snap.docs.map(mapDoc<Project>);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, path);
          return [];
        }
      }
    },
    get: async (id: string) => {
      const path = `projects/${id}`;
      try {
        const snap = await getDoc(doc(db, path));
        return snap.exists() ? mapDoc<Project>(snap) : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    },
    create: async (project: Partial<Project>) => {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Auth required');
      const path = 'projects';
      try {
        const newProject = {
          ...project,
          members: [userId], // Hybrid architecture
          created_by: userId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, path), newProject);
        
        // Also add the creator as an admin member in sub-collection
        await setDoc(doc(db, `projects/${docRef.id}/members/${userId}`), {
          project_id: docRef.id,
          user_id: userId,
          role: 'admin',
          joined_at: serverTimestamp()
        });

        const snap = await getDoc(docRef);
        return mapDoc<Project>(snap);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    update: async (id: string, updates: Partial<Project>) => {
      const path = `projects/${id}`;
      try {
        await updateDoc(doc(db, path), {
          ...updates,
          updated_at: serverTimestamp()
        });
        const snap = await getDoc(doc(db, path));
        return mapDoc<Project>(snap);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    delete: async (id: string) => {
      const path = `projects/${id}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  },
  tasks: {
    listByProject: async (projectId: string) => {
      const userId = auth.currentUser?.uid;
      if (projectId === 'all') {
        if (!userId) return [];
        try {
          // Optimized: Only fetch tasks for projects you are a member of
          const projectsSnap = await getDocs(query(collection(db, 'projects'), where('members', 'array-contains', userId)));
          const tasksPromises = projectsSnap.docs.map(async (p) => {
            try {
              const tasksSnap = await getDocs(collection(db, `projects/${p.id}/tasks`));
              const taskDocs = tasksSnap.docs.map(mapDoc<Task>);
              
              // Join assignees
              const joinedTasks = await Promise.all(taskDocs.map(async (task) => {
                if (task.assignee_id) {
                  task.assignee = await dataService.profiles.get(task.assignee_id) || undefined;
                }
                return task;
              }));
              return joinedTasks;
            } catch (err) {
              console.warn(`Could not fetch tasks for project ${p.id}:`, err);
              return [];
            }
          });
          
          const tasksArrays = await Promise.all(tasksPromises);
          return tasksArrays.flat();
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'projects/*/tasks');
        }
      }
      const path = `projects/${projectId}/tasks`;
      try {
        const snap = await getDocs(query(collection(db, path), orderBy('position')));
        const taskDocs = snap.docs.map(mapDoc<Task>);
        
        // Join assignees
        const joinedTasks = await Promise.all(taskDocs.map(async (task) => {
          if (task.assignee_id) {
            task.assignee = await dataService.profiles.get(task.assignee_id) || undefined;
          }
          return task;
        }));
        return joinedTasks;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    },
    updateStatus: async (projectId: string, taskId: string, status: Task['status']) => {
      const path = `projects/${projectId}/tasks/${taskId}`;
      try {
        await updateDoc(doc(db, path), {
          status,
          updated_at: serverTimestamp()
        });
        const snap = await getDoc(doc(db, path));
        const task = mapDoc<Task>(snap);
        if (task.assignee_id) {
          task.assignee = await dataService.profiles.get(task.assignee_id) || undefined;
        }
        return task;
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  },
  members: {
    listByProject: async (projectId: string) => {
      const userId = auth.currentUser?.uid;
      if (projectId === 'all') {
        if (!userId) return [];
        try {
          const projectsSnap = await getDocs(query(collection(db, 'projects'), where('members', 'array-contains', userId)));
          const membersPromises = projectsSnap.docs.map(async (p) => {
            try {
              const membersSnap = await getDocs(collection(db, `projects/${p.id}/members`));
              const memberDocs = membersSnap.docs.map(mapDoc<ProjectMember>);
              
              // Join profiles
              return await Promise.all(memberDocs.map(async (m) => {
                m.profile = await dataService.profiles.get(m.user_id) || undefined;
                return m;
              }));
            } catch {
              return [];
            }
          });
          const membersArrays = await Promise.all(membersPromises);
          return membersArrays.flat();
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'projects/*/members');
        }
      }
      const path = `projects/${projectId}/members`;
      try {
        const snap = await getDocs(collection(db, path));
        const memberDocs = snap.docs.map(mapDoc<ProjectMember>);
        
        // Join profiles
        return await Promise.all(memberDocs.map(async (m) => {
          m.profile = await dataService.profiles.get(m.user_id) || undefined;
          return m;
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    },
    listAll: async () => {
      try {
        const snap = await getDocs(collection(db, 'profiles'));
        return snap.docs.map(mapDoc<Profile>);
      } catch (err) {
        console.warn('Listing profiles denied, using fallback:', err);
        // If listing all profiles is denied, we fallback to listing projects then their members
        const members = await dataService.members.listByProject('all');
        if (!members) return [];
        // Extract unique profiles
        const profileMap = new Map<string, Profile>();
        members.forEach(m => {
          if (m.profile) profileMap.set(m.profile.id, m.profile);
        });
        return Array.from(profileMap.values());
      }
    }
  },
  comments: {
    listByTask: async (projectId: string, taskId: string) => {
      const path = `projects/${projectId}/tasks/${taskId}/comments`;
      try {
        const snap = await getDocs(query(collection(db, path), orderBy('created_at')));
        const commentDocs = snap.docs.map(mapDoc<Comment>);
        
        // Join profiles
        return await Promise.all(commentDocs.map(async (c) => {
          c.profile = await dataService.profiles.get(c.user_id) || undefined;
          return c;
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    },
    create: async (projectId: string, taskId: string, comment: Partial<Comment>) => {
      const path = `projects/${projectId}/tasks/${taskId}/comments`;
      try {
        const newComment = {
          ...comment,
          user_id: auth.currentUser?.uid,
          created_at: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, path), newComment);
        const snap = await getDoc(docRef);
        const c = mapDoc<Comment>(snap);
        c.profile = await dataService.profiles.get(c.user_id) || undefined;
        return c;
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }
  },
  activity: {
    listByProject: async (projectId: string) => {
      const userId = auth.currentUser?.uid;
      if (projectId === 'all') {
        if (!userId) return [];
        try {
          const projectsSnap = await getDocs(query(collection(db, 'projects'), where('members', 'array-contains', userId)));
          const activityPromises = projectsSnap.docs.map(async (p) => {
            try {
              const snap = await getDocs(query(collection(db, `projects/${p.id}/activity`), orderBy('created_at', 'desc')));
              const logDocs = snap.docs.map(mapDoc<ActivityLog>);
              
              // Join profiles
              return await Promise.all(logDocs.map(async (l) => {
                l.profile = await dataService.profiles.get(l.user_id) || undefined;
                return l;
              }));
            } catch {
              return [];
            }
          });
          const activityArrays = await Promise.all(activityPromises);
          return activityArrays.flat()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'projects/*/activity');
        }
      }
      const path = `projects/${projectId}/activity`;
      try {
        const snap = await getDocs(query(collection(db, path), orderBy('created_at', 'desc')));
        const logDocs = snap.docs.map(mapDoc<ActivityLog>);
        
        // Join profiles
        return await Promise.all(logDocs.map(async (l) => {
          l.profile = await dataService.profiles.get(l.user_id) || undefined;
          return l;
        }));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  },
  notifications: {
    list: async () => {
      const path = 'notifications';
      try {
        const snap = await getDocs(query(
          collection(db, path), 
          where('user_id', '==', auth.currentUser?.uid),
          orderBy('created_at', 'desc')
        ));
        return snap.docs.map(mapDoc<Notification>);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  },
  utils: {
    seedDemoData: async () => {
      const userId = auth.currentUser?.uid;
      const email = auth.currentUser?.email;
      if (!userId) return;

      // Ensure profile exists
      const profile = await dataService.profiles.get(userId);
      if (!profile) {
        await setDoc(doc(db, `profiles/${userId}`), {
          full_name: auth.currentUser?.displayName || (auth.currentUser?.isAnonymous ? 'Nexus Guest' : (email?.split('@')[0] || 'New User')),
          avatar_url: auth.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          role: 'member',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }

      // Final check: trigger reload for store if needed by updating local state
      // but seedDemoData is usually called from store already.

      // Check if user already has projects
      const projectsQuery = query(collection(db, 'projects'), where('created_by', '==', userId));
      const existingProjects = await getDocs(projectsQuery);
      if (!existingProjects.empty) return;

      // Create a demo project
      const projectRef = await addDoc(collection(db, 'projects'), {
        title: 'Nexus Onboarding: Welcome',
        description: 'Explore the task orchestration capabilities of Nexus. This is your personal workspace.',
        status: 'active',
        priority: 'high',
        color: '#3b82f6',
        deadline: null,
        members: [userId],
        created_by: userId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Add user as admin member
      await setDoc(doc(db, `projects/${projectRef.id}/members/${userId}`), {
        project_id: projectRef.id,
        user_id: userId,
        role: 'admin',
        joined_at: serverTimestamp()
      });

      // Add some sample tasks
      const tasks = [
        { title: 'Explore the Dashboard', status: 'completed', priority: 'low' },
        { title: 'Create your first project', status: 'in-progress', priority: 'medium' },
        { title: 'Invite team members', status: 'todo', priority: 'high' }
      ];

      for (let i = 0; i < tasks.length; i++) {
        await addDoc(collection(db, `projects/${projectRef.id}/tasks`), {
          project_id: projectRef.id,
          assignee_id: userId,
          title: tasks[i].title,
          description: `Sample task to help you get started with Nexus Flow.`,
          status: tasks[i].status,
          priority: tasks[i].priority,
          due_date: null,
          position: i,
          created_by: userId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
    }
  }
};
