export const up = async (db) => {
  await db.collection('orgMemberships').createIndex(
    { userId: 1 },
    {
      name: 'user_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('orgMemberships').dropIndex('user_idx');
};
