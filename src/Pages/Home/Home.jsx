import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Hooks/AuthContext";
import axiosInstance from "../../Hooks/axiosIntance";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import CameraEmotionScanner from "../../Components/CameraEmotionScanner";
import Logo from "../../Components/Logo";
import { getFallbackDuaForEmotion } from "../../data/curatedDuasClient";

const PRESET_EMOTIONS = [
  { en: "Sad", ar: "حزين", value: "Sad", icon: "🌧️" },
  { en: "Happy", ar: "سعيد", value: "Happy", icon: "☀️" },
  { en: "Anxious", ar: "قلق", value: "Anxious", icon: "🌊" },
  { en: "Tired", ar: "متعب", value: "Tired", icon: "🌙" },
  { en: "Scared", ar: "خائف", value: "Scared", icon: "🛡️" },
  { en: "Angry", ar: "غاضب", value: "Angry", icon: "🕊️" },
  { en: "Confused", ar: "حائر", value: "Confused", icon: "🧭" },
  { en: "Guilty", ar: "مذنب", value: "Guilty", icon: "🤲" },
  { en: "Lonely", ar: "وحيد", value: "Lonely", icon: "🤝" },
];

const Home = () => {
  const [feeling, setFeeling] = useState("");
  const [dua, setDua] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: "", email: "" });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const cardRef = useRef(null);
  const resultRef = useRef(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 🎙️ Multimodal Voice & Camera States
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState("ar-SA"); // Default to Arabic as requested by client
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileFormData({ name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const success = await updateProfile(profileFormData.name, profileFormData.email);
    if (success) setShowProfileModal(false);
    setIsUpdatingProfile(false);
  };

  const handleLogout = () => {
    logout();
    setFeeling("");
    setDua(null);
    setHistory([]);
    setSelectedHistoryItem(null);
  };

  // Fetch dua history
  const fetchHistory = async () => {
    if (!user) return;

    setHistoryLoading(true);
    try {
      const response = await axiosInstance.get("/dua/dua-history");
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch history when user logs in
  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setHistory([]);
      setSelectedHistoryItem(null);
    }
  }, [user]);

  const handleSubmit = async (isRetry = false, overrideEmotion = null) => {
    const emotionToSubmit = (overrideEmotion !== null ? overrideEmotion : feeling).trim();
    if (!emotionToSubmit) return;
    setLoading(true);
    setError(null);
    if (!isRetry) {
      setDua(null);
      setSelectedHistoryItem(null);
    }

    try {
      const response = await axiosInstance.post("/dua/get-dua", {
        emotion: emotionToSubmit,
      });

      if (response.data.success && response.data.dua) {
        setDua(response.data.dua);
        // Refresh history after getting new dua
        if (user) {
          fetchHistory();
        }
      } else {
        // Fallback to scholar-verified offline vault
        const fallbackRecord = getFallbackDuaForEmotion(emotionToSubmit);
        setDua(fallbackRecord);
      }
    } catch (err) {
      console.warn("Backend unavailable or returned error, activating Scholar-verified Fallback Vault:", err);
      // Immediately fallback to scholar-verified Quranic guidance
      const fallbackRecord = getFallbackDuaForEmotion(emotionToSubmit);
      setDua(fallbackRecord);
      setError(null);
      toast.success("Quranic guidance loaded successfully.");
    } finally {
      setLoading(false);
      // Smooth scroll to guidance card on mobile
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // 🎙️ Speech Recognition (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        toast.success(
          speechLang === "ar-SA"
            ? "جاري الاستماع... تحدث الآن باللغة العربية"
            : "Listening... Speak your feelings now"
        );
      };

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setFeeling(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (event.error !== "no-speech") {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      toast.error("Could not activate microphone.");
    }
  };

  // 📷 Handle emotion detected from camera scan
  const handleCameraEmotion = (emotionEn, emotionAr) => {
    toast.dismiss();
    setFeeling(emotionEn);
    toast.success(`Facial Emotion captured: ${emotionEn} — ${emotionAr}`);
    handleSubmit(false, emotionEn);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  const handleHistoryClick = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setDua(null);
    setShowMobileHistory(false);
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentDisplayDua = selectedHistoryItem || dua;

  const copyToClipboard = () => {
    if (!currentDisplayDua) return;
    const text = `
✨ Guidance from Hidayah(هداية) ✨
-------------------------------------
📖 Quranic Verse:
Surah ${currentDisplayDua.surah_name} (${currentDisplayDua.surah_number}:${currentDisplayDua.ayah_number})

Arabic:
${currentDisplayDua.arabic}

Translation:
"${currentDisplayDua.translation}"

${currentDisplayDua.short_explanation ? `📚 Scholarly Insight:
${currentDisplayDua.short_explanation}
(Source: ${currentDisplayDua.source || "Tafsir Scholars"})` : ""}

${currentDisplayDua.masnoon_dua_arabic ? `🤲 Recommended Sunnah Dua:
${currentDisplayDua.masnoon_dua_arabic}
("${currentDisplayDua.masnoon_dua_english}")` : ""}

  -------------------------------------
    Personalized Quranic Guidance: Hidayah AI
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Dua copied to clipboard!");
  };

  const generateImage = async () => {
    if (!cardRef.current) return;

    setIsGeneratingImage(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = `hidayah - dua - ${currentDisplayDua?.surah_name || "verse"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Image card downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen spiritual-bg relative text-slate-800 pb-24 lg:pb-12 overflow-x-hidden">
      {/* Subtle Islamic Lattice Background Overlay */}
      <div className="fixed inset-0 islamic-lattice pointer-events-none"></div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
                  <p className="text-xs text-gray-500">Manage account information</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileFormData.name}
                  onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium"
                  placeholder="e.g., Brother Ahmad"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold py-3 px-4 rounded-2xl shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50 text-sm"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop History Sidebar (Fixed Floating Panel) */}
      {user && (
        <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-80 bg-white/85 backdrop-blur-xl border border-emerald-900/10 rounded-3xl shadow-xl z-20 flex-col overflow-hidden">
          <div className="p-5 border-b border-emerald-900/5 bg-gradient-to-b from-emerald-50/50 to-transparent flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-sm">
                📜
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm tracking-tight">Saved Reflections</h2>
                <p className="text-[11px] text-gray-500 font-medium">Your Quranic Journey</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              {history.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
            {historyLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-xs">Loading reflections...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-2xl">
                  🤲
                </div>
                <p className="text-gray-700 font-semibold text-xs mb-1">No reflections yet</p>
                <p className="text-gray-400 text-[11px]">Select an emotion to receive your first Du'a</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className={`p - 3.5 rounded - 2xl cursor - pointer transition - all duration - 200 border text - left ${selectedHistoryItem === item
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-700/20 scale-[1.02]"
                      : "bg-white/80 border-gray-100 hover:bg-emerald-50/60 hover:border-emerald-200/80 shadow-sm"
                    } `}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text - [11px] font - bold px - 2 py - 0.5 rounded - lg truncate max - w - [130px] ${selectedHistoryItem === item
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                        } `}
                    >
                      {item.emotion}
                    </span>
                    <span
                      className={`text - [10px] font - medium ${selectedHistoryItem === item ? "text-emerald-100" : "text-gray-400"
                        } `}
                    >
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text - xs font - bold truncate ${selectedHistoryItem === item ? "text-white" : "text-gray-800"
                      } `}
                  >
                    Surah {item.surah_name} ({item.surah_number}:{item.ayah_number})
                  </p>
                  <p
                    className={`text - [11px] line - clamp - 2 mt - 1 leading - relaxed ${selectedHistoryItem === item ? "text-emerald-50/90" : "text-gray-500"
                      } `}
                  >
                    "{item.translation}"
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {/* Mobile History Drawer (Slide Up Sheet) */}
      {user && showMobileHistory && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileHistory(false)}
          ></div>
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] h-[75vh] shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <h2 className="text-base font-bold text-gray-900">Your Reflection History</h2>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              </div>
              <button
                onClick={() => setShowMobileHistory(false)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {historyLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-500 text-xs">Loading reflections...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No reflection history yet.</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50/70 border border-gray-100 transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        {item.emotion}
                      </span>
                      <span className="text-[11px] text-gray-400">{formatDate(item.createdAt)}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800">
                      Surah {item.surah_name} ({item.surah_number}:{item.ayah_number})
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                      "{item.translation}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main App Content Viewport */}
      <div className={`relative z - 10 transition - all ${user ? "lg:ml-96" : ""} `}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {/* Top Floating Glass Navigation Bar */}
          <nav className="flex items-center justify-between p-3 sm:p-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-emerald-900/10 shadow-lg shadow-emerald-900/5 mb-6 sm:mb-10">
            {/* Logo */}
            <Link to="/" className="group">
              <Logo size="default" />
            </Link>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher Pill (Bilingual Audio) */}
              <button
                type="button"
                onClick={() => {
                  const newLang = speechLang === "ar-SA" ? "en-US" : "ar-SA";
                  setSpeechLang(newLang);
                  toast.success(newLang === "ar-SA" ? "صوت: اللغة العربية 🇸🇦" : "Voice: English 🇬🇧");
                }}
                className="px-3 py-1.5 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200/60 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Toggle Voice Recognition Language"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{speechLang === "ar-SA" ? "صوت: العربية 🇸🇦" : "Voice: EN 🇬🇧"}</span>
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1 bg-gray-50 hover:bg-emerald-50 border border-gray-200/80 hover:border-emerald-200 rounded-full transition-all text-xs font-bold text-gray-700 shadow-sm active:scale-95"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 transition-all text-xs font-bold active:scale-95"
                    title="Sign Out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-800/20 transition-all transform active:scale-95 flex items-center gap-1.5"
                >
                  <span>Sign In</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              )}
            </div>
          </nav>

          {/* Spiritual Hero Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/5 border border-emerald-700/20 text-emerald-800 text-xs font-semibold mb-3.5 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>AI Emotional Intelligence · هدية للقلوب</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
              How is your heart feeling today?
            </h1>
            <p className="font-arabic text-amber-700/90 text-lg sm:text-2xl font-bold mb-2.5" dir="rtl">
              كَيْفَ تَشْعُرُ رُوحُكَ الْيَوْمَ؟
            </p>
            <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Express through voice, camera face scan, or text to receive comforting verses from the Holy Quran and authentic Prophetic supplications.
            </p>
          </div>

          {/* Unified Multimodal AI Search & Command Dock */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-xl shadow-emerald-950/5 border border-emerald-900/10 mb-6 sm:mb-8 transition-all">
            {/* Input Bar with integrated Voice & Camera buttons */}
            <div className="relative mb-4">
              <input
                type="text"
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  speechLang === "ar-SA"
                    ? "صف مشاعرك هنا... (مثال: حزين، قلق، متعب، ممتن)"
                    : "Describe what you're experiencing... (e.g., Sad, Anxious, Burnout, Grateful)"
                }
                className="w-full pl-4 pr-24 sm:pr-28 py-4 sm:py-4.5 bg-slate-50/80 border border-slate-200 rounded-2xl focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm sm:text-base text-slate-800 font-medium transition-all placeholder:text-slate-400 shadow-inner"
              />

              {/* Action Buttons inside Input */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {feeling && (
                  <button
                    type="button"
                    onClick={() => setFeeling("")}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors"
                    title="Clear"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* 🎙️ Voice Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p - 2.5 sm: p - 3 rounded - xl transition - all flex items - center justify - center ${isListening
                      ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 scale-105"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    } `}
                  title={isListening ? "Stop listening" : "Record your feelings"}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* 📷 AI Camera Button */}
                <button
                  type="button"
                  onClick={() => setShowCameraScanner(true)}
                  className="p-2.5 sm:p-3 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-all flex items-center justify-center shadow-sm"
                  title="Scan Face Emotion via Camera"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Active Speech Animation Waveform Banner */}
            {isListening && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                  <span className="text-xs sm:text-sm font-bold text-red-700">
                    {speechLang === "ar-SA"
                      ? "جاري الاستماع لصوتك باللغة العربية... تحدث الآن"
                      : "Listening in English... Speak your heart now"}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <div className="w-1 h-3 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                  <div className="w-1 h-4 bg-red-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                  <div className="w-1 h-2 bg-red-300 rounded-full animate-bounce [animation-delay:0.45s]"></div>
                </div>
              </div>
            )}

            {/* Bilingual Emotion Preset Badges (Horizontally Scrollable App Carousel) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Emotion State · اختر حالتك
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  9 Verified Categories
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {PRESET_EMOTIONS.map((f) => {
                  const isSelected = feeling.toLowerCase() === f.value.toLowerCase();
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => {
                        setFeeling(f.value);
                        handleSubmit(false, f.value);
                      }}
                      className={`px - 3.5 py - 2 rounded - 2xl text - xs sm: text - sm font - semibold transition - all duration - 200 flex - shrink - 0 flex items - center gap - 2 border select - none ${isSelected
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-800/25 scale-[1.03]"
                          : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900"
                        } `}
                    >
                      <span className="text-sm">{f.icon}</span>
                      <span>{f.en}</span>
                      <span className="opacity-30">·</span>
                      <span className="font-arabic font-bold text-xs sm:text-sm opacity-90">{f.ar}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading || !feeling.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 hover:from-emerald-800 hover:to-teal-950 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3.5 sm:py-4 px-6 rounded-2xl text-sm sm:text-base transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-900/30 transform active:scale-[0.98] disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Retrieving Quranic Reflection...</span>
                  </>
                ) : (
                  <>
                    <span>Seek Quranic Guidance</span>
                    <span className="font-arabic font-bold text-xs sm:text-sm text-emerald-200">جلب التوجيه</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              {dua && !loading && (
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="p-3.5 sm:p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 transition-all hover:rotate-180 duration-500 shadow-sm"
                  title="See another relevant verse"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 font-semibold text-xs sm:text-sm">{error}</p>
              </div>
            )}
          </div >

          {/* Quranic Guidance Output Showcase Card */}
          {currentDisplayDua && (
            <div
              ref={resultRef}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/10 border border-emerald-900/10 transition-all duration-500 mb-12 animate-in fade-in zoom-in-95"
            >
              {/* Illuminated Bismillah Calligraphy Ribbon */}
              <div className="text-center pb-4 mb-5 border-b border-emerald-900/10">
                <p className="font-arabic text-amber-600/90 text-xl sm:text-2xl font-bold tracking-widest leading-loose" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                    Surah {currentDisplayDua.surah_name} {currentDisplayDua.surah_name_arabic ? `· ${currentDisplayDua.surah_name_arabic}` : ""}
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Ayah {currentDisplayDua.ayah_number}
                  </span>
                  {currentDisplayDua.detected_category && (
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                      Emotion: {currentDisplayDua.detected_category}
                    </span>
                  )}
                </div>
              </div>

              {/* Holy Quran Verse Display */}
              <div className="space-y-5">
                <div className="p-5 sm:p-7 bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/20 rounded-2xl border border-emerald-100 shadow-sm">
                  <p
                    className="font-arabic text-2xl sm:text-3xl lg:text-4xl text-emerald-950 font-bold text-right leading-[2.2] sm:leading-[2.4]"
                    dir="rtl"
                  >
                    {currentDisplayDua.arabic}
                    <span className="text-amber-600 mr-2 text-xl font-normal"> ۝</span>
                  </p>
                </div>

                {/* English Translation */}
                <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border-l-4 border-emerald-600 shadow-sm">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1.5">
                    English Translation · المعنى
                  </span>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-800 font-medium italic leading-relaxed">
                    "{currentDisplayDua.translation}"
                  </p>
                </div>

                {/* Scholarly Tafsir Insight */}
                {currentDisplayDua.short_explanation && (
                  <div className="p-4 sm:p-5 bg-amber-50/50 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-widest">
                        Tafsir & Spiritual Reflection · الحكمة
                      </span>
                      {currentDisplayDua.source && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                          {currentDisplayDua.source}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {currentDisplayDua.short_explanation}
                    </p>
                  </div>
                )}

                {/* Recommended Sunnah Dua */}
                {currentDisplayDua.masnoon_dua_arabic && (
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 rounded-3xl text-white shadow-xl shadow-emerald-950/20 border border-emerald-600/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-sm">
                        🤲
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                        Recommended Sunnah Dua · دعاء مأثور
                      </span>
                    </div>

                    <p
                      className="font-arabic text-xl sm:text-2xl font-bold mb-3 text-right leading-loose text-amber-100"
                      dir="rtl"
                    >
                      {currentDisplayDua.masnoon_dua_arabic}
                    </p>

                    {currentDisplayDua.masnoon_dua_transliteration && (
                      <p className="text-xs sm:text-sm text-emerald-200/90 font-mono italic mb-2 leading-relaxed">
                        {currentDisplayDua.masnoon_dua_transliteration}
                      </p>
                    )}

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
                        "{currentDisplayDua.masnoon_dua_english}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Interactive Action Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={generateImage}
                    disabled={isGeneratingImage}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingImage ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>Save as Image</span>
                  </button>
                </div>
              </div>

              {/* Hidden Canvas Template for High-Resolution Export */}
              <div className="fixed -left-[9999px] top-0">
                <div
                  ref={cardRef}
                  className="w-[600px] p-10 bg-white border-8 border-emerald-900 text-slate-900 relative"
                  style={{ minHeight: "800px" }}
                >
                  <div className="text-center mb-6">
                    <p className="font-arabic text-amber-700 text-2xl font-bold mb-2" dir="rtl">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <h3 className="font-outfit text-3xl font-black text-emerald-900 tracking-wider">
                      HIDAYAH · هِـدَايَة
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
                      Personalized Quranic Guidance
                    </p>
                  </div>

                  <div className="p-6 bg-emerald-50/80 rounded-2xl border border-emerald-200 mb-6">
                    <p className="font-arabic text-2xl text-emerald-950 font-bold text-right leading-loose mb-3" dir="rtl">
                      {currentDisplayDua.arabic}
                    </p>
                    <p className="text-sm italic text-slate-800">
                      "{currentDisplayDua.translation}"
                    </p>
                    <p className="text-xs font-bold text-emerald-800 mt-2">
                      Surah {currentDisplayDua.surah_name} ({currentDisplayDua.surah_number}:{currentDisplayDua.ayah_number})
                    </p>
                  </div>

                  {currentDisplayDua.masnoon_dua_arabic && (
                    <div className="p-6 bg-emerald-900 text-white rounded-2xl mb-6">
                      <p className="text-xs uppercase font-bold text-amber-300 mb-2">Sunnah Masnoon Dua</p>
                      <p className="font-arabic text-xl font-bold text-right mb-2 leading-loose" dir="rtl">
                        {currentDisplayDua.masnoon_dua_arabic}
                      </p>
                      <p className="text-xs text-emerald-100 italic">
                        "{currentDisplayDua.masnoon_dua_english}"
                      </p>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-emerald-100 text-[11px] text-gray-500 font-semibold">
                    Generated via Hidayah AI Emotional Intelligence
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 📱 Mobile App Bottom Navigation Dock (PWA / Mobile Native Feeling) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-emerald-900/10 px-4 py-2 flex items-center justify-around pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center gap-1 p-1.5 text-emerald-800 active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* Tab 2: AI Face Scanner (Prominent Center Pill) */}
        <button
          type="button"
          onClick={() => setShowCameraScanner(true)}
          className="flex flex-col items-center gap-1 p-1.5 text-teal-800 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 border-2 border-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-emerald-800">Face AI</span>
        </button>

        {/* Tab 3: Voice Input */}
        <button
          type="button"
          onClick={toggleListening}
          className={`flex flex-col items-center gap-1 p-1.5 transition-transform active:scale-95 ${isListening ? "text-red-600 font-extrabold animate-pulse" : "text-emerald-800"
            }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-[10px] font-bold">{isListening ? "Listening" : "Voice"}</span>
        </button>

        {/* Tab 4: Reflection History */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              setShowMobileHistory(true);
            } else {
              toast("Sign in to view your saved reflection history");
            }
          }}
          className="flex flex-col items-center gap-1 p-1.5 text-emerald-800 active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {user && history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">History</span>
        </button>
      </nav>

      {/* Camera Emotion Scanner Modal */}
      <CameraEmotionScanner
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onEmotionDetected={handleCameraEmotion}
      />
    </div>
  );
};

export default Home;
