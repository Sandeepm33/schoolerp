const bcrypt = require('bcryptjs');
const { School, User } = require('./models/coreModels');

const seedData = async () => {
  try {
    // Only ensure SaaS Super Admin account exists if database is completely empty
    const superAdminExists = await User.findOne({ role: 'SAAS_SUPER_ADMIN' });
    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Platform Super Admin',
        email: 'superadmin@saas.com',
        password: hashedPassword,
        role: 'SAAS_SUPER_ADMIN',
        phone: '+1 (800) 555-SAAS',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'
      });
      console.log('✅ SaaS Super Admin master account initialized: superadmin@saas.com');
    }
  } catch (error) {
    console.error('Error initializing master account:', error);
  }
};

module.exports = seedData;
