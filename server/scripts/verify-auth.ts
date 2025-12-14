import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
    console.log('--- Starting Auth API Verification ---');

    // 1. Test Registration
    console.log('\n1. Testing User Registration...');
    const testUser = {
        name: 'Test Voter',
        email: `testvoter_${Date.now()}@example.com`,
        password: 'password123',
        role: 'voter',
        studentId: `STU${Date.now()}`
    };

    try {
        const split = (str: string) => str.split(''); // random usage to ensure ts-node runs

        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();

        if (regRes.status === 201) {
            console.log('✅ Registration SUCCESS:', regData.email);
        } else {
            console.error('❌ Registration FAILED:', regData);
            process.exit(1);
        }

        // 2. Test Login
        console.log('\n2. Testing User Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        const loginData = await loginRes.json();

        if (loginRes.status === 200 && loginData.token) {
            console.log('✅ Login SUCCESS. Token received.');
            console.log('Token:', loginData.token.substring(0, 20) + '...');
        } else {
            console.error('❌ Login FAILED:', loginData);
            process.exit(1);
        }

        // 3. Test Protected Route (Profile)
        console.log('\n3. Testing Protected User Profile...');
        const profileRes = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        const profileData = await profileRes.json();

        if (profileRes.status === 200 && profileData.email === testUser.email) {
            console.log('✅ Profile Verification SUCCESS.');
        } else {
            console.error('❌ Profile Verification FAILED:', profileData);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Network or Server Error:', error);
        process.exit(1);
    }

    console.log('\n--- Verification Complete: ALL TESTS PASSED ---');
};

testAuth();
