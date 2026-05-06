import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Hooks/AuthContext";
import axiosInstance from "../../Hooks/axiosIntance";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { useRef } from "react";

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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    } catch (error) {
      console.error("Error fetching history:", error);
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

  const handleSubmit = async (isRetry = false) => {
    if (!feeling.trim()) return;
    setLoading(true);
    setError(null);
    if (!isRetry) {
      setDua(null);
      setSelectedHistoryItem(null);
    }

    try {
      const response = await axiosInstance.post("/dua/get-dua", {
        emotion: feeling,
      });

      if (response.data.success) {
        setDua(response.data.dua);
        // Refresh history after getting new dua
        if (user) {
          fetchHistory();
        }
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } catch (error) {
      console.log(error);
      setError("Error fetching dua. Please check your input or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  const handleHistoryClick = (historyItem) => {
    setSelectedHistoryItem(historyItem);
    setDua(null);
    setShowMobileHistory(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = () => {
    const text = `
✨ Guidance from Hidayah ✨
---------------------------
📖 Quranic Verse:
Surah ${currentDisplayDua.surah_name} (${currentDisplayDua.surah_number}:${currentDisplayDua.ayah_number})

Arabic:
${currentDisplayDua.arabic}

Translation:
"${currentDisplayDua.translation}"

${currentDisplayDua.masnoon_dua_arabic ? `🤲 Recommended Sunnah Dua:
${currentDisplayDua.masnoon_dua_arabic}
("${currentDisplayDua.masnoon_dua_english}")` : ''}

---------------------------
Find your peace at: https://hidayah-client.vercel.app
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
      link.download = `hidayah-dua-${currentDisplayDua.surah_name}.png`;
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

  const currentDisplayDua = selectedHistoryItem || dua;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-x-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='m0 60l60-60h-60v60z'/%3E%3Cpath d='m30 0l30 30v-30h-30z'/%3E%3Cpath d='m60 30l-30 30h30v-30z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Update Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileFormData.name}
                  onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none transition-all"
                  placeholder="e.g., Aya Abdulmajid"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {isUpdatingProfile ? "Updating..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop History Sidebar - Fixed Position */}
      {user && (
        <div className="hidden lg:block fixed left-0 top-0 w-80 h-screen overflow-scroll bg-white/90 backdrop-blur-sm border-r border-emerald-100 z-10 flex flex-col">
          <div className="p-6 border-b border-emerald-100 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Dua History
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#10b981 transparent'
          }}>
            {historyLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-sm">No history yet</p>
                <p className="text-gray-400 text-xs mt-1">Get your first dua to see history here</p>
              </div>
            ) : (
              <div className="p-4 space-y-2 pb-6">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${selectedHistoryItem === item
                      ? 'bg-emerald-50 border-emerald-200 shadow-md'
                      : 'bg-white/80 border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-200'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full truncate max-w-32">
                        {item.emotion}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Surah {item.surah_name}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {item.translation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile History Overlay */}
      {user && showMobileHistory && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileHistory(false)}
          ></div>
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dua History
              </h2>
              <button
                onClick={() => setShowMobileHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {historyLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="p-6 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No history yet</p>
                  <p className="text-gray-400 text-xs mt-1">Get your first dua to see history here</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${selectedHistoryItem === item
                        ? 'bg-emerald-50 border-emerald-200 shadow-md'
                        : 'bg-white/80 border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full truncate max-w-32">
                          {item.emotion}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        Surah {item.surah_name}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.translation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative z-10 ${user ? 'lg:ml-80' : ''}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Enhanced Navigation */}
          <nav className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div className="flex items-center order-1 sm:order-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl sm:rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-lg">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-800 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Hidayah
              </span>
            </div>

            <div className="flex items-center w-full sm:w-auto order-2 sm:order-none gap-2">
              {user && (
                <button
                  onClick={() => setShowMobileHistory(true)}
                  className="lg:hidden p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}

              {user ? (
                <div className="flex items-center w-full sm:w-auto gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center justify-center w-full sm:w-auto bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-emerald-100 hover:border-emerald-300 transition-all group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center min-w-0 flex-1">
                      <span className="text-xs text-gray-500 sm:hidden leading-none">السلام عليكم</span>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        <span className="hidden sm:inline">Assalamu Alaikum, </span>
                        {user.name}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-shrink-0 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md text-sm"
                  >
                    <span className="hidden sm:inline">Logout</span>
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <Link
                  to={"/login"}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* Enhanced Header */}
          <header className="text-center mb-8 sm:mb-12 px-2">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl sm:rounded-full mb-4 sm:mb-6 shadow-xl transform hover:scale-105 transition-transform duration-300">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
              Hidayah
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-medium text-emerald-700 mb-2 sm:mb-3">
              Personalized Quranic Guidance
            </p>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              {user
                ? `Find peace through Allah's words, ${user.name}. Share your heart and receive guidance.`
                : "Find peace and guidance through Allah's words. Share your feelings and receive a relevant Du'a or verse from the Holy Quran."}
            </p>
          </header>

          {/* Enhanced Main Content */}
          <div className="max-w-4xl mx-auto px-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-emerald-100/50 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 hover:shadow-2xl transition-all duration-500">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="feeling" className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                    How are you feeling today?
                  </label>
                  <div className="relative">
                    <input
                      id="feeling"
                      type="text"
                      value={feeling}
                      onChange={(e) => setFeeling(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="e.g., grateful, anxious, happy, tired, seeking peace..."
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-emerald-200 rounded-xl sm:rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 bg-white/80 placeholder-gray-400 hover:border-emerald-300"
                      disabled={loading}
                    />
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {["Happy", "Anxious", "Sad", "Scared", "Tired", "Angry", "Confused", "Guilty", "Lonely"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFeeling(f)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${feeling.toLowerCase() === f.toLowerCase()
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100"
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={loading || !feeling.trim()}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Finding Aya...</>
                        ) : (
                          "Get Du'a"
                        )}
                      </span>
                    </button>

                    {dua && !loading && (
                      <button
                        onClick={() => handleSubmit(true)}
                        className="p-3 sm:p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl sm:rounded-2xl border border-emerald-200 transition-all hover:rotate-180 duration-500"
                        title="See different result"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                    </div>
                  )}
                </div>

                  {currentDisplayDua && (
                    <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-br from-white to-emerald-50/30 rounded-xl sm:rounded-2xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01]">
                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-700">
                          Surah {currentDisplayDua.surah_name}
                        </h2>
                        <span className="text-sm sm:text-base text-emerald-600 font-medium bg-emerald-100 px-2 py-1 rounded-full">
                          Ayah {currentDisplayDua.ayah_number}
                        </span>
                        {currentDisplayDua.detected_category && (
                          <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full uppercase tracking-tighter">
                            Detected: {currentDisplayDua.detected_category}
                          </span>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-white/80 rounded-xl border-r-4 border-emerald-400 shadow-sm">
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-right leading-loose font-arabic" dir="rtl">
                            {currentDisplayDua.arabic}
                          </p>
                        </div>

                        <div className="p-4 bg-teal-50/50 rounded-xl border-l-4 border-teal-400">
                          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1 block">Translation</span>
                          <p className="text-base sm:text-lg text-gray-700 italic leading-relaxed">
                            "{currentDisplayDua.translation}"
                          </p>
                        </div>

                        {currentDisplayDua.short_explanation && (
                          <div className="p-4 bg-emerald-50/50 rounded-xl border-l-4 border-emerald-400">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 block">Scholarly Insight</span>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                              {currentDisplayDua.short_explanation}
                            </p>
                          </div>
                        )}

                        {currentDisplayDua.masnoon_dua_arabic && (
                          <div className="p-5 bg-gradient-to-br from-emerald-700 to-teal-800 rounded-2xl text-white shadow-xl">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="bg-emerald-500/30 p-1.5 rounded-lg">
                                <svg className="w-5 h-5 text-emerald-100" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Recommended Sunnah Dua</span>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold mb-4 text-right leading-loose font-arabic" dir="rtl">
                              {currentDisplayDua.masnoon_dua_arabic}
                            </p>
                            <div className="pt-4 border-t border-white/20">
                              <p className="text-sm sm:text-base italic text-emerald-50 leading-relaxed">
                                "{currentDisplayDua.masnoon_dua_english}"
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 mt-8">
                          <button
                            onClick={copyToClipboard}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy Text
                          </button>
                          <button
                            onClick={generateImage}
                            disabled={isGeneratingImage}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-2xl hover:from-emerald-700 hover:to-teal-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
                          >
                            {isGeneratingImage ? (
                              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            )}
                            Share as Image
                          </button>
                        </div>

                        {/* Hidden Card for Image Generation */}
                        <div className="fixed -left-[9999px] top-0">
                          <div 
                            ref={cardRef}
                            className="w-[600px] p-12 relative overflow-hidden"
                            style={{
                              backgroundColor: '#ffffff',
                              backgroundImage: 'url("/card-bg.png")',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              minHeight: '800px'
                            }}
                          >
                            {/* Overlay for readability */}
                            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(1px)' }}></div>
                            
                            <div className="relative z-10 text-center">
                              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-8 shadow-2xl" style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}>
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </div>
                              
                              <h3 className="text-4xl font-black mb-2 uppercase tracking-widest" style={{ color: '#064e3b', fontFamily: 'Outfit, sans-serif' }}>Hidayah</h3>
                              <div className="h-1.5 w-20 mx-auto mb-10 rounded-full" style={{ background: 'linear-gradient(90deg, #34d399 0%, #14b8a6 100%)' }}></div>
                              
                              <div className="mb-12">
                                <p className="text-5xl font-bold leading-loose mb-10" style={{ color: '#111827', fontFamily: 'Amiri, serif' }} dir="rtl">
                                  {currentDisplayDua.arabic}
                                </p>
                                <div className="inline-block px-6 py-2 rounded-full mb-8" style={{ backgroundColor: 'rgba(209, 250, 229, 0.6)' }}>
                                  <p className="text-2xl font-bold" style={{ color: '#065f46' }}>
                                    Surah {currentDisplayDua.surah_name} ({currentDisplayDua.surah_number}:{currentDisplayDua.ayah_number})
                                  </p>
                                </div>
                                <div className="max-w-xl mx-auto">
                                  <p className="text-2xl italic font-medium leading-relaxed" style={{ color: '#374151' }}>
                                    "{currentDisplayDua.translation}"
                                  </p>
                                </div>
                              </div>

                              {currentDisplayDua.masnoon_dua_arabic && (
                                <div className="p-10 rounded-[2.5rem] shadow-2xl border border-white/20 mb-12 text-center" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #134e4a 100%)', color: '#ffffff' }}>
                                  <div className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: '#a7f3d0' }}>Recommended Sunnah Dua</div>
                                  <p className="text-4xl font-bold mb-6 leading-loose" style={{ fontFamily: 'Amiri, serif' }} dir="rtl">
                                    {currentDisplayDua.masnoon_dua_arabic}
                                  </p>
                                  <p className="text-lg italic font-medium" style={{ color: '#ecfdf5' }}>
                                    "{currentDisplayDua.masnoon_dua_english}"
                                  </p>
                                </div>
                              )}
                              
                              <div className="pt-10 border-t flex items-center justify-between" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                                <div className="text-left">
                                  <p className="text-xl font-bold" style={{ color: '#064e3b' }}>Guidance from Quran</p>
                                  <p className="text-sm" style={{ color: '#6b7280' }}>hidayah-client.vercel.app</p>
                                </div>
                                <div style={{ color: '#6ee7b7' }}>
                                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="text-center pt-6 border-t border-emerald-100">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                        <p className="text-gray-600 mb-4 font-medium">Save your journey and see your history.</p>
                        <Link to={"/login"} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
                          Login for Personalization
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <footer className="text-center mt-12 sm:mt-16 px-4">
              <div className="max-w-md mx-auto bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/30">
                <p className="text-gray-600 mb-2 font-medium">May Allah grant you Hidayah</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-0.5 bg-emerald-200"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="w-8 h-0.5 bg-emerald-200"></div>
                </div>
                <p className="text-xs text-gray-400 italic">"Verily, with hardship comes ease." (94:6)</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
      );
    };

      export default Home;