export const up = async (db) => {
  await db.collection('permissions').createIndex(
    { name: 'text' },
    {
      name: 'text_idx',
    }
  );
};

export const down = async (db) => {
  await db.collection('permissions').dropIndex('text_idx');
};
