import { connectDB } from './db';
import { storage } from './storage';
import { hashPassword, comparePasswords } from './auth';

async function testAuthentication() {
  try {
    console.log('Starting authentication test...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Test user data
    const testUser = {
      username: 'testuser',
      password: 'testpassword123',
      email: 'test@example.com',
      role: 'user' as const
    };
    
    // Step 1: Delete existing test user if exists
    console.log('\nStep 1: Cleaning up existing test user...');
    const existingUser = await storage.getUserByUsername(testUser.username);
    if (existingUser) {
      console.log('Found existing test user, will create a new one');
    }
    
    // Step 2: Create new test user
    console.log('\nStep 2: Creating test user...');
    const hashedPassword = await hashPassword(testUser.password);
    console.log('Password hashed successfully:', {
      originalLength: testUser.password.length,
      hashedLength: hashedPassword.length
    });
    
    const createdUser = await storage.createUser({
      ...testUser,
      password: hashedPassword
    });
    console.log('User created successfully:', {
      id: createdUser._id.toString(),
      username: createdUser.username,
      hashedPasswordLength: createdUser.password.length
    });
    
    // Step 3: Test password verification
    console.log('\nStep 3: Testing password verification...');
    const passwordMatch = await comparePasswords(testUser.password, createdUser.password);
    console.log('Password verification result:', {
      matches: passwordMatch,
      suppliedPasswordLength: testUser.password.length,
      storedPasswordLength: createdUser.password.length
    });
    
    if (!passwordMatch) {
      throw new Error('Password verification failed');
    }
    
    // Step 4: Test user retrieval
    console.log('\nStep 4: Testing user retrieval...');
    const retrievedUser = await storage.getUserByUsername(testUser.username);
    console.log('User retrieval result:', {
      found: !!retrievedUser,
      username: retrievedUser?.username,
      passwordMatch: retrievedUser ? await comparePasswords(testUser.password, retrievedUser.password) : false
    });
    
    if (!retrievedUser) {
      throw new Error('User retrieval failed');
    }
    
    console.log('\nAuthentication test completed successfully!');
    
  } catch (error) {
    console.error('Authentication test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testAuthentication(); 