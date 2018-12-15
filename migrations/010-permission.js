export const up = async (db) => {
  await db.createCollection('permissions');
};

export const down = async (db) => {
  await db.dropCollection('permissions');
};
