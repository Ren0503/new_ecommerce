import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        
        if (!MONGO_URI) throw new Error('MONGO_URI not found.');
        const connection = await mongoose.connect(MONGO_URI);

        console.log(`Connect to MongoDB successfully at ${connection.connection.host}`);
    } catch(error) {
        console.log(`ERROR : ${error}`);
        process.exit(1);
    }
}

export default connectDB;