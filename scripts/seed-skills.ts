/**
 * Seed script: adds missing skills to MongoDB without duplicating existing ones.
 * Run with:  npm run seed:skills
 */

import * as dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Fix DNS for Windows / Node 18+ (same as lib/db.ts)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// ── Skill schema (inline to avoid Next.js-specific imports) ──────────────────
const SkillSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  proficiency: { type: Number, required: true, min: 0, max: 100 },
  icon:        String,
  order:       { type: Number, default: 0 },
}, { timestamps: true });

const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);

// ── Skills to seed ────────────────────────────────────────────────────────────
// These match the exact category names already in your database.
// Adjust category strings if yours differ.
const skillsToSeed = [
  // Programming Languages
  { name: 'JavaScript',   category: 'Programming Languages', proficiency: 90 },
  { name: 'TypeScript',   category: 'Programming Languages', proficiency: 85 },
  { name: 'C++',          category: 'Programming Languages', proficiency: 75 },
  { name: 'C',            category: 'Programming Languages', proficiency: 75 },
  { name: 'Python',       category: 'Programming Languages', proficiency: 80 },
  { name: 'Java',         category: 'Programming Languages', proficiency: 70 }, // NEW

  // Frontend Development
  { name: 'HTML',         category: 'Frontend Development',  proficiency: 95 },
  { name: 'CSS',          category: 'Frontend Development',  proficiency: 90 },
  { name: 'Tailwind CSS', category: 'Frontend Development',  proficiency: 90 },
  { name: 'React',        category: 'Frontend Development',  proficiency: 90 },
  { name: 'Next.js',      category: 'Frontend Development',  proficiency: 85 },

  // Backend Development
  { name: 'Node.js',      category: 'Backend Development',   proficiency: 85 },
  { name: 'Express.js',   category: 'Backend Development',   proficiency: 85 },
  { name: 'MongoDB',      category: 'Backend Development',   proficiency: 80 },
  { name: 'MySQL',        category: 'Backend Development',   proficiency: 75 }, // NEW
  { name: 'JSON',         category: 'Backend Development',   proficiency: 90 }, // NEW

  // CMS
  { name: 'WordPress',    category: 'CMS',                   proficiency: 80 },
  { name: 'Blogger',      category: 'CMS',                   proficiency: 75 },

  // Tools & Technologies
  { name: 'VS Code',      category: 'Tools & Technologies',  proficiency: 95 },
  { name: 'GitHub',       category: 'Tools & Technologies',  proficiency: 90 },
  { name: 'Git',          category: 'Tools & Technologies',  proficiency: 88 },
  { name: 'npm',          category: 'Tools & Technologies',  proficiency: 85 }, // NEW

  // Design Tools
  { name: 'Canva',              category: 'Design Tools', proficiency: 85 },
  { name: 'Adobe Premiere Pro', category: 'Design Tools', proficiency: 80 },
  { name: 'Photoshop',          category: 'Design Tools', proficiency: 75 },
  { name: 'Adobe XD',           category: 'Design Tools', proficiency: 70 },
  { name: 'Illustrator',        category: 'Design Tools', proficiency: 70 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env.local');

  console.log('Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  let added = 0;
  let skipped = 0;

  for (const skill of skillsToSeed) {
    // Case-insensitive check to avoid duplicates
    const escapedName = skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Skill.findOne({
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    });

    if (existing) {
      console.log(`  ⏭  Skipped (exists): ${skill.name}`);
      skipped++;
    } else {
      await Skill.create(skill);
      console.log(`  ✅ Added: ${skill.name} [${skill.category}]`);
      added++;
    }
  }

  console.log(`\nDone. Added: ${added}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
