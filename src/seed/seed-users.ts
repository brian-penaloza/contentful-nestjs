import { DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const usersFilePath = path.join(process.cwd(), 'data', 'user.json');

  try {
    const userData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const sampleUsers = [userData];

    for (const userData of sampleUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = userRepository.create({
          email: userData.email,
          password: hashedPassword,
        });

        await userRepository.save(user);
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    console.log(`👤 Seeded ${sampleUsers.length} users from data/user.json`);
  } catch (error) {
    console.error('❌ Error reading users data file:', error.message);
    throw error;
  }
}
