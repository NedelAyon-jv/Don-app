import { firebaseAdmin } from '../services/Firebase/firebase.service';

async function testFirebase() {
  try {
    console.log('🧪 Testing Firebase Admin Service with Bun...\n');

    // 1. Test initialization
    console.log('1. Checking initialization...');
    if (!firebaseAdmin.isInitialized) {
      throw new Error('Firebase not initialized');
    }
    console.log('✅ Firebase initialized successfully\n');

    // 2. Test health check
/*     console.log('2. Running health check...');
    const health = await firebaseAdmin.healthCheck();
    console.log('📊 Health Status:', health.status);
    console.log('🔧 Services:', health.services);
    console.log('✅ Health check completed\n'); */

    // 3. Test Auth service
    console.log('3. Testing Auth service...');
    const users = await firebaseAdmin.auth.listUsers(1);
    console.log('✅ Auth service working - Users count:', users.users.length);
    
    // 4. Test Firestore service
/*     console.log('4. Testing Firestore service...');
    const testDoc = firebaseAdmin.firestore.collection('_tests').doc('connection-test');
    await testDoc.set({ 
      test: true, 
      timestamp: new Date().toISOString(),
      environment: 'bun-test'
    });
    console.log('✅ Firestore write successful');

    const doc = await testDoc.get();
    console.log('✅ Firestore read successful - Data:', doc.data());

    // Clean up test document
    await testDoc.delete();
    console.log('✅ Test document cleaned up\n'); */

    console.log('🎉 ALL FIREBASE TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
await testFirebase();