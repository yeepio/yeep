export const up = async (db) => {
  await db.collection('roles').createIndex(
    { name: 'text' },
    {
      name: 'text_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('roles').dropIndex('text_idx');
};
