
import * as fs from 'fs/promises';
import * as path from 'path';

const BACKEND_URL = 'http://localhost:3001/api'; // Assuming backend runs on 3001
const DATA_DIR = path.join(process.cwd(), '.data');

async function verifyPersistence() {
    console.log('🧪 Starting Persistence Integration Test...');

    const sessionId = `test-persistence-${Date.now()}`;
    const message = 'Hello Verification ' + Date.now();

    // 1. Send Request to Backend
    console.log(`1. Sending message to ${BACKEND_URL}/chat...`);

    let retries = 10;
    let response;

    while (retries > 0) {
        try {
            response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    sessionId,
                })
            });
            break;
        } catch (e) {
            if ((e as any).code === 'ECONNREFUSED' || (e as any).cause?.code === 'ECONNREFUSED') {
                console.log(`   ⏳ Server not ready, retrying in 2s... (${retries} left)`);
                retries--;
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }
            throw e;
        }
    }

    if (!response) {
        console.error('   ❌ API Request failed after retries: ECONNREFUSED');
        process.exit(1);
    }

    try {
        if (!response.ok) {
            throw new Error(`API Request failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('   ✅ API responded successfully');
    } catch (error) {
        console.error('   ❌ API Request failed:', error);
        process.exit(1);
    }

    // 2. Wait for async write
    console.log('2. Waiting for disk write...');
    await new Promise(r => setTimeout(r, 2000));

    // 3. Check File
    console.log('3. Checking conversations.json...');
    try {
        const filePath = path.join(DATA_DIR, 'conversations.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const db = JSON.parse(content);

        if (db[sessionId]) {
            const messages = db[sessionId];
            const found = messages.find((m: any) => m.content === message);
            if (found) {
                console.log('   ✅ Persistence Verified: Message found in file.');
            } else {
                console.error('   ❌ Session found, but message missing.');
                process.exit(1);
            }
        } else {
            console.error(`   ❌ Session ID ${sessionId} not found in file.`);
            console.log('Current File Content Keys:', Object.keys(db));
            process.exit(1);
        }

    } catch (error) {
        console.error('   ❌ File check failed:', error);
        process.exit(1);
    }

    console.log('🎉 Persistence Test Passed!');
}

verifyPersistence();
