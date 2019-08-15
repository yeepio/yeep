export const up = async (db) => {
  await db.collection('roles').createIndex(
    { permissions: 1 },
    {
      name: 'permission_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('roles').dropIndex('permission_idx');
};
