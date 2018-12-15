export const up = async (db) => {
  await db.collection('tokens').createIndex(
    { userId: 1 },
    {
      name: 'userId_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('tokens').dropIndex('userId_idx');
};
