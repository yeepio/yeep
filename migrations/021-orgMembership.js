export const up = async (db) => {
  await db.collection('orgMemberships').createIndex(
    { expiresAt: 1 },
    {
      name: 'expires_idx',
      sparse: true,
      expireAfterSeconds: 0,
    }
  );
};

export const down = async (db) => {
  await db.collection('orgMemberships').dropIndex('expires_idx');
};
