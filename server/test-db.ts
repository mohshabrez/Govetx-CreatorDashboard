import { connectDB } from './db';
import { storage } from './storage';
import { User } from '@shared/schema';
import { hashPassword } from './auth';

async function testDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB successfully!');

    // Test user operations
    console.log('\nTesting user operations...');
    
    // Create a test user
    const testUser = {
      username: 'testuser',
      password: 'testpassword',
      email: 'test@example.com',
      role: 'user' as const
    };

    console.log('Creating test user...');
    const createdUser = await storage.createUser(testUser);
    console.log('Created user:', createdUser);

    // Get user by username
    console.log('\nGetting user by username...');
    const foundUser = await storage.getUserByUsername('testuser');
    console.log('Found user:', foundUser);

    // List all users
    console.log('\nListing all users...');
    const allUsers = await storage.listUsers();
    console.log('All users:', allUsers);

    console.log('\nDatabase test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    process.exit(0);
  }
}

async function setupTestUser() {
  try {
    await connectDB();
    
    // Check if test user exists
    const existingUser = await User.findOne({ username: 'testuser' });
    
    if (!existingUser) {
      const hashedPassword = await hashPassword('password123');
      
      // Create test user
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await user.save();
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }
    
    console.log('You can now login with:');
    console.log('Username: testuser');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test user:', error);
    process.exit(1);
  }
}

testDatabase();
setupTestUser(); 