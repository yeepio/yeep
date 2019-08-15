export const up = async (db) => {
  await db.collection('roles').createIndex(
    { scope: 1 },
    {
      name: 'scope_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('roles').dropIndex('scope_idx');
};
