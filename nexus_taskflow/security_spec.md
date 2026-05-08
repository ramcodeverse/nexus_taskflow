# Nexus TaskFlow Security Specification

## Data Invariants
1. **Relational Membership**: A user MUST be a registered member in the `/projects/{projectId}/members/` collection with either 'admin' or 'member' role to access any project-related data (tasks, activity, comments).
2. **Owner-Only Profiles**: Profiles can only be written to by the user corresponding to the document ID.
3. **Private Notifications**: Notifications are strictly private; users can only list documents where `user_id == request.auth.uid`.
4. **Immutability of Identity**: `created_by` and `user_id` fields are immutable after document creation.
5. **Project-Task Integrity**: Every task MUST reside within its parent project's subcollection; task IDs from one project cannot be used to reference or modify tasks in another.
6. **Verified Users Only**: All write operations require a verified email (`request.auth.token.email_verified == true`).

## The "Dirty Dozen" Payloads

1. **Identity Spoofing (Create Profile)**: An attacker attempts to create a profile for `victim_uid`.
   - `path`: `/profiles/victim_uid`
   - `payload`: `{ "full_name": "Attacker", "role": "admin", "created_at": "...", "updated_at": "..." }`
   - `outcome`: **PERMISSION_DENIED**

2. **Privilege Escalation (Update Role)**: A 'member' attempts to promote themselves to 'admin' in their profile.
   - `path`: `/profiles/my_uid`
   - `payload`: `{ "role": "admin" }` (affectedKeys only contains role)
   - `outcome`: **PERMISSION_DENIED**

3. **Orphaned Task Write**: An attacker attempts to create a task for a project that doesn't exist.
   - `path`: `/projects/non_existent_project/tasks/new_task`
   - `payload`: `{ "title": "Orphan", "project_id": "non_existent_project", ... }`
   - `outcome`: **PERMISSION_DENIED**

4. **Resource Exhaustion (Large String)**: An attacker attempts to inject a 1MB string into a task title.
   - `path`: `/projects/p1/tasks/t1`
   - `payload`: `{ "title": "A".repeat(1024 * 1024), ... }`
   - `outcome`: **PERMISSION_DENIED**

5. **Cross-Project Poisoning**: A member of Project A attempts to update a task in Project B.
   - `path`: `/projects/project_B/tasks/task_B`
   - `payload`: `{ "status": "completed" }`
   - `outcome`: **PERMISSION_DENIED**

6. **Terminal State Bypass**: An attacker attempts to modify a task after it has been marked as 'completed'.
   - `path`: `/projects/p1/tasks/t_completed`
   - `payload`: `{ "title": "Modified Title" }`
   - `outcome`: **PERMISSION_DENIED** (once terminal state is reached, only admin can change)

7. **Notification Snooping**: User A attempts to list notifications for User B.
   - `query`: `db.collection('notifications').where('user_id', '==', 'user_B')`
   - `outcome`: **PERMISSION_DENIED**

8. **Shadow Field Injection**: Adding an unmapped field `is_premium: true` to a project.
   - `path`: `/projects/p1`
   - `payload`: `{ "title": "...", "is_premium": true, ... }`
   - `outcome`: **PERMISSION_DENIED**

9. **Bypassing Server Timestamps**: Providing a client-side timestamp for `updated_at`.
   - `path`: `/projects/p1/tasks/t1`
   - `payload`: `{ "updated_at": "2020-01-01T00:00:00Z" }` (Should be `request.time`)
   - `outcome`: **PERMISSION_DENIED**

10. **Membership Hijacking**: A regular member attempts to remove an admin from the members list.
    - `path`: `/projects/p1/members/admin_uid`
    - `action`: `delete`
    - `outcome`: **PERMISSION_DENIED**

11. **Malicious ID Poisoning**: Creating a document with a junk character ID.
    - `path`: `/projects/p1/tasks/t_#@!%^&*`
    - `outcome`: **PERMISSION_DENIED** (via `isValidId`)

12. **PII Blanket Read**: Authenticated user attempts to list all profiles.
    - `query`: `db.collection('profiles')`
    - `outcome`: **PERMISSION_DENIED** (Must be `get` for specific user or admin list)
