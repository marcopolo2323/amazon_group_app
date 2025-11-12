const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }

  return 'localhost';
}

const localIP = getLocalIP();
console.log('\n🌐 Network Information:');
console.log('='.repeat(50));
console.log(`Local IP Address: ${localIP}`);
console.log(`Backend URL: http://${localIP}:5000/api`);
console.log(`Frontend URL: http://${localIP}:3000`);
console.log(`Expo URL: exp://${localIP}:19000`);
console.log('='.repeat(50));

console.log('\n📱 Update your .env file with:');
console.log(`EXPO_PUBLIC_API_URL=http://${localIP}:5000/api`);

console.log('\n🔧 Add to backend CORS origins:');
console.log(`"http://${localIP}:8081",`);
console.log(`"exp://${localIP}:19000",`);

console.log('\n💡 Tips:');
console.log('1. Make sure your backend is running on port 5000');
console.log('2. Make sure your device/emulator is on the same network');
console.log('3. Check firewall settings if connection fails');
console.log('4. For physical devices, use the IP shown above');
console.log('5. For emulators, you might need to use 10.0.2.2 (Android) or localhost');

module.exports = { getLocalIP };
