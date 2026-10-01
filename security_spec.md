# Security Specification: Phoenix VIALE Firestore Access Control

## 1. Data Invariants
1. **User Data Isolation**: All inventory items, execution tasks, and supplementary photo requests belong strictly to the authenticated user under `/users/{userId}`.
2. **Identity Integrity**: `ownerId` on all documents must strictly match `request.auth.uid`. No user may read, write, or spoof another user's inventory or financial valuations.
3. **Immutable Ownership**: The `ownerId` cannot be changed after creation (`incoming().ownerId == existing().ownerId`).
4. **Length & Bound Enforcement**: All ID path parameters, strings, and keys are strictly length-bounded to prevent resource poisoning and Denial of Wallet attacks.

## 2. The Dirty Dozen Attack Payloads (Targeting PERMISSION_DENIED)
1. **Unauthenticated Read**: Attempting to read `/users/user123/items/item1` without auth -> DENIED.
2. **Cross-Tenant Item Read**: User `alice` reading `/users/bob/items/item1` -> DENIED.
3. **Cross-Tenant Item Write**: User `alice` creating `/users/bob/items/item1` with `ownerId: "bob"` -> DENIED.
4. **Spoofed Owner Payload**: User `alice` creating `/users/alice/items/item1` with `ownerId: "bob"` -> DENIED.
5. **Path Parameter Injection**: Document ID with special chars or 1000 bytes -> DENIED by `isValidId`.
6. **Oversized String Injection**: Injecting a 2MB payload into `assetName` -> DENIED by `maxLength` check.
7. **Ghost Field Mutation**: Writing unallowed shadow fields on update -> DENIED by strict validation.
8. **Ownership Hijack on Update**: Attempting to mutate `ownerId` from `alice` to `attacker` -> DENIED.
9. **Blanket Query Scraping**: Attempting a collection group query or unbounded listing -> DENIED by user-scoped path rules.
10. **Unauthenticated Task Completion**: Flipping task `completed: true` without auth -> DENIED.
11. **Negative Price Spoofing**: Injecting invalid financial fields -> DENIED.
12. **Malicious Delete**: User `attacker` deleting `/users/alice/tasks/task1` -> DENIED.
