// @ts-check
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔄 Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI.replace(/\/\/(.+)@/, '//***:***@')); // Hide credentials

    const client = new MongoClient(process.env.MONGODB_URI, {
        ssl: true,
        tls: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas!');

        // Test database access
        const db = client.db('healthsangini');
        const collections = await db.listCollections().toArray();
        console.log('✅ Connected to database:', db.databaseName);
        console.log('📁 Available collections:', collections.map(c => c.name));

        // Test write permission
        const testCollection = db.collection('connection_test');
        await testCollection.insertOne({
            test: true,
            timestamp: new Date()
        });
        console.log('✅ Write test successful');

        // Clean up test data
        await testCollection.deleteMany({ test: true });
        console.log('🧹 Cleanup successful');

        await client.close();
        console.log('✅ Connection closed successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
}

testConnection();