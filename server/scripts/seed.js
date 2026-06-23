import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO clients (client_id, full_name, email, mobile, city, state, age, gender, occupation, health_condition, beauty_goal, created_at)
       VALUES (1,'Riya Hans',$1,'+918181241943','Indore','Madhya Pradesh',25,'Male','Teacher','Vitamin D Deficiency','Skin Glow','2023-11-14')
       ON CONFLICT (client_id) DO UPDATE SET full_name=EXCLUDED.full_name, email=EXCLUDED.email, mobile=EXCLUDED.mobile, city=EXCLUDED.city, state=EXCLUDED.state,
       age=EXCLUDED.age, gender=EXCLUDED.gender, occupation=EXCLUDED.occupation, health_condition=EXCLUDED.health_condition, beauty_goal=EXCLUDED.beauty_goal, created_at=EXCLUDED.created_at`,
      [process.env.SEED_USER_EMAIL ?? "user1@example.com"],
    );

    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@careview.local";
    const userEmail = process.env.SEED_USER_EMAIL ?? "user1@example.com";
    const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345", 12);
    const userHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD ?? "User@12345", 12);
    await client.query(
      `INSERT INTO users (id,email,password_hash,role) VALUES ($1,$2,$3,'ADMIN')
       ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='ADMIN', updated_at=CURRENT_TIMESTAMP`,
      [randomUUID(), adminEmail, adminHash],
    );
    await client.query(
      `INSERT INTO users (id,email,password_hash,role,client_id) VALUES ($1,$2,$3,'USER',1)
       ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='USER', client_id=1, updated_at=CURRENT_TIMESTAMP`,
      [randomUUID(), userEmail, userHash],
    );

    const reports = [
      ["DEMO-001",1,"2025-08-10",11.8,18,218,108,0.9,"Negative",26.4,"Increase vitamin D intake and continue regular activity"],
      ["DEMO-002",1,"2026-02-12",12.4,31,194,96,0.84,"Negative",24.9,"Values improved; maintain current diet and exercise plan"],
    ];
    for (const row of reports) {
      await client.query(
        `INSERT INTO health_reports (report_id,client_id,report_date,hemoglobin,vitamin_d,cholesterol,blood_sugar_fasting,creatinine,urine_protein,bmi,doctor_notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (report_id) DO NOTHING`, row,
      );
    }
    await client.query("COMMIT");
    console.log("Seed complete");
    console.log("Admin: admin@careview.local / Admin@12345");
    console.log("User:  user1@example.com / User@12345");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

main().finally(() => pool.end()).catch((error) => { console.error(error); process.exit(1); });
