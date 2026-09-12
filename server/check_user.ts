import mongoose from 'mongoose';
import { User } from './src/models/User';

const MONGODB_URI = 'mongodb+srv://admin1:admin123@cluster0.bqiawft.mongodb.net/pos_db?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({}).select('+password');
  console.log("ALL USERS:");
  users.forEach((u: any) => console.log(u.email, 'hash:', u.password));
  process.exit(0);
}
check();
