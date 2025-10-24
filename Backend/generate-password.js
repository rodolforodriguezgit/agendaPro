// generate-password.js (en la raíz del proyecto)
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'rodo';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Password hasheado:', hashedPassword);
  
  // Copia este valor y pégalo en el array de users en routes/auth.js
  console.log('\nCopia este hash y pégalo en routes/auth.js:');
  console.log(hashedPassword);
}

generateHash();