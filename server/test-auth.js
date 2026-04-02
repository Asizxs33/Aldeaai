import fetch from 'node-fetch';

async function testRegister() {
    const email = `test${Math.floor(Math.random() * 10000)}@example.com`;
    const password = 'password123';

    console.log(`Attempting to register user: ${email}`);

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('Response:', data);

        if (response.ok) {
            console.log('✅ TEST PASSED: Registration successful');
        } else {
            console.error('❌ TEST FAILED: Registration failed');
        }
    } catch (error) {
        console.error('❌ TEST FAILED: Network/Server error', error);
    }
}

testRegister();
