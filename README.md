# SITASI ITK Mobile App

Mobile application for **SITASI ITK** (Sistem Informasi Tugas Akhir - Institut Teknologi Kalimantan) built with React Native and Expo.

## 🚀 Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **React Native Paper** (Material Design 3)
- **React Navigation** (Bottom Tabs)
- **Axios** for API calls
- **AsyncStorage** for local storage
- **date-fns** for date formatting

## ✨ Features

### Phase 1: Authentication & Profile ✅
- ✅ Login with email or username
- ✅ User profile display (Mahasiswa/Dosen)
- ✅ Edit profile
- ✅ Change password
- ✅ Logout functionality
- ✅ Light/Dark theme support

### Phase 2: Dashboard ✅
- ✅ **Mahasiswa Dashboard:**
  - Welcome section with user info
  - Total Bimbingan statistics
  - Status progress steppers (Pengajuan TA, Sempro, Sidang TA)
  - Quick action cards
- ✅ **Dosen Dashboard:**
  - Welcome section
  - Quick action cards

### Phase 3: Bimbingan (Guidance) ✅
- ✅ List all bimbingan with statistics
- ✅ Create new bimbingan with date picker
- ✅ View bimbingan details
- ✅ Edit bimbingan (only if status is "Pending")
- ✅ Delete bimbingan (only if status is "Pending")
- ✅ Pull to refresh
- ✅ Empty state handling

## 📋 Prerequisites

Before running the app, make sure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (will be installed with dependencies)
4. **Expo Go** app on your mobile device (iOS/Android)
5. **Laravel backend API** running

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Base URL

**⚠️ CRITICAL: Update the API Base URL**

Open `src/utils/constants.ts` and replace `YOUR_IP_ADDRESS` with your laptop's actual IP address:

```typescript
// BEFORE:
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000/api/v1';

// AFTER (example):
export const API_BASE_URL = 'http://192.168.1.100:8000/api/v1';
```

**How to find your IP address:**
- **Windows:** Open Command Prompt and run `ipconfig`
- **macOS/Linux:** Open Terminal and run `ifconfig` or `ip addr`

**Important Notes:**
- ❌ **DO NOT use** `localhost` or `127.0.0.1` - mobile devices cannot access localhost
- ✅ **MUST use** your computer's IP address on the same WiFi network
- ✅ Make sure your mobile device and laptop are on the **same WiFi network**

### 3. Start Laravel Backend

Make sure your Laravel backend is running with the correct host:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

This allows the Laravel server to accept connections from other devices on the network.

### 4. Run the App

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in your terminal.

### 5. Open on Your Device

- **iOS:** Open the Camera app and scan the QR code
- **Android:** Open the Expo Go app and scan the QR code

## 📱 App Structure

```
src/
├── api/
│   └── client.ts                 # Axios client with interceptors
├── services/
│   ├── authService.ts            # Authentication API calls
│   └── bimbinganService.ts       # Bimbingan CRUD API calls
├── navigation/
│   ├── AppNavigator.tsx          # Root navigator (auth check)
│   ├── AuthNavigator.tsx         # Login screens
│   └── MainNavigator.tsx         # Bottom tabs navigation
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── home/
│   │   ├── HomeScreen.tsx
│   │   ├── DashboardMahasiswaScreen.tsx
│   │   └── DashboardDosenScreen.tsx
│   ├── bimbingan/
│   │   ├── BimbinganListScreen.tsx
│   │   ├── BimbinganDetailScreen.tsx
│   │   ├── CreateBimbinganScreen.tsx
│   │   └── EditBimbinganScreen.tsx
│   └── profile/
│       ├── ProfileScreen.tsx
│       ├── EditProfileScreen.tsx
│       └── ChangePasswordScreen.tsx
├── components/
│   ├── StatusProgressStepper.tsx # Reusable progress stepper
│   ├── StatCard.tsx              # Statistics card
│   ├── ActionCard.tsx            # Action card for dashboard
│   └── BimbinganListItem.tsx     # Bimbingan list item
├── utils/
│   ├── storage.ts                # AsyncStorage helpers
│   ├── constants.ts              # API URL & colors
│   └── dateFormatter.ts          # Date formatting utilities
├── types/
│   └── index.ts                  # TypeScript interfaces
├── theme/
│   ├── lightTheme.ts             # Light theme config
│   └── darkTheme.ts              # Dark theme config
└── contexts/
    ├── AuthContext.tsx           # Auth state management
    └── ThemeContext.tsx          # Theme state management
```

