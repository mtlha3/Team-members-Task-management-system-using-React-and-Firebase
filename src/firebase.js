
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyBypyEOo4yfmnm2a4SqvTk4fMfGW13OYMk",
//   authDomain: "talhab10.firebaseapp.com",
//   databaseURL: "https://talhab10-default-rtdb.firebaseio.com",
//   projectId: "talhab10",
//   storageBucket: "talhab10.appspot.com",
//   messagingSenderId: "1068680426066",
//   appId: "1:1068680426066:web:ffc661b6d7d5231f7f258b",
//   measurementId: "G-E7CXC3297K"
// };

// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);

// const db = getFirestore(app);

// export { db };

// export default auth; 






// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBypyEOo4yfmnm2a4SqvTk4fMfGW13OYMk",
  authDomain: "talhab10.firebaseapp.com",
  databaseURL: "https://talhab10-default-rtdb.firebaseio.com",
  projectId: "talhab10",
  storageBucket: "talhab10.appspot.com",
  messagingSenderId: "1068680426066",
  appId: "1:1068680426066:web:ffc661b6d7d5231f7f258b",
  measurementId: "G-E7CXC3297K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export the auth and db objects
export { auth, db };

