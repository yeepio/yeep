export const up = async (db) => {
  await db.collection('identityProviders').createIndex(
    { org: 1, type: 1 },
    {
      unique: true,
      name: 'org_idp_uidx',
    }
  );
};

export const down = async (db) => {
  await db.collection('identityProviders').dropIndex('org_idp_uidx');
};
