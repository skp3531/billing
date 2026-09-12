import mongoose from 'mongoose';
import Counter from './src/models/Counter';

const MONGODB_URI = 'mongodb+srv://admin1:admin123@cluster0.bqiawft.mongodb.net/pos_db?retryWrites=true&w=majority&appName=Cluster0';

async function test() {
  await mongoose.connect(MONGODB_URI);
  try {
    const res = await Counter.findByIdAndUpdate(
      "test_counter",
      { 
        $inc: { seq: 1 },
        $setOnInsert: { seq: 5 } 
      },
      { new: true, upsert: true }
    );
    console.log("Success", res);
  } catch (err: any) {
    console.log("Error:", err.message);
  }
  process.exit(0);
}
test();
