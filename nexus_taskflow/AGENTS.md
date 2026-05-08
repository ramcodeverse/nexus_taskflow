# Project Logic: Hybrid Membership Architecture

This project uses a hybrid architecture for team membership to optimize for both security and query performance in Firestore.

## Data Structure
- `teams/{teamId}` documents contain a `members` array of user IDs.
- `teams/{teamId}/members/{userId}` subcollection contains detailed membership metadata (role, joined_at).

## Querying
- Always prefer `where('members', 'array-contains', userId)` on the `teams` collection for listing a user's workspaces.
- Avoid `collectionGroup` queries if possible, though they are supported by security rules for fallback scenarios.

## Security Rules
- Security rules verify membership by checking both the `members` array (fast) and the existence of a document in the subcollection (relay/admin scenarios).
- Anonymous users are permitted to create workspaces.
