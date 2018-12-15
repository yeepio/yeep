export const up = async (db) => {
  await db.createCollection('tokens');
};

export const down = async (db) => {
  await db.dropCollection('tokens');
};
