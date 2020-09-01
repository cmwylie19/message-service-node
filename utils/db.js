import mongo from "mongodb";
var url = "mongodb://localhost:27017/UserDB";
const MongoClient = mongo.MongoClient;

export const DB = () => {
  MongoClient.connect(url, (err, db) => {
    if (err) console.error(`Could not connect to UserDB ❌\n${err}`);
    else console.log("Connected to UserDB ✅");
  });
};
