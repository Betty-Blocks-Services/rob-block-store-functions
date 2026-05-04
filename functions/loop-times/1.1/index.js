/* eslint-disable no-await-in-loop */
const loopTimes = async ({ times = 0 }, steps) => {
  for (let index = 0; index < times; index += 1) {
    await steps({ index });
  }
};

export default loopTimes;
