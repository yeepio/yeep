export const up = async (db) => {
  await db.collection('permissions').createIndex(
    { scope: 1 },
    {
      name: 'scope_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('permissions').dropIndex('scope_idx');
};
