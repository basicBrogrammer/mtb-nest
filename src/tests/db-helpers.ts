export const rideDefaults = {
  trailId: '7042687',
  date: new Date(),
  time: new Date(),
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

export const flushPromises = (time: number): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
