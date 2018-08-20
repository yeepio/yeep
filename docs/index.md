# Yeep API

The Yeep API provides programmatic access to yeep platform.

***

### Org

| Method | Description | Requires Auth |
| ------ | ----------- | :-----------: |
| **[org.create](methods/org.create.md)** | Creates new org | Yes |
| **[org.delete](methods/org.delete.md)** | Deletes the designated org | Yes |

### User

| Method | Description | Requires Auth |
| ------ | ----------- | :-----------: |
| **[user.create](methods/user.create.md)** | Creates new user | Yes |

### Session

| Method | Description | Requires Auth |
| ------ | ----------- | :-----------: |
| **[session.create](methods/session.create.md)** | Creates new session, a.k.a. sign-in | No |
| **[session.destroy](methods/session.destroy.md)** | Destroys an existing session, a.k.a sign-out | Yes |
| **[session.info](methods/session.info.md)** | Retrieves information on the currently active session | Yes |

### Permission

| Method | Description | Requires Auth |
| ------ | ----------- | :-----------: |
| **[permission.create](methods/permission.create.md)** | Creates new permission | Yes |
| **[permission.delete](methods/permission.delete.md)** | Deletes the designated permission | Yes |
| **[permission.update](methods/permission.update.md)** | Updates the designated permission | Yes |
| **[permission.list](methods/permission.list.md)** | Lists all permission | Yes |
