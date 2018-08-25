# Yeep API

The Yeep API provides programmatic access to yeep platform.

***

### Org

| Method | Description | Requires Auth | Permission(s) required |
| ------ | ----------- | :-----------: | ---------------------- |
| **[org.create](methods/org.create.md)** | Creates new org | Yes | `yeep.org.write` |
| **[org.delete](methods/org.delete.md)** | Deletes the designated org | Yes | `yeep.org.write` |

### User

| Method | Description | Requires Auth | Permission(s) required |
| ------ | ----------- | :-----------: | ---------------------- |
| **[user.create](methods/user.create.md)** | Creates new user | Yes | `yeep.user.write` |
| **[user.assignRole](methods/user.assignRole.md)** | Assigns the specified role to the designated user | Yes | `yeep.role.assignment.write` |
| **[user.revokeRole](methods/user.revokeRole.md)** | Dissociates the specified role from the the designated user | Yes | `yeep.role.assignment.write` |

### Session

| Method | Description | Requires Auth | Permission(s) required |
| ------ | ----------- | :-----------: | ---------------------- |
| **[session.create](methods/session.create.md)** | Creates new session, a.k.a. sign-in | No | - |
| **[session.destroy](methods/session.destroy.md)** | Destroys an existing session, a.k.a sign-out | Yes | - |
| **[session.info](methods/session.info.md)** | Retrieves information on the currently active session | Yes | - |

### Permission

| Method | Description | Requires Auth | Permission(s) required |
| ------ | ----------- | :-----------: | ---------------------- |
| **[permission.create](methods/permission.create.md)** | Creates new permission | Yes |  `yeep.permission.write` |
| **[permission.delete](methods/permission.delete.md)** | Deletes the designated permission | Yes | `yeep.permission.write` |
| **[permission.update](methods/permission.update.md)** | Updates the designated permission | Yes | `yeep.permission.write` |
| **[permission.list](methods/permission.list.md)** | Lists all permission | Yes | `yeep.permission.read` |
| **[permission.info](methods/permission.info.md)** | Retrieves information on the designated permission | Yes | `yeep.permission.read` |

### Role

| Method | Description | Requires Auth | Permission(s) required |
| ------ | ----------- | :-----------: | ---------------------- |
| **[role.create](methods/role.create.md)** | Creates new role | Yes | `yeep.role.write` |
| **[role.delete](methods/role.delete.md)** | Deletes the designated role | Yes | `yeep.role.write` |
| **[role.info](methods/role.info.md)** | Retrieves information on the designated role | Yes | `yeep.role.read` |
| **[role.update](methods/role.update.md)** | Updates the designated role | Yes | `yeep.role.write` |
