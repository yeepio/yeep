export const up = async (db) => {
  await db.collection('users').createIndex(
    { username: 1 },
    {
      unique: true,
      sparse: true,
      name: 'username_uidx',
      collation: { locale: 'en', strength: 2 },
    }
  );
};

export const down = async (db) => {
  await db.collection('users').dropIndex('username_uidx');
};
