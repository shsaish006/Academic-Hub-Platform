import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, getTableColumns, sql, and, ilike } from 'drizzle-orm';
import { departments, subjects } from '../src/db/schema/app.ts';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

async function testWithFilter(departmentVal?: string, searchVal?: string) {
  try {
    const filterConditions = [];
    if (searchVal) {
      filterConditions.push(ilike(subjects.name, `%${searchVal}%`));
    }
    if (departmentVal) {
      filterConditions.push(ilike(departments.name, `%${departmentVal}%`));
    }
    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    console.log(`\nTesting with department="${departmentVal}", search="${searchVal}"...`);
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);
    console.log("Count result:", countResult);

    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) }
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(2);
    console.log("List length:", subjectsList.length);
  } catch (error) {
    console.error("Filter query failed:", error);
  }
}

async function main() {
  await testWithFilter("Computer Science");
  await testWithFilter(undefined, "Data");
}

main();
