import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const OrderSchema = new mongoose.Schema({
  status: String,
}, { strict: false });

const Order = mongoose.model('Order', OrderSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to DB');
  const res = await Order.updateMany({ status: 'PENDING' }, { $set: { status: 'COMPLETED' } });
  console.log(`Updated ${res.modifiedCount} orders`);
  process.exit(0);
}
run();
