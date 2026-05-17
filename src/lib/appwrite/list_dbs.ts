import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
    .setKey(process.env.VITE_APPWRITE_KEY!);

const databases = new Databases(client);

async function listDbs() {
    try {
        const dbs = await databases.list();
        console.log('Databases:', JSON.stringify(dbs, null, 2));
    } catch (e: any) {
        console.error('Error listing databases:', e.message);
    }
}

listDbs();
