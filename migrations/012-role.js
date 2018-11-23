export const up = async (db) => {
  await db.createCollection('roles');
};

export const down = async (db) => {
  await db.dropCollection('roles');
};
