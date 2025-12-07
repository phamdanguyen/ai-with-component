const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 8069,
    path: '/',
    method: 'GET',
    timeout: 2000
};

console.log('Testing direct connection to Odoo (127.0.0.1:8069)...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log('Connection successful!');
});

req.on('timeout', () => {
    console.error('TIMEOUT: Could not connect to Odoo (timeout)');
    req.destroy();
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.end();
