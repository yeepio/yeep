export const generateFakePermissions = (config, org) => {
  const globalDomain = config.name.replace(/ /g, '').toLowerCase();
  return [
    {
      name: `${globalDomain}.${org.slug}.read`,
      description: `Permission to read ${org.name}`,
      isSystemPermission: false,
      scope: org.slug,
    },
    {
      name: `${globalDomain}.${org.slug}.write`,
      description: `Permissions to write at ${org.name}`,
      isSystemPermission: false,
      scope: org.slug,
    },
  ]
};