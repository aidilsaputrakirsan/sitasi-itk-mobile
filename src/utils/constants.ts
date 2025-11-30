// IMPORTANT: Replace with your laptop IP address!
// Get IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
// Current IP: 192.168.18.12
export const API_BASE_URL = 'http://192.168.18.12:8000/api/v1';

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
