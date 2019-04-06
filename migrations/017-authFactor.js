export const up = async (db) => {
  await db.collection('authFactors').createIndex(
    { user: 1, type: 1 },
    {
      unique: true,
      name: 'user_factor_uidx',
    }
  );
};

export const down = async (db) => {
  await db.collection('authFactors').dropIndex('user_factor_uidx');
};
