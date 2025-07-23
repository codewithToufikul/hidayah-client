import React, { useState } from 'react';

const Home = () => {
  const [feeling, setFeeling] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for demonstration
  const duaDatabase = {
    sadness: {
      arabic: "وَبَشِّرِ الصَّابِرِينَ ۝ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
      translation: "And give good tidings to the patient, Who, when disaster strikes them, say, 'Indeed we belong to Allah, and indeed to Him we will return.'",
      surah: "Al-Baqarah (2:155-156)"
    },
    fear: {
      arabic: "فَإِذَا خِفْتَ عَلَيْهِ فَأَلْقِيهِ فِي الْيَمِّ وَلَا تَخَافِي وَلَا تَحْزَنِي ۖ إِنَّا رَادُّوهُ إِلَيْكِ وَجَاعِلُوهُ مِنَ الْمُرْسَلِينَ",
      translation: "And do not fear and do not grieve. Indeed, We will return him to you and will make him [one] of the messengers.",
      surah: "Al-Qasas (28:7)"
    },
    happiness: {
      arabic: "وَقُلِ الْحَمْدُ لِلَّهِ الَّذِي لَمْ يَتَّخِذْ وَلَدًا وَلَمْ يَكُن لَّهُ شَرِيكٌ فِي الْمُلْكِ وَلَمْ يَكُن لَّهُ وَلِيٌّ مِّنَ الذُّلِّ ۖ وَكَبِّرْهُ تَكْبِيرًا",
      translation: "And say, 'Praise to Allah, who has not taken a son and has had no partner in [His] dominion and has no [need of a] protector out of weakness; and glorify Him with [great] glorification.'",
      surah: "Al-Isra (17:111)"
    },
    gratitude: {
      arabic: "وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ",
      translation: "And [remember] when your Lord proclaimed, 'If you are grateful, I will certainly give you more. But if you are ungrateful, indeed, My punishment is severe.'",
      surah: "Ibrahim (14:7)"
    },
    anxiety: {
      arabic: "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translation: "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.",
      surah: "Ar-Ra'd (13:28)"
    }
  };

  const handleSubmit = async () => {
    if (!feeling.trim()) return;

    setIsLoading(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const normalizedFeeling = feeling.toLowerCase().trim();
    let selectedDua = null;

    // Find matching du'a based on keywords
    for (const [key, dua] of Object.entries(duaDatabase)) {
      if (normalizedFeeling.includes(key) || key.includes(normalizedFeeling)) {
        selectedDua = dua;
        break;
      }
    }

    // Default to gratitude if no match found
    if (!selectedDua) {
      selectedDua = duaDatabase.gratitude;
    }

    setResult(selectedDua);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Decorative Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            Quranic Du'a Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find peace and guidance through Allah's words. Share your feelings and receive a relevant Du'a or verse from the Holy Quran.
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Input Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="feeling" className="block text-lg font-semibold text-gray-700 mb-3">
                  How are you feeling today?
                </label>
                <input
                  id="feeling"
                  type="text"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  placeholder="e.g., sad, anxious, grateful, happy, fearful..."
                  className="w-full px-6 py-4 text-lg border-2 border-emerald-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 bg-white/70"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && feeling.trim() && !isLoading) {
                      handleSubmit();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !feeling.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Finding Du'a...
                  </div>
                ) : (
                  'Get Du\'a'
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result && !isLoading && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100 p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Du'a</h2>
                <p className="text-emerald-600 font-medium">{result.surah}</p>
              </div>

              <div className="space-y-8">
                {/* Arabic Text */}
                <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                  <p className="text-2xl md:text-3xl leading-relaxed text-gray-800 font-arabic" style={{fontFamily: 'Times New Roman, serif'}}>
                    {result.arabic}
                  </p>
                </div>

                {/* Translation */}
                <div className="text-center p-6 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Translation</h3>
                  <p className="text-lg leading-relaxed text-gray-600 italic">
                    "{result.translation}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-emerald-100">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium py-3 px-6 rounded-xl transition-colors duration-300"
                >
                  Search Again
                </button>
                <button
                  onClick={() => {
                    const text = `${result.arabic}\n\n"${result.translation}"\n\n- ${result.surah}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="flex-1 bg-teal-100 hover:bg-teal-200 text-teal-700 font-medium py-3 px-6 rounded-xl transition-colors duration-300"
                >
                  Copy Du'a
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p className="mb-2">May Allah guide and bless you</p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto"></div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;