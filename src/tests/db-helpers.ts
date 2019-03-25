const [date, time] = new Date().toISOString().split('T');
export const rideDefaults = {
  trailId: '7042687',
  date,
  time: time.replace('Z', '+00'),
  location: {
    type: 'Point',
    coordinates: [35.5951, -82.5515]
  }
};
export const userDefaults = {
  email: 'bob@email.com',
  password: 'password',
  name: 'Bob'
};
export const nextTick = () => new Promise((res) => process.nextTick(res));

export const flushPromises = (waitTime: number): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(resolve, waitTime);
  });
};

export const typeormTestConfig = {
  type: 'postgres',
  host: 'postgres',
  port: 5432,
  username: 'postgres',
  password: 'development-password',
  database: 'mtb-nest-test',
  synchronize: true,
  logging: false,
  entities: ['src/**/**.entity{.ts,.js}'],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/entity',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber'
  }
};
