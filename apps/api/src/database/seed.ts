import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as schema from './schema';

const sqlite = new Database('./data/sekawan.db');
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('Seeding database...');

  // Clear existing data
  console.log('Clearing existing data...');
  db.delete(schema.approvals).run();
  db.delete(schema.fuelLogs).run();
  db.delete(schema.serviceSchedules).run();
  db.delete(schema.bookings).run();
  db.delete(schema.drivers).run();
  db.delete(schema.vehicles).run();
  db.delete(schema.users).run();
  db.delete(schema.regions).run();

  // Create regions
  console.log('Creating regions...');
  const regionData = [
    { name: 'Headquarters Jakarta', type: 'HEADQUARTERS' as const },
    { name: 'Branch Office Makassar', type: 'BRANCH' as const },
    { name: 'Mine Site A - Morowali', type: 'MINE' as const },
    { name: 'Mine Site B - Konawe', type: 'MINE' as const },
    { name: 'Mine Site C - Kolaka', type: 'MINE' as const },
    { name: 'Mine Site D - Bombana', type: 'MINE' as const },
    { name: 'Mine Site E - Pomalaa', type: 'MINE' as const },
    { name: 'Mine Site F - Luwuk', type: 'MINE' as const },
  ];

  for (const region of regionData) {
    db.insert(schema.regions).values(region).run();
  }

  const regions = db.select().from(schema.regions).all();
  console.log(`Created ${regions.length} regions`);

  // Create users
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const userData = [
    { email: 'admin@sekawan.com', name: 'Admin User', role: 'ADMIN' as const, regionId: regions[0].id },
    { email: 'approver1@sekawan.com', name: 'Approver Level 1', role: 'APPROVER_L1' as const, regionId: regions[0].id },
    { email: 'approver2@sekawan.com', name: 'Approver Level 2', role: 'APPROVER_L2' as const, regionId: regions[0].id },
    { email: 'approver.site.a@sekawan.com', name: 'Site A Approver L1', role: 'APPROVER_L1' as const, regionId: regions[2].id },
    { email: 'approver.site.b@sekawan.com', name: 'Site B Approver L1', role: 'APPROVER_L1' as const, regionId: regions[3].id },
  ];

  for (const user of userData) {
    db.insert(schema.users).values({ ...user, passwordHash }).run();
  }

  const users = db.select().from(schema.users).all();
  console.log(`Created ${users.length} users`);

  // Create vehicles
  console.log('Creating vehicles...');
  const vehicleData = [
    { plateNumber: 'B 1234 ABC', brand: 'Toyota', model: 'Hilux', type: 'CARGO' as const, ownership: 'COMPANY' as const, regionId: regions[0].id },
    { plateNumber: 'B 5678 DEF', brand: 'Toyota', model: 'Innova', type: 'PASSENGER' as const, ownership: 'COMPANY' as const, regionId: regions[0].id },
    { plateNumber: 'DK 1111 GHI', brand: 'Mitsubishi', model: 'Pajero', type: 'PASSENGER' as const, ownership: 'COMPANY' as const, regionId: regions[1].id },
    { plateNumber: 'DK 2222 JKL', brand: 'Isuzu', model: 'D-Max', type: 'CARGO' as const, ownership: 'RENTAL' as const, rentalCompany: 'PT Rental Jaya', regionId: regions[2].id },
    { plateNumber: 'DK 3333 MNO', brand: 'Ford', model: 'Ranger', type: 'CARGO' as const, ownership: 'COMPANY' as const, regionId: regions[3].id },
    { plateNumber: 'DK 4444 PQR', brand: 'Toyota', model: 'Fortuner', type: 'PASSENGER' as const, ownership: 'RENTAL' as const, rentalCompany: 'CV Auto Rental', regionId: regions[4].id },
    { plateNumber: 'DK 5555 STU', brand: 'Nissan', model: 'Navara', type: 'CARGO' as const, ownership: 'COMPANY' as const, regionId: regions[5].id },
    { plateNumber: 'DK 6666 VWX', brand: 'Mitsubishi', model: 'Triton', type: 'CARGO' as const, ownership: 'COMPANY' as const, regionId: regions[6].id },
  ];

  for (const vehicle of vehicleData) {
    db.insert(schema.vehicles).values(vehicle).run();
  }

  const vehicles = db.select().from(schema.vehicles).all();
  console.log(`Created ${vehicles.length} vehicles`);

  // Create drivers
  console.log('Creating drivers...');
  const driverData = [
    { name: 'Budi Santoso', licenseNumber: 'SIM-001-2024', phone: '+6281234567890', regionId: regions[0].id },
    { name: 'Agus Prasetyo', licenseNumber: 'SIM-002-2024', phone: '+6281234567891', regionId: regions[0].id },
    { name: 'Dedi Kurniawan', licenseNumber: 'SIM-003-2024', phone: '+6281234567892', regionId: regions[1].id },
    { name: 'Eko Wijaya', licenseNumber: 'SIM-004-2024', phone: '+6281234567893', regionId: regions[2].id },
    { name: 'Fajar Nugroho', licenseNumber: 'SIM-005-2024', phone: '+6281234567894', regionId: regions[3].id },
    { name: 'Gunawan Setiawan', licenseNumber: 'SIM-006-2024', phone: '+6281234567895', regionId: regions[4].id },
  ];

  for (const driver of driverData) {
    db.insert(schema.drivers).values(driver).run();
  }

  const drivers = db.select().from(schema.drivers).all();
  console.log(`Created ${drivers.length} drivers`);

  // Create sample bookings
  console.log('Creating sample bookings...');
  const admin = users.find((u) => u.role === 'ADMIN')!;
  const approverL1 = users.find((u) => u.role === 'APPROVER_L1')!;
  const approverL2 = users.find((u) => u.role === 'APPROVER_L2')!;

  const today = new Date();
  const bookingData = [
    {
      vehicleId: vehicles[0].id,
      driverId: drivers[0].id,
      requesterId: admin.id,
      startDate: new Date(today.getTime() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(today.getTime() + 86400000 * 3).toISOString(), // 3 days from now
      purpose: 'Site inspection at Mine A',
      status: 'PENDING_L1' as const,
      approverL1Id: approverL1.id,
      approverL2Id: approverL2.id,
    },
    {
      vehicleId: vehicles[1].id,
      driverId: drivers[1].id,
      requesterId: admin.id,
      startDate: new Date(today.getTime() - 86400000 * 5).toISOString(), // 5 days ago
      endDate: new Date(today.getTime() - 86400000 * 3).toISOString(), // 3 days ago
      purpose: 'Client meeting in Jakarta',
      status: 'COMPLETED' as const,
      approverL1Id: approverL1.id,
      approverL2Id: approverL2.id,
    },
    {
      vehicleId: vehicles[2].id,
      driverId: drivers[2].id,
      requesterId: admin.id,
      startDate: new Date(today.getTime() + 86400000 * 7).toISOString(), // 7 days from now
      endDate: new Date(today.getTime() + 86400000 * 10).toISOString(), // 10 days from now
      purpose: 'Equipment transport to Mine B',
      status: 'APPROVED' as const,
      approverL1Id: approverL1.id,
      approverL2Id: approverL2.id,
    },
  ];

  for (const booking of bookingData) {
    db.insert(schema.bookings).values(booking).run();
  }

  const bookings = db.select().from(schema.bookings).all();
  console.log(`Created ${bookings.length} bookings`);

  // Create approvals for bookings
  console.log('Creating approvals...');
  for (const booking of bookings) {
    // Level 1 approval
    db.insert(schema.approvals)
      .values({
        bookingId: booking.id,
        approverId: booking.approverL1Id,
        level: 1,
        status: booking.status === 'PENDING_L1' ? 'PENDING' : 'APPROVED',
        decidedAt: booking.status !== 'PENDING_L1' ? new Date().toISOString() : null,
      })
      .run();

    // Level 2 approval
    if (booking.status !== 'PENDING_L1') {
      db.insert(schema.approvals)
        .values({
          bookingId: booking.id,
          approverId: booking.approverL2Id,
          level: 2,
          status: booking.status === 'PENDING_L2' ? 'PENDING' : booking.status === 'APPROVED' || booking.status === 'COMPLETED' ? 'APPROVED' : 'REJECTED',
          decidedAt: booking.status !== 'PENDING_L2' ? new Date().toISOString() : null,
        })
        .run();
    }
  }

  // Create some fuel logs
  console.log('Creating fuel logs...');
  const fuelLogData = [
    { vehicleId: vehicles[0].id, liters: 45.5, cost: 500000, odometer: 35420, loggedAt: new Date(today.getTime() - 86400000 * 7).toISOString() },
    { vehicleId: vehicles[0].id, liters: 50.0, cost: 550000, odometer: 35850, loggedAt: new Date(today.getTime() - 86400000 * 3).toISOString() },
    { vehicleId: vehicles[1].id, liters: 40.0, cost: 440000, odometer: 28150, loggedAt: new Date(today.getTime() - 86400000 * 5).toISOString() },
    { vehicleId: vehicles[2].id, liters: 55.0, cost: 605000, odometer: 42300, loggedAt: new Date(today.getTime() - 86400000 * 2).toISOString() },
  ];

  for (const log of fuelLogData) {
    db.insert(schema.fuelLogs).values(log).run();
  }

  // Create some service schedules
  console.log('Creating service schedules...');
  const serviceData = [
    { vehicleId: vehicles[0].id, type: 'ROUTINE' as const, description: 'Regular oil change and inspection', scheduledDate: new Date(today.getTime() + 86400000 * 14).toISOString(), status: 'SCHEDULED' as const },
    { vehicleId: vehicles[1].id, type: 'REPAIR' as const, description: 'Brake pad replacement', scheduledDate: new Date(today.getTime() + 86400000 * 3).toISOString(), status: 'SCHEDULED' as const },
    { vehicleId: vehicles[2].id, type: 'ROUTINE' as const, description: '20,000 km service', scheduledDate: new Date(today.getTime() - 86400000 * 10).toISOString(), completedDate: new Date(today.getTime() - 86400000 * 9).toISOString(), cost: 2500000, status: 'COMPLETED' as const },
  ];

  for (const service of serviceData) {
    db.insert(schema.serviceSchedules).values(service).run();
  }

  console.log('✅ Seeding complete!');
  console.log('\n📋 Demo credentials:');
  console.log('  Admin: admin@sekawan.com / password123');
  console.log('  Approver L1: approver1@sekawan.com / password123');
  console.log('  Approver L2: approver2@sekawan.com / password123');

  sqlite.close();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
