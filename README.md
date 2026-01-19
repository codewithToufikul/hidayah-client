# Hidayah - Quranic Du'a Generator

![Hidayah](https://img.shields.io/badge/Hidayah-Islamic%20Guidance-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-38B2AC?style=for-the-badge&logo=tailwind-css)

**Hidayah** is a modern, responsive web application that provides personalized Quranic verses and Du'as (supplications) based on your emotional state. Find peace and guidance through Allah's words by sharing how you're feeling, and receive relevant verses from the Holy Quran in Arabic, English, and Bengali.

---

## 📖 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Usage](#-usage)
- [API Integration](#-api-integration)
- [Authentication](#-authentication)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features

- **🤲 Emotion-Based Du'a Generation**: Enter your current emotional state (e.g., sad, anxious, grateful, happy) and receive relevant Quranic verses
- **📜 Multi-Language Support**: View verses in:
  - Arabic (original text)
  - English translation
  - Bengali translation (বাংলা অনুবাদ)
- **📚 Du'a History**: Authenticated users can access their complete history of received Du'as
- **🔐 User Authentication**: Secure login and registration system
- **📱 Responsive Design**: Fully responsive UI that works seamlessly on desktop, tablet, and mobile devices
- **🎨 Modern UI/UX**: Beautiful gradient designs with glassmorphism effects and smooth animations

### User Experience

- **Guest Access**: Use the Du'a generator without creating an account
- **Personalized Greetings**: Authenticated users receive personalized Arabic greetings (السلام عليكم)
- **History Sidebar**: Desktop users get a fixed sidebar showing their Du'a history
- **Mobile-Optimized**: Mobile users can access history through a slide-out overlay
- **Real-time Feedback**: Toast notifications for user actions
- **Loading States**: Elegant loading animations during API calls
- **Error Handling**: Clear error messages and validation feedback

---

## 🛠 Technology Stack

### Frontend Framework

- **React 19.1.0** - Modern UI library with latest features
- **React Router DOM 7.7.0** - Client-side routing and navigation

### Styling

- **TailwindCSS 4.1.11** - Utility-first CSS framework
- **Custom Gradients** - Emerald and teal color schemes
- **Glassmorphism Effects** - Modern backdrop blur and transparency

### Build Tools

- **Vite 7.0.4** - Next-generation frontend tooling
- **ESLint** - Code quality and consistency

### State Management & HTTP

- **React Context API** - Global authentication state management
- **Axios 1.11.0** - HTTP client with interceptors for token management

### UI/UX Enhancements

- **React Hot Toast 2.5.2** - Beautiful toast notifications
- **Custom SVG Icons** - Inline SVG for better performance
- **CSS Animations** - Smooth transitions and hover effects

---

## 📁 Project Structure

```
hidayah-client/
├── public/
│   └── vite.svg                    # Vite logo
├── src/
│   ├── Hooks/
│   │   ├── AuthContext.jsx         # Authentication context provider
│   │   └── axiosIntance.jsx        # Axios instance with interceptors
│   ├── Pages/
│   │   ├── Home/
│   │   │   └── Home.jsx            # Main Du'a generator page
│   │   ├── Login/
│   │   │   └── Login.jsx           # User login page
│   │   ├── Register/
│   │   │   └── Register.jsx        # User registration page
│   │   └── Routes.jsx              # Application routing configuration
│   ├── assets/                     # Static assets
│   ├── index.css                   # Global styles
│   └── main.jsx                    # Application entry point
├── .env.local                      # Environment variables (gitignored)
├── .gitignore                      # Git ignore rules
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML template
├── package.json                    # Project dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- A backend API server for Hidayah (see [API Integration](#-api-integration))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/hidayah-client.git
   cd hidayah-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_APPI_BASE_URL=http://localhost:5000/api
```

**Note**: Replace the URL with your actual backend API endpoint.

### Running the Application

#### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will start at `http://localhost:5173` (default Vite port).

#### Production Build

```bash
npm run build
# or
yarn build
```

#### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

#### Linting

```bash
npm run lint
# or
yarn lint
```

---

## 💡 Usage

### For Guest Users

1. **Visit the Homepage**: Navigate to the application
2. **Enter Your Feeling**: Type your current emotional state in the input field (e.g., "anxious", "grateful", "sad")
3. **Get Du'a**: Click the "Get Du'a" button or press Enter
4. **View Results**: Read the Quranic verse in Arabic, English, and Bengali
5. **Optional**: Create an account to save your history

### For Registered Users

1. **Register**: Click "Login" → "Sign Up" and create an account
   - Provide full name, email, and password
   - Password must be at least 8 characters with uppercase, lowercase, and numbers
2. **Login**: Sign in with your credentials
3. **Personalized Experience**:
   - See personalized greeting with your name
   - Access your complete Du'a history in the sidebar (desktop) or menu (mobile)
   - Click on any history item to view it again
4. **History Management**:
   - All your Du'a requests are automatically saved
   - View timestamp and emotion for each entry
   - Quick preview of verse translations

---

## 🔌 API Integration

The application communicates with a backend API for the following operations:

### Endpoints Used

#### Authentication

- `POST /users/create-user` - User registration
- `POST /users/login` - User login
- `GET /users/profile` - Fetch user profile (authenticated)

#### Du'a Operations

- `POST /dua/get-dua` - Get Du'a based on emotion
  ```json
  {
    "emotion": "happy"
  }
  ```
- `GET /dua/dua-history` - Fetch user's Du'a history (authenticated)

### Response Format

**Du'a Response:**

```json
{
  "success": true,
  "dua": {
    "surah_name": "Al-Baqarah",
    "ayah_number": 286,
    "arabic": "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    "translation": "Allah does not burden a soul beyond that it can bear",
    "bnTranslation": "আল্লাহ কাউকে তার সাধ্যের বাইরে দায়িত্ব দেন না",
    "short_explanation": "This verse provides comfort..."
  }
}
```

---

## 🔐 Authentication

### Authentication Flow

1. **Context Provider**: `AuthContext` wraps the entire application
2. **Token Storage**: JWT tokens stored in `localStorage`
3. **Axios Interceptor**: Automatically attaches Bearer token to all requests
4. **Auto-Login**: Checks for existing token on app load
5. **Protected Routes**: History features require authentication

### Security Features

- Password validation (minimum 8 characters, mixed case, numbers)
- Email format validation
- Secure token-based authentication
- Automatic token refresh on page reload
- Logout clears all user data and tokens

---

## 📸 Screenshots

### Home Page (Guest)

Beautiful landing page with emotion input and Du'a display.

### Home Page (Authenticated)

Personalized experience with history sidebar and user greeting.

### Login Page

Clean, modern login interface with validation.

### Register Page

Comprehensive registration form with password strength requirements.

### Du'a Display

Multi-language verse display with Arabic, English, and Bengali translations.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Use functional components with hooks
- Maintain consistent naming conventions
- Write meaningful commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Quran API**: For providing Quranic verses and translations
- **TailwindCSS**: For the amazing utility-first CSS framework
- **React Team**: For the incredible React library
- **Vite Team**: For the blazing-fast build tool

---

## 📞 Support

For support, questions, or feedback:

- Open an issue on GitHub
- Contact: [your-email@example.com]

---

## 🌟 Future Enhancements

- [ ] Add more language translations (Urdu, French, etc.)
- [ ] Implement Du'a bookmarking feature
- [ ] Add audio recitation of verses
- [ ] Social sharing capabilities
- [ ] Dark mode toggle
- [ ] Advanced search and filtering in history
- [ ] Daily Du'a notifications
- [ ] Offline mode with service workers

---

<div align="center">

**May Allah guide and bless you** ☪️

_"And it is He who created the heavens and earth in truth."_

Made with ❤️ for the Muslim community

</div>
