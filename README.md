# Yeep

[![Build Status](https://travis-ci.com/yeepio/yeep.svg?branch=master)](https://travis-ci.com/yeepio/yeep) [![Greenkeeper badge](https://badges.greenkeeper.io/yeepio/yeep.svg)](https://greenkeeper.io/)

Own your users! Yeep is an headless _user management system_ you can download and deploy on your cloud.

### Why

User management nowadays is more than login, logout and reset-password. Users expect you to support MFA (Multi-Factor Authentication), device fingerprinting and more. Partners expect you to implement OpenID Connect and SCIM. Your manager expects to be able to see analytics at the click of a button.

Yeep provides a simple, open-source, privacy-first solution to user management.

### Features

* Everything you would expect from a basic user management system, i.e. _login_, _logout_, _signup_, **[WIP]** _forgot password_, **[WIP]** _reset password_
* Multiple authentication strategies, e.g. _username/password_, _Google login_, _GitHub login_, etc
* **[WIP]** Two-Factor Authentication (2FA)
* **[WIP]** User invitation flow, to invite new users to your organization
* Authorization (i.e. _what a user can do_) using roles and permissions
* Configurable settings, e.g. _enable/disable public signup_, _email templates_, etc.
* Multi-tenant architecture: your customers can have their own users, isolated permissions, isolated roles, etc.

### Requirements

* Node.js v.8+
* MongoDB v.4+ with Replica Set

## Docs

* [API Reference](docs/index.md)
* [Contributing Guide](CONTRIBUTING.md)

## License

Apache 2.0
