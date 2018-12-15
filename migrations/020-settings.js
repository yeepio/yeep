export const up = async (db) => {
  await db.createCollection('settings');
};

export const down = async (db) => {
  await db.dropCollection('settings');
};
