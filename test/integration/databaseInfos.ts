const eventInfo = {
  database: 'write',
  host: process.env.MONGO_HOST || 'localhost',
  port: process.env.MONGO_PORT,
};

const readInfo = {
  database: 'read',
  host: process.env.MONGO_HOST || 'localhost',
  port: process.env.MONGO_PORT,
};

export { eventInfo, readInfo };
