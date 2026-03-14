import db from './db.js';

console.log('🌱 Seeding database...');

// Clear existing data
db.prepare('DELETE FROM users').run();
db.prepare('DELETE FROM requests').run();

// 1. Insert Users
const insertUser = db.prepare('INSERT INTO users (name, role) VALUES (?, ?)');
const dispatcher = insertUser.run('dispatcher', 'dispatcher');
const master1 = insertUser.run('master1', 'master');
const master2 = insertUser.run('master2', 'master');

const master1Id = Number(master1.lastInsertRowid);
const master2Id = Number(master2.lastInsertRowid);

console.log('✅ Users seeded.');

// 2. Insert 5 Test Requests
const insertRequest = db.prepare(`
  INSERT INTO requests (clientName, phone, address, problemText, status, masterId) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertRequest.run(
  'Alice Johnson', 
  '555-0101', 
  '123 Maple St', 
  'Kitchen sink is leaking', 
  'new', 
  null
);

insertRequest.run(
  'Bob Smith', 
  '555-0102', 
  '456 Oak Ave', 
  'Broken window in the living room', 
  'assigned', 
  master1Id
);

insertRequest.run(
  'Charlie Brown', 
  '555-0103', 
  '789 Pine Rd', 
  'Electrical outlet not working', 
  'in_progress', 
  master2Id
);

insertRequest.run(
  'Diana Prince', 
  '555-0104', 
  '101 Wonder Way', 
  'Door lock is jammed', 
  'done', 
  master1Id
);

insertRequest.run(
  'Edward Norton', 
  '555-0105', 
  '202 Fight Club Ln', 
  'Wall needs painting', 
  'canceled', 
  null
);

console.log('✅ Test requests seeded.');
console.log('🚀 Database is ready!');
process.exit(0);
