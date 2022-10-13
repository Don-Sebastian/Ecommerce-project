const MongoClient = require("mongodb").MongoClient;
// const mongoose = require('mongoose')
// const config = require('../config/databaseConfig')

// const Connect = async () => {
//   try {
//     //mongodb cloud connection
//     const con = await mongoose.connect(config.MONGO_URI, {
//       useNewUrlParser: true, 
//       useUnifiedTopology: true,
//       useFindAndModify: false,
//       useCreateIndex: true
//     })

//     console.log(`MongoDB connected: ${con.connection.host}`);

//   }
//   catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// }

const state = {
  db: null,
};
module.exports.connect = function (done) {
  const url = "mongodb://localhost:27017";
  const dbname = "ecommerce";

  MongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};

// module.exports = Connect;