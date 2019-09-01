# Yeep API

The Yeep API provides programmatic access to users, permissions, roles, sessions, etc on yeep platform.

---

### Org

| Method                                              | Description                          |
| :-------------------------------------------------- | :----------------------------------- |
| **[org.addMember](methods/org.addMember.md)**       | Adds the designated user to org      |
| **[org.create](methods/org.create.md)**             | Creates new org                      |
| **[org.delete](methods/org.delete.md)**             | Deletes the designated org           |
| **[org.list](methods/org.list.md)**                 | Lists all orgs                       |
| **[org.info](methods/org.info.md)**                 | Retrieves info on the designated org |
| **[org.removeMember](methods/org.removeMember.md)** | Removes the designated user from org |
| **[org.update](methods/org.update.md)**             | Updates the designated org           |

### User

| Method                                                        | Description                                                   |
| :------------------------------------------------------------ | :------------------------------------------------------------ |
| **[user.activate](methods/user.activate.md)**                 | Activates the designated user                                 |
| **[user.assignPermission](methods/user.assignPermission.md)** | Assigns the specified permission to the designated user       |
| **[user.assignRole](methods/user.assignRole.md)**             | Assigns the specified role to the designated user             |
| **[user.create](methods/user.create.md)**                     | Creates new user                                              |
| **[user.deactivate](methods/user.deactivate.md)**             | Deactivates the designated user                               |
| **[user.delete](methods/user.delete.md)**                     | Deletes the designated user                                   |
| **[user.deletePicture](methods/user.deletePicture.md)**       | Deletes the profile picture of the designated user            |
| **[user.forgotPassword](methods/user.forgotPassword.md)**     | Initiates the forgot password process for the designated user |
| **[user.info](methods/user.info.md)**                         | Retrieves details for the designated user                     |
| **[user.list](methods/user.list.md)**                         | Lists all users                                               |
| **[user.resetPassword](methods/user.resetPassword.md)**       | Resets user password                                          |
| **[user.revokePermission](methods/user.revokePermission.md)** | Revokes the designated permission assignment                  |
| **[user.revokeRole](methods/user.revokeRole.md)**             | Revokes the designated role assigment                         |
| **[user.uploadPicture](methods/user.uploadPicture.md)**       | Uploads the profile picture of the designated user            |

### Session

| Method                                                        | Description                                                                         |
| :------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| **[session.issueToken](methods/session.issueToken.md)**       | Issues new session token, a.k.a. sign-in                                            |
| **[session.destroyToken](methods/session.destroyToken.md)**   | Destroys an existing session token, a.k.a sign-out                                  |
| **[session.refreshToken](methods/session.refreshToken.md)**   | Refreshes an existing session token that is about to expire or has already expired  |
| **[session.setCookie](methods/session.setCookie.md)**         | Sets new session cookie for the designated user                                     |
| **[session.destroyCookie](methods/session.destroyCookie.md)** | Destroys an existing session cookie                                                 |
| **[session.refreshCookie](methods/session.refreshCookie.md)** | Refreshes an existing session cookie that is about to expire or has already expired |

### Permission

| Method                                                | Description                                        |
| :---------------------------------------------------- | :------------------------------------------------- |
| **[permission.create](methods/permission.create.md)** | Creates new permission                             |
| **[permission.delete](methods/permission.delete.md)** | Deletes the designated permission                  |
| **[permission.info](methods/permission.info.md)**     | Retrieves information on the designated permission |
| **[permission.list](methods/permission.list.md)**     | Lists all permissions                              |
| **[permission.update](methods/permission.update.md)** | Updates the designated permission                  |

### Role

| Method                                    | Description                                  |
| :---------------------------------------- | :------------------------------------------- |
| **[role.create](methods/role.create.md)** | Creates new role                             |
| **[role.delete](methods/role.delete.md)** | Deletes the designated role                  |
| **[role.info](methods/role.info.md)**     | Retrieves information on the designated role |
| **[role.list](methods/role.list.md)**     | Lists all roles                              |
| **[role.update](methods/role.update.md)** | Updates the designated role                  |

### Invitation

| Method                                                | Description                                    |
| :---------------------------------------------------- | :--------------------------------------------- |
| **[invitation.accept](methods/invitation.accept.md)** | Adds user to org by redeeming invitation token |
| **[invitation.create](methods/invitation.create.md)** | Invites user to join org                       |
| **[invitation.list](methods/invitation.list.md)**     | Lists pending invitations                      |

### Time-based One-Time Password Authentication Factor, a.k.a. TOTP

| Method                                        | Description                                                 |
| :-------------------------------------------- | :---------------------------------------------------------- |
| **[totp.enroll](methods/totp.enroll.md)**     | Enrolls the designated user to TOTP authentication          |
| **[totp.activate](methods/totp.activate.md)** | Activates TOTP authentication for the designated user       |
| **[totp.eject](methods/totp.eject.md)**       | Removes TOTP authentication factor from the designated user |

### Email

| Method                                      | Description                                                 |
| :------------------------------------------ | :---------------------------------------------------------- |
| **[email.verify](methods/email.verify.md)** | Verifies user email address by redeeming verification token |
