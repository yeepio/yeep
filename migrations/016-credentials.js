export const up = async (db) => {
  await db.createCollection('credentials');
};

export const down = async (db) => {
  await db.dropCollection('credentials');
};
