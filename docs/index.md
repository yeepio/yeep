# Yeep API

The Yeep API provides programmatic access to users, permissions, roles, sessions, etc on yeep platform.

---

### Org

| Method                                  | Description                |
| :-------------------------------------- | :------------------------- |
| **[org.create](methods/org.create.md)** | Creates new org            |
| **[org.delete](methods/org.delete.md)** | Deletes the designated org |

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
| **[user.invite](methods/user.invite.md)**                     | Invites user to join org                                      |
| **[user.join](methods/user.join.md)**                         | Adds user to org by redeeming invitation token                |
| **[user.list](methods/user.list.md)**                         | Lists all users                                               |
| **[user.resetPassword](methods/user.resetPassword.md)**       | Resets user password                                          |
| **[user.revokePermission](methods/user.revokePermission.md)** | Revokes the designated permission assignment                  |
| **[user.revokeRole](methods/user.revokeRole.md)**             | Revokes the designated role assigment                         |
| **[user.setPicture](methods/user.setPicture.md)**             | Sets the profile picture of the designated user               |

### Session

| Method                                            | Description                                           |
| :------------------------------------------------ | :---------------------------------------------------- |
| **[session.create](methods/session.create.md)**   | Creates new session, a.k.a. sign-in                   |
| **[session.destroy](methods/session.destroy.md)** | Destroys an existing session, a.k.a sign-out          |
| **[session.info](methods/session.info.md)**       | Retrieves information on the currently active session |

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
