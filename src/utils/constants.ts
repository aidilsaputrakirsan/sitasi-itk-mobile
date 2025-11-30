// IMPORTANT: Replace with your laptop IP address!
// Get IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: export const API_BASE_URL = 'http://192.168.1.100:8000/api/v1';
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000/api/v1';

export const COLORS = {
  primary: '#003D82',      // ITK Navy Blue
  secondary: '#0066CC',    // Bright Blue
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const STATUS_COLORS: Record<string, string> = {
  Pending: COLORS.warning,
  Disetujui: COLORS.success,
  Ditolak: COLORS.error,
};
