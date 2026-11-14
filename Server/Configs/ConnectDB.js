import mongoose from "mongoose";
import { setServers } from "node:dns";

const getMongoUri = () => {
    const rawUri = process.env.MONGODB_URL?.trim();

    if (!rawUri || rawUri.includes("<db_password>") || rawUri.includes("db_password")) {
        return "mongodb://127.0.0.1:27017/shifraai";
    }

    return rawUri;
};

const connectDB = async () => {
    const mongoUri = getMongoUri();

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Mongodb connected");
    } catch (error) {
        if (error?.code === "ECONNREFUSED" || error?.name === "MongoServerSelectionError") {
            console.warn("MongoDB connection failed. Retrying with default local MongoDB at mongodb://127.0.0.1:27017/shifraai");
            try {
                await mongoose.connect("mongodb://127.0.0.1:27017/shifraai", {
                    serverSelectionTimeoutMS: 5000,
                });
                console.log("Mongodb connected");
                return;
            } catch (retryError) {
                console.error("MongoDB retry failed:", retryError.message);
                throw retryError;
            }
        }

        if (error?.code === "ENOTFOUND" && error?.message?.includes("querySrv")) {
            setServers(["8.8.8.8", "8.8.4.4"]);
            console.warn("System DNS refused the MongoDB SRV lookup; retrying with Google DNS.");
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
            console.log("Mongodb connected");
            return;
        }

        throw error;
    }
};

export default connectDB;