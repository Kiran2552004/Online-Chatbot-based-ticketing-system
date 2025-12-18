import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const createAdminUser = async () => {
  try {
    await connectDB();

    const adminEmail = 'mkirankumar995@gmail.com';
    const adminPassword = 'Kiran_654321';
    const adminName = 'Admin User';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassword; // Will be hashed by pre-save hook
      await existingAdmin.save();
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${adminEmail}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();


