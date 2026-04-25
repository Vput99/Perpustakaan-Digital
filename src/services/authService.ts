import usersData from '../data/users.json';

export interface User {
  id: string;
  username: string;
  role: 'Siswa' | 'Admin' | 'Kantin' | 'Umum';
  name: string;
  kelas?: number;
}

// In a real app, this would be an API call to a backend
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = usersData.find(u => u.username === username && u.password === password);

  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  return null;
};