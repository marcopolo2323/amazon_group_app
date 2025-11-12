const mongoose = require('mongoose');

let isConnected = false;

async function connectMongo() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    autoIndex: true,
  });
  isConnected = true;
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
}

module.exports = connectMongo;


