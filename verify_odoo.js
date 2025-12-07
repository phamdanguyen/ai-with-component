const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat/stream?message=hello&sessionId=test-verification',
    method: 'GET',
    headers: {
        'Accept': 'text/event-stream',
    }
};

console.log('Testing connection to Middleware -> Odoo...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    res.on('data', (chunk) => {
        const text = chunk.toString();
        console.log('RECEIVED CHUNK:', text);

        // Check for specific Odoo patterns or general SSE structure
        if (text.includes('data:')) {
            console.log('✅ SSE Structure detected');
        }
    });

    res.on('end', () => {
        console.log('No more data in response.');
    });
});

req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
});

req.end();
