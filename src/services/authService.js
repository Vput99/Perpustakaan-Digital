import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

/**
 * Helper to format identifier (NISN/NIP/Username) into a Firebase-compatible email
 * @param {string} identifier 
 * @returns {string} email
 */
const formatEmail = (identifier) => {
  if (!identifier) return "";
  return identifier.includes("@") ? identifier : `${identifier}@smartlibrary.id`;
};

/**
 * Login user using NISN, NIP, or Email
 * @param {string} identifier - Could be NISN, NIP, or Email
 * @param {string} password 
 * @returns {Promise<Object>} user
 */
export const loginUser = async (identifier, password) => {
  try {
    const email = formatEmail(identifier);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Optional: Fetch profile to verify role or existence
    const profileSnap = await getDoc(doc(db, "users", userCredential.user.uid));
    
    return {
      user: userCredential.user,
      profile: profileSnap.exists() ? profileSnap.data() : null
    };
  } catch (error) {
    console.error("AuthService Error (Login):", error.code, error.message);
    throw error;
  }
};

/**
 * Register a new user and create their profile in Firestore
 * @param {string} identifier - Could be NISN, NIP, or Username
 * @param {string} password 
 * @param {Object} profileData - { full_name, role, username, ... }
 * @returns {Promise<Object>} user
 */
export const registerUser = async (identifier, password, profileData) => {
  try {
    const email = formatEmail(identifier);
    
    // 1. Create User in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Create Profile in Firestore 'users' collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      username: profileData.username || identifier,
      full_name: profileData.full_name,
      role: profileData.role || "siswa", // Default to 'siswa'
      created_at: serverTimestamp(),
      ...profileData
    });

    return user;
  } catch (error) {
    console.error("AuthService Error (Register):", error.code, error.message);
    throw error;
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("AuthService Error (Logout):", error);
    throw error;
  }
};
