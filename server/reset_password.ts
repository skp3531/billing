import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User';

const MONGODB_URI = 'mongodb+srv://admin1:admin123@cluster0.bqiawft.mongodb.net/pos_db?retryWrites=true&w=majority&appName=Cluster0';

async function reset() {
  await mongoose.connect(MONGODB_URI);
  const passwordHash = await bcrypt.hash('Owner@123', 10);
  const res = await User.updateOne(
    { email: 'owner@shakesphere.com' },
    { $set: { passwordHash } }
  );
  console.log('Update result:', res);
  process.exit(0);
}
reset();
