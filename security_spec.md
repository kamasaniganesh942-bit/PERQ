# PERQ Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: All paths not explicitly matched (`/users/{uid}` and `/loginActivity/{activityId}`) are unconditionally denied (`allow read, write: if false;`).
2. **User Profile Identity & Ownership (`/users/{uid}`)**:
   - A user profile document ID `{uid}` must match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars) and strictly equal `request.auth.uid`.
   - `incoming().uid` must equal `request.auth.uid` and `uid`.
   - Only the authenticated owner (`request.auth.uid == uid`) may read (`get`) or write (`create`, `update`) their own profile document. Blanket `list` queries on `/users` are forbidden to prevent PII enumeration.
   - `createdAt` and `lastLoginAt` must equal `request.time` on `create`.
   - On `update`, `uid`, `email`, and `createdAt` are immutable (`incoming().uid == existing().uid && incoming().email == existing().email && incoming().createdAt == existing().createdAt`).
   - Updates to a user profile are locked if `existing().status == 'suspended'` (terminal state lock).
   - Plain-text `password` or any unapproved shadow field is strictly rejected via `keys().hasOnly(['uid', 'name', 'email', 'createdAt', 'lastLoginAt', 'status'])`.
3. **Login Activity Audit Log (`/loginActivity/{activityId}`)**:
   - Every login activity document ID `{activityId}` must match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars).
   - `incoming().uid` must strictly equal `request.auth.uid`, and the corresponding `/users/$(request.auth.uid)` profile document must exist (`exists(/databases/$(database)/documents/users/$(request.auth.uid))` or `existsAfter(/databases/$(database)/documents/users/$(request.auth.uid))`).
   - `incoming().loginAt` must equal `request.time`, and `incoming().status` must be `'success'`.
   - Login activity records are immutable audit logs (`allow update, delete: if false;`).
   - Reading (`get` and `list`) `/loginActivity` is restricted strictly to documents where `resource.data.uid == request.auth.uid`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 — Unauthenticated Profile Creation**:
   `auth = null`, `CREATE /users/user_123` with valid fields -> `PERMISSION_DENIED`.
2. **Payload 2 — Cross-User Profile Spoofing (Identity Spoofing)**:
   `auth.uid = "attacker_1"`, `CREATE /users/victim_1` with `{ uid: "victim_1", ... }` -> `PERMISSION_DENIED`.
3. **Payload 3 — Plain-Text Password / Shadow Field Injection on Profile**:
   `auth.uid = "user_1"`, `CREATE /users/user_1` with `{ ..., password: "secret123", isAdmin: true }` -> `PERMISSION_DENIED`.
4. **Payload 4 — Forged Backdated `createdAt` Timestamp**:
   `auth.uid = "user_1"`, `CREATE /users/user_1` with `createdAt = Timestamp(2020-01-01)` (`!= request.time`) -> `PERMISSION_DENIED`.
5. **Payload 5 — PII Blanket Read (`GET /users/victim_1` by another user)**:
   `auth.uid = "attacker_1"`, `GET /users/victim_1` -> `PERMISSION_DENIED`.
6. **Payload 6 — Mutating Immutable `createdAt` or `uid` on Profile Update**:
   `auth.uid = "user_1"`, `UPDATE /users/user_1` changing `createdAt` or `uid` -> `PERMISSION_DENIED`.
7. **Payload 7 — Updating a Suspended (Terminal State) Profile**:
   `auth.uid = "user_1"`, ` existing().status == "suspended"`, `UPDATE /users/user_1` -> `PERMISSION_DENIED`.
8. **Payload 8 — Value Poisoning on Profile Update (`name` > 120 chars or invalid type)**:
   `auth.uid = "user_1"`, `UPDATE /users/user_1` with `name = "A".repeat(500)` -> `PERMISSION_DENIED`.
9. **Payload 9 — Orphaned Login Activity Without User Profile**:
   `auth.uid = "ghost_user"`, `CREATE /loginActivity/act_1` when `/users/ghost_user` does not exist -> `PERMISSION_DENIED`.
10. **Payload 10 — Cross-User Login Activity Injection**:
    `auth.uid = "attacker_1"`, `CREATE /loginActivity/act_1` with `{ uid: "victim_1", ... }` -> `PERMISSION_DENIED`.
11. **Payload 11 — Tampering With or Deleting Login Activity Audit Log**:
    `auth.uid = "user_1"`, `UPDATE` or `DELETE /loginActivity/act_1` -> `PERMISSION_DENIED`.
12. **Payload 12 — Unauthorized `LIST` Query on `/loginActivity` Across All Users**:
    `auth.uid = "attacker_1"`, `LIST /loginActivity` where `resource.data.uid != "attacker_1"` -> `PERMISSION_DENIED`.
