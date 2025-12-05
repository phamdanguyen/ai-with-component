
import { FileSessionStore } from '../src/services/storage/FileSessionStore';
import { FileConversationStore } from '../src/services/storage/FileConversationStore';
import * as fs from 'fs/promises';
import * as path from 'path';

async function testPersistence() {
    console.log('Testing File Persistence...');
    const testDir = '.test-data';

    // Clean up previous test
    try {
        await fs.rm(path.join(process.cwd(), testDir), { recursive: true, force: true });
    } catch { }

    const sessionStore = new FileSessionStore(testDir);
    const conversationStore = new FileConversationStore(testDir);

    // 1. Create Data
    console.log('1. Creating data...');
    const sessionId = 'test-session-1';
    await sessionStore.createSession(sessionId, { user: 'test-user' });
    await conversationStore.addMessage(sessionId, { role: 'user', content: 'Hello', timestamp: new Date().toISOString() });

    console.log('   Data created in memory and should be on disk.');

    // 2. Verify File Existence
    const sessionFile = path.join(process.cwd(), testDir, 'sessions.json');
    const conversationFile = path.join(process.cwd(), testDir, 'conversations.json');

    try {
        await fs.access(sessionFile);
        console.log('   ✅ sessions.json exists');
    } catch {
        console.error('   ❌ sessions.json MISSING');
    }

    try {
        await fs.access(conversationFile);
        console.log('   ✅ conversations.json exists');
    } catch {
        console.error('   ❌ conversations.json MISSING');
    }

    // 3. Simulate Restart (New Instances)
    console.log('3. Simulating restart (New Store Instances)...');
    const newSessionStore = new FileSessionStore(testDir);
    const newConversationStore = new FileConversationStore(testDir);

    const session = await newSessionStore.getSession(sessionId);
    if (session && session.metadata?.user === 'test-user') {
        console.log('   ✅ Session loaded correctly from disk');
    } else {
        console.error('   ❌ Session failed to load or mismatch');
    }

    const messages = await newConversationStore.getMessages(sessionId);
    if (messages.length === 1 && messages[0].content === 'Hello') {
        console.log('   ✅ Messages loaded correctly from disk');
    } else {
        console.error('   ❌ Messages failed to load');
    }

    // Cleanup
    await fs.rm(path.join(process.cwd(), testDir), { recursive: true, force: true });
}

testPersistence().catch(console.error);
