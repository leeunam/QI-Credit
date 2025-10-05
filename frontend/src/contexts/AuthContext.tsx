import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  userType?: 'investor' | 'client';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, userType: 'investor' | 'client') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: User[] = [
  { id: '1', email: 'user@example.com', name: 'João Silva' },
  { id: '2', email: 'admin@example.com', name: 'Maria Santos' },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication logic
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === '123456') { // Mock password validation
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};