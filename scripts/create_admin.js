const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function main(){
  const args = process.argv.slice(2);
  const username = args[0] || 'admin';
  const password = args[1] || 'admin123';

  await mongoose.connect('mongodb://localhost:27017/project2');
  try{
    const existing = await User.findOne({ username });
    const hashed = await bcrypt.hash(password, 10);
    if(existing){
      existing.password = hashed;
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated existing user '${username}' to admin.`);
    } else {
      const user = new User({ username, password: hashed, role: 'admin' });
      await user.save();
      console.log(`Created admin user '${username}'.`);
    }
  }catch(err){
    console.error(err);
  }finally{
    mongoose.disconnect();
  }
}

main();
