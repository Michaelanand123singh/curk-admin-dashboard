// Test script to verify environment variables
console.log('Testing environment variables...');

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  console.log('Browser environment detected');
  console.log('Current hostname:', window.location.hostname);
  console.log('Current URL:', window.location.href);
} else {
  console.log('Node.js environment detected');
}

// Check Vite environment variables
if (typeof import !== 'undefined' && import.meta) {
  console.log('Vite environment variables:');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('VITE_USE_API_KEY:', import.meta.env.VITE_USE_API_KEY);
  console.log('VITE_API_KEY:', import.meta.env.VITE_API_KEY);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
} else {
  console.log('import.meta not available');
}

// Check Node.js environment variables
if (typeof process !== 'undefined' && process.env) {
  console.log('Node.js environment variables:');
  console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
  console.log('VITE_USE_API_KEY:', process.env.VITE_USE_API_KEY);
  console.log('VITE_API_KEY:', process.env.VITE_API_KEY);
  console.log('NODE_ENV:', process.env.NODE_ENV);
}
