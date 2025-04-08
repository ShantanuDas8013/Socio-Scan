/**
 * Helper utility to load configuration from various sources
 */

// Get Firebase config from window global, environment variables, or fallback
export const getFirebaseConfig = () => {
  // Check for runtime config first (from runtime-config.js)
  if (typeof window !== "undefined" && window.FIREBASE_CONFIG) {
    console.log("Using runtime Firebase config");
    return window.FIREBASE_CONFIG;
  }

  // Check for config in window.RUNTIME_CONFIG (from config.js)
  if (typeof window !== "undefined" && window.RUNTIME_CONFIG) {
    console.log("Using window.RUNTIME_CONFIG Firebase config");
    return {
      apiKey: window.RUNTIME_CONFIG.FIREBASE_API_KEY,
      authDomain: window.RUNTIME_CONFIG.FIREBASE_AUTH_DOMAIN,
      projectId: window.RUNTIME_CONFIG.FIREBASE_PROJECT_ID,
      storageBucket: window.RUNTIME_CONFIG.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: window.RUNTIME_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
      appId: window.RUNTIME_CONFIG.FIREBASE_APP_ID,
      measurementId: window.RUNTIME_CONFIG.FIREBASE_MEASUREMENT_ID,
    };
  }

  // Fallback to hardcoded config
  console.log("Using hardcoded Firebase config");
  return {
    apiKey: "AIzaSyD2mvq7WrWu4u0TPk3g2bqPM3vVx6WZcWM",
    authDomain: "socio-scan.firebaseapp.com",
    projectId: "socio-scan",
    storageBucket: "socio-scan.appspot.com",
    messagingSenderId: "591183114585",
    appId: "1:591183114585:web:b42c116a8c8ccc2d925c48",
    measurementId: "G-GWFYWKPNEV",
  };
};
