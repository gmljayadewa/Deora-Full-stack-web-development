import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// ඔයාගේ .env එකේ තියෙන URL එක ගන්නවා
const connectionString = process.env.DATABASE_URL;

// අලුත් Pool එකක් සහ Adapter එකක් හදනවා
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Next.js වලදී connection ගොඩක් හැදෙන එක නවත්තන්න මේ විදියට පාවිච්චි කරනවා
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;