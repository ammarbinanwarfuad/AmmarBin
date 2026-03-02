import * as dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function main() {
  const Skill = mongoose.models.Skill || mongoose.model('Skill', new mongoose.Schema({
    name: String, category: String, proficiency: Number, icon: String
  }));

  await mongoose.connect(process.env.MONGODB_URI!);

  const result = await Skill.findOneAndUpdate(
    { name: { $regex: /premiere/i } },
    { icon: '/premiere-pro.svg' },
    { new: true }
  );
  console.log('Updated:', result?.name, '->', result?.icon);

  await mongoose.disconnect();
}

main().catch(console.error);
