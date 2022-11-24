const { MongoClient } = require('mongodb');

const state = {
  db: null,
};

// eslint-disable-next-line func-names
module.exports.connect = function (done) {
  const url = process.env.ATLAS;
  const dbname = 'fadonsta';

  // eslint-disable-next-line consistent-return
  MongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

// eslint-disable-next-line func-names
module.exports.get = function () {
  return state.db;
};
