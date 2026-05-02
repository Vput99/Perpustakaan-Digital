import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Student, TransactionLog } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

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
    const user = auth.currentUser;
    
    try {
      if (user) {
        // Fetch current user profile from Firestore
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile({ id: profileSnap.id, ...profileSnap.data() });
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      // Fetch all students (for admin/kantin views)
      const studentsQuery = query(
        collection(db, 'users'), 
        where('role', '==', 'siswa')
      );
      const studentSnaps = await getDocs(studentsQuery);
      
      const studentData = studentSnaps.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.full_name || '',
          full_name: data.full_name || '',
          absen: data.absen || '',
          class: data.class || '',
          nisn: data.nisn || '',
          photo_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.full_name}`,
          coins: data.coins || 0
        };
      });
      setStudents(studentData);

      // Fetch recent transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      const transactionSnaps = await getDocs(transactionsQuery);
      
      const logs = transactionSnaps.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          student_id: data.student_id,
          amount: data.amount,
          description: data.description,
          timestamp: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at
        };
      });
      setTransactionLogs(logs);

    } catch (error) {
      console.error('Error fetching SmartSchool data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
      } else {
        setProfile(null);
        setStudents([]);
        setTransactionLogs([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchData]);

  const searchStudents = useCallback((queryStr: string) => {
    const q = queryStr.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.absen.toString().includes(q)
    );
  }, [students]);

  const updateStudentCoins = async (studentId: string, amount: number, description?: string): Promise<boolean> => {
    try {
      // 1. Get current balance
      const studentRef = doc(db, 'users', studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (!studentSnap.exists()) return false;

      const currentData = studentSnap.data();
      const newBalance = (currentData.coins || 0) + amount;
      if (newBalance < 0) return false;

      // 2. Update balance
      await updateDoc(studentRef, { coins: newBalance });

      // 3. Log transaction
      await addDoc(collection(db, 'transactions'), {
        student_id: studentId,
        amount: Math.abs(amount),
        type: amount > 0 ? 'earn' : 'redeem',
        description: description || (amount > 0 ? 'Hadiah Misi' : 'Penukaran Kantin'),
        created_at: serverTimestamp()
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
