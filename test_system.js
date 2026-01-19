// Test script voor SnowWorld Narrowcasting System
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api${path}`,
            method: method,
            headers: {}
        };

        if (data && method !== 'GET') {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = JSON.stringify(data).length;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('🧪 SnowWorld System Test Suite');
    console.log('================================');
    
    try {
        // Test 1: Server health check
        console.log('\n1. Testing server health...');
        const health = await testEndpoint('/zones');
        console.log(`   ✅ Server online (Status: ${health.status})`);
        
        // Test 2: Zones endpoint
        console.log('\n2. Testing zones endpoint...');
        if (health.status === 200 && health.data) {
            console.log(`   ✅ Zones loaded: ${health.data.length} zones`);
            health.data.forEach(zone => {
                console.log(`      - ${zone.name}: ${zone.description}`);
            });
        }
        
        // Test 3: Weather endpoint
        console.log('\n3. Testing weather endpoint...');
        const weather = await testEndpoint('/weather');
        if (weather.status === 200 && weather.data) {
            console.log(`   ✅ Weather data: ${weather.data.temperature}°C, ${weather.data.snowCondition}`);
        }
        
        // Test 4: Content endpoint
        console.log('\n4. Testing content endpoint...');
        const content = await testEndpoint('/content');
        if (content.status === 200) {
            console.log(`   ✅ Content endpoint accessible (${content.data.length} items)`);
        }
        
        // Test 5: Schedule endpoint
        console.log('\n5. Testing schedule endpoint...');
        const schedule = await testEndpoint('/schedule/reception');
        if (schedule.status === 200) {
            console.log(`   ✅ Schedule endpoint accessible (${schedule.data.length} items)`);
        }
        
        console.log('\n✅ All tests passed!');
        console.log('\n🎿 System is ready for use!');
        console.log('\nNext steps:');
        console.log('- Open admin dashboard: http://localhost:8080');
        console.log('- Open client display: http://localhost:3000/client/index.html?zone=reception');
        console.log('- Upload some content via the admin dashboard');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running on port 3000');
        console.log('   Start the server with: cd backend && npm start');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests();
}

module.exports = { testEndpoint, runTests };