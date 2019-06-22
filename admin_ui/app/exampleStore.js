let exampleStore = { // eslint-disable-line no-unused-vars
  // Permission store
  permission: {
    list: [
      // Stores whatever is returned from /api/permission.list,
      // populates the Grid control on http://localhost:9000/permissions
    ],
    // Filters for the http://localhost:9000/permissions page
    // They map directly to the list of body parameters for the /api/permission.list call
    // https://github.com/yeepio/yeep/blob/master/docs/methods/permission.list.md
    filters: {
      q: "",
      limit: 10, // Arbitrary default, we should discuss
      cursor: 1,
      scope: "",
      role: "",
      isSystemPermission: false
    },
    current: {
      // For the CREATE process (http://localhost:9000/permissions/create)
      // or the EDIT process (http://localhost:9000/permissions/2/edit)
      // name, desc and scope are the values for the controlled inputs
      // These are also used for the modal versions of the Create / Edit forms,
      // as used for example in <OrgEditPermissions /> page
      // (http://localhost:9000/organizations/1/edit/permissions)
      name: "",
      description: "",
      scope: "",
      isSystemPermission: true || false
    },
    // Populated when things have gone "ugh" on these CUD actions
    errors: {
      create: "",
      edit: "",
      delete: ""
    },
    // Flags to help us show the appropriate preloades.
    // E.g. if store.permission.isBeing.created, show a preloader
    isBeing: {
      created: false,
      edited: false,
      deleted: false
    }
  },
  // Role store
  role: {
    // Whatever is returned from /api/role.list
    list: [],
    // Filters for the http://localhost:9000/roles page
    // They map directly to the list of body parameters for the /api/role.list call
    // https://github.com/yeepio/yeep/blob/master/docs/methods/role.list.md
    filters: {
      q: "",
      limit: 10, // Arbitrary default, we should discuss
      cursor: 1,
      scope: "",
      isSystemRole: false
    },
    // Current role (CREATE or EDIT workflows)
    current: {
      name: "",
      description: "",
      scope: "",
      // Roles also need a list of permissions they encapsulate
      permissions: [
        // For UI purposes we'll also need the permission name (and not only the id)
        {
          id: 1,
          name: "perm.whatever"
        }
        // ... all other permissions for the current role here
      ]
    },
    errors: {
      create: "",
      edit: "",
      delete: ""
    },
    isBeing: {
      created: false,
      edited: false,
      deleted: false
    }
  },
  // User store
  user: {
    // Whatever is returned from /api/user.list
    list: [],
    // https://github.com/yeepio/yeep/blob/master/docs/methods/user.list.md
    filters: {
      q: "",
      limit: 10, // Arbitrary default, we should discuss
      cursor: 1,
      org: ""
    },
    // Current user (CREATE or EDIT workflows)
    // Structure as specified in https://github.com/yeepio/yeep/blob/master/docs/methods/user.info.md
    current: {
      id: "",
      username: "",
      fullName: "",
      picture: "",
      emails: [],
      orgs: [],
      permissions: [],
      roles: []
      // No password or passwordConfirmation here, we should
      // (intentionally) have those as non-controlled components
      // in http://localhost:9000/users/1/edit
    },
    errors: {
      create: "",
      edit: "",
      delete: ""
    },
    isBeing: {
      created: false,
      edited: false,
      deleted: false
    }
  },

  // Modal store
  modal: {
    // True when any modal is currently being shown (for generic checks)
    isOpen: false,
    // True when specific modals are currently being shown.
    // e.g. if store.modal.permission.create => We have the CREATE perm modal open
    permission: {
      create: false,
      edit: false,
      delete: false
    },
    role: {
      create: false,
      edit: false,
      delete: false
    }
  }
};