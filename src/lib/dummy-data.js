// Dummy user database for demo purposes
const dummyUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'password123', // Plain text for demo
    email: 'admin@crmaccent.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'testuser',
    password: 'password123', // Plain text for demo
    email: 'test@crmaccent.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    username: 'manager',
    password: 'password123', // Plain text for demo
    email: 'manager@crmaccent.com',
    first_name: 'Manager',
    last_name: 'User',
    role: 'manager',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function findUserByUsername(username) {
  return dummyUsers.find(user => user.username === username && user.is_active);
}

export function getAllUsers() {
  return dummyUsers.filter(user => user.is_active);
}

export function addUser(userData) {
  const newUser = {
    id: Math.max(...dummyUsers.map(u => u.id), 0) + 1,
    username: userData.username,
    password: userData.password, // Plain text for demo
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    role: userData.role || 'user',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  dummyUsers.push(newUser);
  return newUser;
}

export function findUserById(id) {
  return dummyUsers.find(user => user.id === parseInt(id) && user.is_active);
}

export function updateUser(id, userData) {
  const userIndex = dummyUsers.findIndex(user => user.id === parseInt(id));
  if (userIndex === -1) return null;
  
  const updatedUser = {
    ...dummyUsers[userIndex],
    ...userData,
    updated_at: new Date().toISOString()
  };
  
  dummyUsers[userIndex] = updatedUser;
  return updatedUser;
}

export function deleteUser(id) {
  const userIndex = dummyUsers.findIndex(user => user.id === parseInt(id));
  if (userIndex === -1) return false;
  
  // Soft delete - set is_active to false
  dummyUsers[userIndex].is_active = false;
  dummyUsers[userIndex].updated_at = new Date().toISOString();
  return true;
}
