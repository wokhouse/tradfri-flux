const getWarmth = require('./getWarmth');

// check that index selects the right temp
const stages = {
  toSunrise: [
    {
      toSunrise: 1,
      warmth: 0,
    },
  ],
  toSunset: [
    {
      toSunset: 0.5,
      warmth: 50,
    },
    {
      toSunset: 1,
      warmth: 80,
    },
    {
      toSunset: 1.25,
      warmth: 100,
    },
  ],
};
const testLocation = {
  lat: 45.5122,
  long: -122.6587,
};

test('checks conversion from % to sunrise/set to warmth settings', (done) => {
  testDates = [
    {
      date: new Date(Date.parse('10 Aug 2018 00:01:00')),
      expectedWarmth: 100,
    },
    {
      date: new Date(Date.parse('10 Aug 2018 06:00:00')),
      expectedWarmth: 100,
    },
    {
      date: new Date(Date.parse('10 Aug 2018 9:06:39')),
      expectedWarmth: 0,
    },
    {
      date: new Date(Date.parse('10 Aug 2018 14:00:00')),
      expectedWarmth: 50,
    },
    {
      date: new Date(Date.parse('10 Aug 2018 23:30:00')),
      expectedWarmth: 91,
    },
    {
      date: new Date(Date.parse('10 Aug 2018 23:59:59')),
      expectedWarmth: 93,
    },
    {
      date: new Date(Date.parse('11 Aug 2018 00:00:00')),
      expectedWarmth: 100,
    },
  ];
  let testCount = 0;
  testDates.map((d) => {
    expect(getWarmth(stages, testLocation, d.date))
      .toEqual(d.expectedWarmth);
    testCount ++;
    if (testCount == testDates.length) {
      done();
    }
  });
});

test('rejects invalid date', () => {
  expect(() => getWarmth(stages, testLocation, NaN))
    .toThrowError(/not an instance of Date/);
  expect(() => getWarmth(stages, testLocation, new Date('hhh')))
    .toThrowError(/invalid date/);
});
