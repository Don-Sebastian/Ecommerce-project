const { MongoClient } = require('mongodb');

const state = {
  db: null,
};

// eslint-disable-next-line func-names
module.exports.connect = function (done) {
  const url = 'mongodb://0.0.0.0:27017/';
  const dbname = 'ecommerce';

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
