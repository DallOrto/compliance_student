import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { Client } from 'pg';

export default async function globalSetup() {
  dotenv.config({ path: '.env.test' });

  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  await client.connect();

  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = 'compliance_student_test'",
  );

  if (result.rowCount === 0) {
    await client.query('CREATE DATABASE compliance_student_test');
    console.log('Banco de teste criado: compliance_student_test');
  }

  await client.end();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });
}
