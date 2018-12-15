export const up = async (db) => {
  await db.collection('tokens').createIndex(
    { secret: 'hashed' },
    {
      name: 'secret_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('tokens').dropIndex('secret_idx');
};
