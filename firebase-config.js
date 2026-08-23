// ============================================================
// CONFIGURACIÓN DE FIREBASE
// Reemplaza estos valores con los de TU proyecto de Firebase.
// Los encuentras en: Firebase Console → Configuración del proyecto
// → General → "Tus apps" → Configuración del SDK
//
// Estos valores NO son secretos (son públicos por diseño en apps
// web de Firebase), así que no hay problema en subirlos a GitHub.
// La seguridad real la dan las Reglas de Firestore (ver README.md).
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCFHUcAJiOyaoSq2P9q7wSxCVs4llJdfP0",
  authDomain: "familyplan-17101.firebaseapp.com",
  projectId: "familyplan-17101",
  storageBucket: "familyplan-17101.firebasestorage.app",
  messagingSenderId: "802917392905",
  appId: "1:802917392905:web:04bbefc3d40135f9efced8",
};

firebase.initializeApp(firebaseConfig);
