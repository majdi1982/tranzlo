import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT!)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID!)
    .setKey(process.env.VITE_APPWRITE_KEY!);

const databases = new Databases(client);
const databaseId = 'main';

async function setupSchema() {
    console.log('🚀 Starting Unified Appwrite Schema Setup (Legal Compliance)...');

    // Ensure Database exists
    try {
        await databases.get(databaseId);
        console.log('Database already exists.');
    } catch (e) {
        console.log('Creating database...');
        await databases.create(databaseId, 'Tranzlo Core');
    }

    const globalAttributes = [
        { name: 'publicId', size: 36, required: true },
        { name: 'entityType', size: 20, required: true },
        { name: 'createdAt', size: 30, required: true },
        { name: 'updatedAt', size: 30, required: true },
        { name: 'createdBy', size: 36, required: true },
        { name: 'updatedBy', size: 36, required: false },
        { name: 'status', size: 20, required: false, default: 'active' },
        { name: 'visibility', size: 20, required: false, default: 'public' },
    ];

    const ownershipAttributes = [
        { name: 'organizationId', size: 36, required: false },
        { name: 'workspaceId', size: 36, required: false },
        { name: 'teamId', size: 36, required: false },
        { name: 'projectId', size: 36, required: false },
        { name: 'jobId', size: 36, required: false },
        { name: 'userId', size: 36, required: false }
    ];

    const collections = [
        { id: 'jobs', name: 'Jobs' },
        { id: 'jobApplications', name: 'Job Applications' },
        { id: 'auditLogs', name: 'Audit Logs' },
        { id: 'translators', name: 'Translators' },
        { id: 'companies', name: 'Companies' },
        { id: 'notifications', name: 'Notifications' },
        { id: 'messages', name: 'Messages' },
        { id: 'teamMembers', name: 'Team Members' },
        { id: 'teamInvitations', name: 'Team Invitations' }
    ];

    for (const coll of collections) {
        console.log(`Setting up collection: ${coll.name}...`);
        try {
            await databases.getCollection(databaseId, coll.id);
            console.log(`Collection ${coll.id} already exists.`);
        } catch (e) {
            await databases.createCollection(databaseId, coll.id, coll.name);
        }

        try {
            // Apply standard collection permissions (compliance with client-side B2B operations)
            await databases.updateCollection(
                databaseId,
                coll.id,
                coll.name,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                false
            );
            console.log(`Permissions synchronized successfully for: ${coll.id}`);
        } catch (permErr: any) {
            console.log(`Permissions update failed for: ${coll.id}:`, permErr.message);
        }

        // Apply Global Fields
        for (const attr of globalAttributes) {
            try {
                await databases.createStringAttribute(databaseId, coll.id, attr.name, attr.size, attr.required, attr.default);
            } catch (e: any) {
                if (!e.message?.includes('already exists')) {
                    console.log(`Failed to create global attribute ${attr.name} for ${coll.id}:`, e.message);
                }
            }
        }
        // Apply Ownership Fields
        for (const attr of ownershipAttributes) {
            try {
                await databases.createStringAttribute(databaseId, coll.id, attr.name, attr.size, attr.required);
            } catch (e: any) {
                if (!e.message?.includes('already exists')) {
                    console.log(`Failed to create ownership attribute ${attr.name} for ${coll.id}:`, e.message);
                }
            }
        }
    }

    // Role-specific fields for Jobs
    try {
        await databases.createStringAttribute(databaseId, 'jobs', 'title', 200, true);
        await databases.createStringAttribute(databaseId, 'jobs', 'description', 5000, true);
        await databases.createStringAttribute(databaseId, 'jobs', 'paymentType', 20, true); // fixed, hourly, milestones
        await databases.createIntegerAttribute(databaseId, 'jobs', 'budget', true);
        await databases.createStringAttribute(databaseId, 'jobs', 'currency', 3, false, 'USD');
        await databases.createStringAttribute(databaseId, 'jobs', 'fromLanguage', 10, true);
        await databases.createStringAttribute(databaseId, 'jobs', 'toLanguage', 10, true);
        await databases.createBooleanAttribute(databaseId, 'jobs', 'isInviteOnly', false, false);
    } catch (e: any) {
        console.log('Job specific fields error:', e.message);
    }

    // Role-specific fields for Notifications
    try {
        await databases.createStringAttribute(databaseId, 'notifications', 'title', 200, true);
        await databases.createStringAttribute(databaseId, 'notifications', 'message', 1000, true);
        await databases.createStringAttribute(databaseId, 'notifications', 'type', 50, true);
        await databases.createBooleanAttribute(databaseId, 'notifications', 'read', false, false);
    } catch (e: any) {
        console.log('Notification specific fields error:', e.message);
    }

    // Role-specific fields for Job Applications
    try {
        await databases.createStringAttribute(databaseId, 'jobApplications', 'proposal', 5000, true);
        await databases.createIntegerAttribute(databaseId, 'jobApplications', 'bidAmount', true);
        await databases.createIntegerAttribute(databaseId, 'jobApplications', 'deliveryDays', true);
    } catch (e: any) {
        console.log('Job Application specific fields error:', e.message);
    }

    // Role-specific fields for Translators
    try {
        await databases.createStringAttribute(databaseId, 'translators', 'name', 100, true);
        await databases.createStringAttribute(databaseId, 'translators', 'email', 100, true);
        await databases.createStringAttribute(databaseId, 'translators', 'role', 20, true);
    } catch (e: any) {
        console.log('Translator specific fields error:', e.message);
    }

    // Role-specific fields for Companies
    try {
        await databases.createStringAttribute(databaseId, 'companies', 'name', 100, true);
        await databases.createStringAttribute(databaseId, 'companies', 'email', 100, true);
        await databases.createStringAttribute(databaseId, 'companies', 'role', 20, true);
        await databases.createStringAttribute(databaseId, 'companies', 'companyName', 100, false);
    } catch (e: any) {
        console.log('Company specific fields error:', e.message);
    }

    // Role-specific fields for Messages
    try {
        await databases.createStringAttribute(databaseId, 'messages', 'messageText', 2000, true);
        await databases.createStringAttribute(databaseId, 'messages', 'senderName', 100, true);
        await databases.createStringAttribute(databaseId, 'messages', 'recipientId', 36, true);
    } catch (e: any) {
        console.log('Messages specific fields error:', e.message);
    }

    // Role-specific fields for Team Members
    try {
        await databases.createStringAttribute(databaseId, 'teamMembers', 'name', 100, true);
        await databases.createStringAttribute(databaseId, 'teamMembers', 'email', 100, true);
        await databases.createStringAttribute(databaseId, 'teamMembers', 'role', 50, true);
    } catch (e: any) {
        console.log('Team Members specific fields error:', e.message);
    }

    // Role-specific fields for Team Invitations
    try {
        await databases.createStringAttribute(databaseId, 'teamInvitations', 'name', 100, true);
        await databases.createStringAttribute(databaseId, 'teamInvitations', 'email', 100, true);
        await databases.createStringAttribute(databaseId, 'teamInvitations', 'role', 50, true);
    } catch (e: any) {
        console.log('Team Invitations specific fields error:', e.message);
    }

    console.log('✅ Legal Schema Setup Completed!');
}

setupSchema();
