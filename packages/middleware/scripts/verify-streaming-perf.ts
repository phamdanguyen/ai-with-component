
import * as http from 'http';

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat/stream?message=Tell%20me%20a%20long%20story%20about%20code',
    method: 'GET',
};

console.log('🚀 Starting Streaming Performance Test...');
console.log(`   Connecting to http://${options.hostname}:${options.port}${options.path}...`);

const startTime = Date.now();
let firstByteTime = 0;
let chunkCount = 0;
let totalBytes = 0;

const req = http.request(options, (res) => {
    console.log(`   📡 Status Code: ${res.statusCode}`);

    if (res.statusCode !== 200) {
        console.error('   ❌ Failed to connect with 200 OK');
        process.exit(1);
    }

    res.on('data', (chunk) => {
        const now = Date.now();
        if (chunkCount === 0) {
            firstByteTime = now - startTime;
            console.log(`   ⚡ TTFB (Time To First Byte): ${firstByteTime}ms`);
        }
        chunkCount++;
        totalBytes += chunk.length;
        // Optional: Log chunk sample
        // process.stdout.write('.'); 
    });

    res.on('end', () => {
        const totalTime = Date.now() - startTime;
        console.log('\n✅ Streaming Complete!');
        console.log('   -----------------------------------');
        console.log(`   ⏱️  Total Duration: ${totalTime}ms`);
        console.log(`   ⚡ TTFB:            ${firstByteTime}ms`);
        console.log(`   📦 Total Chunks:    ${chunkCount}`);
        console.log(`   📊 Total Bytes:     ${totalBytes}`);
        console.log(`   🌊 Avg Chunk Time:  ${(totalTime - firstByteTime) / (chunkCount || 1)}ms`);
        console.log('   -----------------------------------');

        if (chunkCount > 5) {
            console.log('   ✅ Conclusion: Streaming is WORKING and EFFECTIVE (Multiple chunks received).');
        } else {
            console.log('   ⚠️ Conclusion: Response might not be streaming properly (Few chunks).');
        }
    });
});

req.on('error', (e) => {
    console.error(`   ❌ Request Error: ${e.message}`);
});

req.end();
