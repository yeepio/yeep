export const generateFakeRoles = (org) => {
  return [
    {
      name: `${org.slug}.read`,
      description: `This role provides read access to ${org.name}`,
      isSystemRole: false,
      permissions: [],
      scope: org.slug,
    },
    {
      name: `${org.slug}.edit`,
      description: `This role provides edit access to ${org.name}`,
      isSystemRole: false,
      permissions: [],
      scope: org.slug,
    },
    {
      name: `${org.slug}.admin`,
      description: `This role provides admin access to ${org.name}`,
      isSystemRole: false,
      permissions: [],
      scope: org.slug,
    },
  ]
};