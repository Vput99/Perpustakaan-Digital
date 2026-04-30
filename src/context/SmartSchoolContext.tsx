import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Student, TransactionLog } from '../types';
import { supabase } from '../lib/supabase';

interface SmartSchoolState {
  profile: any | null;
  students: Student[];
  transactionLogs: TransactionLog[];
  loading: boolean;
  refreshData: () => Promise<void>;
  searchStudents: (query: string) => Student[];
  updateStudentCoins: (studentId: string, amount: number, description?: string) => Promise<boolean>;
}

const SmartSchoolContext = createContext<SmartSchoolState | null>(null);

export function SmartSchoolProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<any | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Fetch current user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      // Fetch all students (for admin/kantin views)
      const { data: studentData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'siswa');
      
      if (studentData) {
        setStudents(studentData.map(s => ({
          id: s.id,
          name: s.full_name,
          absen: s.absen || '',
          photo_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.full_name}`,
          coins: s.coins || 0
        })));
      }

      // Fetch recent transactions
      const { data: logs } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (logs) {
        setTransactionLogs(logs.map(l => ({
          id: l.id,
          student_id: l.student_id,
          amount: l.amount,
          description: l.description,
          timestamp: l.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching SmartSchool data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchData();
      } else {
        setProfile(null);
        setStudents([]);
        setTransactionLogs([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  const searchStudents = useCallback((query: string) => {
    const q = query.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.absen.toString().includes(q)
    );
  }, [students]);

  const updateStudentCoins = async (studentId: string, amount: number, description?: string): Promise<boolean> => {
    try {
      // 1. Get current balance
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', studentId)
        .single();
      
      if (fetchError || !currentProfile) return false;

      const newBalance = (currentProfile.coins || 0) + amount;
      if (newBalance < 0) return false;

      // 2. Update balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newBalance })
        .eq('id', studentId);

      if (updateError) return false;

      // 3. Log transaction
      await supabase.from('transactions').insert({
        student_id: studentId,
        amount: Math.abs(amount),
        type: amount > 0 ? 'earn' : 'redeem',
        description: description || (amount > 0 ? 'Hadiah Misi' : 'Penukaran Kantin')
      });

      // 4. Refresh local state
      await fetchData();
      return true;
    } catch (error) {
      console.error('Transaction error:', error);
      return false;
    }
  };

  return (
    <SmartSchoolContext.Provider value={{
      profile,
      students,
      transactionLogs,
      loading,
      refreshData: fetchData,
      searchStudents,
      updateStudentCoins,
    }}>
      {children}
    </SmartSchoolContext.Provider>
  );
}

export function useSmartSchool() {
  const ctx = useContext(SmartSchoolContext);
  if (!ctx) throw new Error('useSmartSchool must be used within SmartSchoolProvider');
  return ctx;
}
