// @ts-check
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testAuthConfig() {
    console.log('\n🔍 Starting authentication configuration test...\n');

    // Check required environment variables
    const requiredEnvVars = [
        'MONGODB_URI',
        'NEXTAUTH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'NEXTAUTH_URL'
    ];

    console.log('📋 Checking environment variables...');
    const missing = requiredEnvVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        process.exit(1);
    }

    console.log('✅ All required environment variables are present\n');

    // Validate NEXTAUTH_URL format
    try {
        const nextAuthUrl = process.env.NEXTAUTH_URL;
        if (!nextAuthUrl) {
            throw new Error('NEXTAUTH_URL is undefined');
        }
        const url = new URL(nextAuthUrl);
        console.log('✅ NEXTAUTH_URL format is valid:', url.origin);
    } catch (e) {
        console.error('❌ NEXTAUTH_URL is not a valid URL');
        process.exit(1);
    }

    // Test MongoDB connection
    console.log('\n🔌 Testing MongoDB connection...');
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('❌ MONGODB_URI is undefined');
        process.exit(1);
    }
    const client = new MongoClient(mongoUri, {
        ssl: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log('✅ MongoDB connection successful');

        const db = client.db('healthsangini');
        console.log('✅ Database "healthsangini" selected');

        // Check for required collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        const requiredCollections = ['users', 'accounts', 'sessions'];
        const missingCollections = requiredCollections.filter(c => !collectionNames.includes(c));

        if (collectionNames.length > 0) {
            console.log('\n📁 Existing collections:', collectionNames.join(', '));
        }

        if (missingCollections.length > 0) {
            console.log('ℹ️  Required collections that will be created:', missingCollections.join(', '));
        }

        // Verify Google OAuth configuration
        console.log('\n🔑 Checking Google OAuth configuration...');
        if (!process.env.GOOGLE_CLIENT_ID?.endsWith('.apps.googleusercontent.com')) {
            console.error('❌ Google Client ID format is incorrect. Should end with .apps.googleusercontent.com');
            process.exit(1);
        }
        console.log('✅ Google Client ID format is valid');

        if (!process.env.GOOGLE_CLIENT_SECRET) {
            console.error('❌ Google Client Secret is empty');
            process.exit(1);
        }
        console.log('✅ Google Client Secret is present');

        await client.close();
        console.log('\n✅ All checks passed successfully!\n');
    } catch (error) {
        console.error('\n❌ Error during checks:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

testAuthConfig().catch(console.error);