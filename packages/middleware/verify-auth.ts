
async function verify() {
    const customFetch = global.fetch;

    console.log('--- Checking Health ---');
    try {
        const healthRes = await customFetch('http://localhost:3001/health');
        console.log('Health Status:', healthRes.status);
        console.log('Health Response:', await healthRes.text());
    } catch (e) { console.log('Health Check Failed', e.message); }

    console.log('--- Checking Ping (Routes File) ---');
    try {
        const pingRes = await customFetch('http://localhost:3001/ping');
        console.log('Ping Status:', pingRes.status);
        console.log('Ping Response:', await pingRes.text());
    } catch (e) { console.log('Ping Check Failed', e.message); }

    console.log('--- Checking Ping2 (Direct) ---');
    try {
        const ping2Res = await customFetch('http://localhost:3001/ping2');
        console.log('Ping2 Status:', ping2Res.status);
        console.log('Ping2 Response:', await ping2Res.text());
    } catch (e) { console.log('Ping2 Check Failed', e.message); }

    console.log('--- Registering User ---');
    const registerRes = await customFetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Test Verify'
        })
    });

    const registerData = await registerRes.json();
    console.log('Status:', registerRes.status);
    console.log('Response:', JSON.stringify(registerData, null, 2));
}

verify().catch(console.error);