## 🎨 Design System

### Colors
- **Primary:** ITK Blue `#003D82` (Navy Blue)
- **Secondary:** `#0066CC` (Bright Blue)
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Orange/Yellow)
- **Error:** `#ef4444` (Red)

### Status Colors
- **Pending:** Orange/Yellow
- **Disetujui:** Green
- **Ditolak:** Red

## 🔑 API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication
- `POST /auth/login` - Login (email or username)
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile
- `POST /auth/change-password` - Change password

### Bimbingan
- `GET /bimbingan` - Get all user's bimbingan
- `GET /bimbingan/statistics` - Get statistics
- `GET /bimbingan/{id}` - Get single bimbingan
- `POST /bimbingan` - Create bimbingan
- `PUT /bimbingan/{id}` - Update bimbingan
- `DELETE /bimbingan/{id}` - Delete bimbingan

## 🔍 Testing

### Test Users
Use your Laravel backend test users or create new ones.

### Testing Checklist
- [ ] Login with email
- [ ] Login with username
- [ ] View dashboard (Mahasiswa)
- [ ] View dashboard (Dosen)
- [ ] Create bimbingan
- [ ] View bimbingan list
- [ ] Edit bimbingan (Pending only)
- [ ] Delete bimbingan (Pending only)
- [ ] Edit profile
- [ ] Change password
- [ ] Toggle dark/light theme
- [ ] Logout

## 🐛 Troubleshooting

### Cannot connect to API
**Problem:** App shows network errors or cannot reach API

**Solutions:**
1. Verify laptop and phone are on the **same WiFi network**
2. Check if `API_BASE_URL` in `src/utils/constants.ts` uses correct IP
3. Ensure Laravel is running with `--host=0.0.0.0`
4. Try accessing API from browser: `http://YOUR_IP:8000/api/v1`
5. Check firewall settings on your laptop
6. Restart Laravel server and Expo dev server

### Login fails with 401
**Problem:** Login returns unauthorized error

**Solutions:**
1. Verify credentials are correct
2. Check Laravel logs for error details
3. Test API with Postman/Insomnia first
4. Ensure request body format: `{ email: string, password: string }`

### Dark theme not working
**Problem:** Theme toggle doesn't change appearance

**Solutions:**
1. Verify `ThemeContext` is properly set up
2. Check if theme preference is saved to AsyncStorage
3. Restart the app completely

### Date picker shows wrong locale
**Problem:** Date picker shows English instead of Indonesian

**Solutions:**
1. Verify `registerTranslation('id', id)` is called in `App.tsx`
2. Check if `react-native-paper-dates` is properly installed

## 📝 Next Steps (Phase 4+)

Future enhancements to consider:
- [ ] File upload for bimbingan
- [ ] Push notifications
- [ ] Offline mode with local caching
- [ ] Seminar Proposal (Sempro) features
- [ ] Sidang TA features
- [ ] Charts and analytics
- [ ] Multi-language support
- [ ] Biometric authentication

## 👥 User Roles

### Mahasiswa (Student)
- View personalized dashboard with progress steppers
- Manage bimbingan (create, edit, delete)
- View total bimbingan statistics
- Track TA, Sempro, and Sidang progress

### Dosen (Lecturer)
- View all students' bimbingan
- Provide feedback on bimbingan
- Access quick actions for Sempro and Sidang

## 🎯 Key Features Highlights

1. **Role-Based UI:** Different dashboards for Mahasiswa and Dosen
2. **Real-time Updates:** Pull to refresh on all lists
3. **Smart Validation:** Client-side validation for all forms
4. **Status-Based Actions:** Edit/Delete only available for pending items
5. **Indonesian Locale:** All dates formatted in Indonesian
6. **Material Design 3:** Modern, accessible UI components
7. **Theme Support:** Automatic light/dark mode detection
8. **Secure Auth:** Token-based authentication with interceptors

## 📄 License

This project is part of Institut Teknologi Kalimantan's SITASI system.

## 🙏 Acknowledgments

- Institut Teknologi Kalimantan (ITK)
- React Native Paper team
- Expo team
- React Navigation team

---

**Built with ❤️ for ITK students and faculty**
