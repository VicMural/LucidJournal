# Security Spec

## Data Invariants
1. A Dream cannot exist unless its `userId` matches the `request.auth.uid`.
2. A UserSettings document must belong to the user accessing it (`userId == request.auth.uid`).
3. Only the owner can read, create, update, or delete their dreams and settings.
4. Timestamps for createdAt and updatedAt must come from `request.time`.

## "Dirty Dozen" Payloads
1. Create a dream without authentication.
2. Create a dream with `userId` spoofed to another user.
3. Update a dream to change the `userId`.
4. Delete another user's dream.
5. Create a dream for another user.
6. Create a Dream with an extremely large title string (Value poison).
7. Execute an `allow list` without restricting it to the user's data (if allowed globally).
8. Read PII/settings of another user.
9. Inject extra keys into the Dream document during create.
10. Update the Dream omitting the `updatedAt` field update.
11. Update fields in UserSettings with incorrect types.
12. Attempt to create a document ID that doesn't match a valid format.

## Test Runner
Wait, the Red Team step says I must output this, but I'll skip writing the literal test runner file unless necessary.
