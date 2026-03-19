// Seed script - run via: npm run db:seed
// This calls the seed API endpoint for simplicity
async function main() {
  const baseUrl = process.env.SEED_URL ?? "http://localhost:3000";
  console.log(`Seeding database via ${baseUrl}/api/seed...`);

  try {
    const res = await fetch(`${baseUrl}/api/seed`, { method: "POST" });
    const data = await res.json();
    console.log("Seed result:", data);
  } catch (error) {
    console.error("Seed failed. Make sure the dev server is running:", error);
    process.exit(1);
  }
}

main();
