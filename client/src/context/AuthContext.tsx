import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePrivy, useWallets, type User } from '@privy-io/react-auth';

interface DbUser {
    id: number;
    email?: string;
    privy_id?: string;
    // Add other fields as needed
}

interface AuthContextType {
    user: User | null;
    dbUser: DbUser | null;
    authenticated: boolean;
    ready: boolean;
    login: () => void;
    logout: () => void;
    wallet: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, authenticated, ready, login, logout } = usePrivy();
    const { wallets } = useWallets();
    const [dbUser, setDbUser] = useState<DbUser | null>(null);

    const wallet = wallets[0]?.address || user?.wallet?.address || null;

    useEffect(() => {
        const syncUser = async () => {
            if (authenticated && user) {
                try {
                    const response = await fetch('http://localhost:3001/api/auth/privy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ user }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.user) {
                            setDbUser(data.user);
                            console.log('✅ User synced with backend:', data.user.id);
                        }
                    } else {
                        console.error('Failed to sync user with backend');
                    }
                } catch (error) {
                    console.error('Error syncing user:', error);
                }
            } else if (!authenticated) {
                setDbUser(null);
            }
        };

        syncUser();
    }, [authenticated, user]);

    return (
        <AuthContext.Provider value={{ user, dbUser, authenticated, ready, login, logout, wallet }}>
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
