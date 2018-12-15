export const up = async (db) => {
  await db.collection('credentials').createIndex(
    { user: 1 },
    {
      unique: true,
      name: 'user_password_uidx',
      partialFilterExpression: { type: { $eq: 'PASSWORD' } },
    }
  );
};

export const down = async (db) => {
  await db.collection('credentials').dropIndex('user_password_uidx');
};
