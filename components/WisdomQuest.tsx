import React, { useState, useEffect } from 'react';
import { generateQuizQuestion } from '../services/geminiService';
import { QuizQuestion } from '../types';

const WisdomQuest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  const categories = [
    "Adinkra Symbols and their deep philosophical meanings",
    "Swahili Proverbs (Methali) and their application in daily life",
    "Great African Kingdoms (Mali, Songhai, Great Zimbabwe, Ashanti)",
    "Traditional African Instruments and Music",
    "Pre-colonial African Innovation and Technology"
  ];

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      // Rotate or Randomize Category
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const question = await generateQuizQuestion(randomCategory);
      setCurrentQuestion(question);
    } catch (error) {
      console.error(error);
      // Fallback question
      setCurrentQuestion({
        question: "Which Adinkra symbol represents the importance of learning from the past?",
        options: ["Gye Nyame", "Sankofa", "Duafe", "Akoben"],
        correctIndex: 1,
        explanation: "Sankofa literally means 'Go back and fetch it', emphasizing that it is not wrong to go back for that which you have forgotten."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    
    setSelectedOption(index);
    const correct = index === currentQuestion.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 10 + (streak * 2));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      {/* Quiz Area */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-amber-900 drop-shadow-sm font-cinzel">Wisdom Quest</h2>
          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 rounded-full font-bold text-amber-800 border-amber-300">
              🔥 Streak: {streak}
            </div>
            <div className="bg-stone-900 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              Score: {score}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-2xl border-stone-200 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
          {loading ? (
            <div className="text-center animate-pulse">
              <div className="text-6xl mb-4">🗿</div>
              <p className="text-stone-800 font-cinzel text-xl">Consulting the Oracle...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <h3 className="text-2xl font-bold text-stone-900 mb-8 leading-relaxed drop-shadow-sm">
                {currentQuestion.question}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`p-4 rounded-xl text-left text-lg font-medium transition-all transform hover:scale-[1.01] shadow-sm ${
                      selectedOption === null 
                        ? 'bg-white/60 hover:bg-white/80 text-stone-800' 
                        : idx === currentQuestion.correctIndex
                          ? 'bg-green-500/80 text-white border-2 border-green-600'
                          : selectedOption === idx
                            ? 'bg-red-500/80 text-white border-2 border-red-600'
                            : 'opacity-50 bg-white/40'
                    }`}
                  >
                    <span className="inline-block w-8 font-bold opacity-50">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                ))}
              </div>

              {selectedOption !== null && (
                <div className="mt-8 p-6 bg-white/80 rounded-xl border border-white shadow-lg animate-fade-in backdrop-blur-md">
                  <p className={`font-bold mb-2 text-xl ${isCorrect ? 'text-green-700' : 'text-stone-700'}`}>
                    {isCorrect ? 'Correct! 🎉' : 'Lesson Learned 📚'}
                  </p>
                  <p className="text-stone-800 italic mb-4 leading-relaxed">{currentQuestion.explanation}</p>
                  <button
                    onClick={fetchQuestion}
                    className="bg-stone-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-stone-700 transition-all shadow-lg"
                  >
                    Next Challenge →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-red-700 font-bold bg-red-100/50 p-4 rounded-lg">
              Failed to load question.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar / Leaderboard */}
      <div className="w-full md:w-80">
        <div className="glass-panel p-6 rounded-xl shadow-xl sticky top-6">
          <h3 className="text-xl font-cinzel font-bold mb-4 border-b border-stone-400/30 pb-2 text-stone-900">
            Top Scholars
          </h3>
          <ul className="space-y-4">
            {[{ name: 'Nia', score: 450 }, { name: 'Kwesi', score: 320 }, { name: 'You', score: score }, { name: 'Amani', score: 180 }]
              .sort((a, b) => b.score - a.score)
              .map((entry, index) => (
              <li key={index} className={`flex justify-between items-center p-3 rounded-lg backdrop-blur-sm ${entry.name === 'You' ? 'bg-amber-600/20 border border-amber-600/50' : 'bg-white/30'}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-bold text-lg w-6 ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-stone-500' : index === 2 ? 'text-amber-700' : 'text-stone-400'}`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-stone-800">{entry.name}</span>
                </div>
                <span className="font-mono text-amber-900 font-bold">{entry.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WisdomQuest;
