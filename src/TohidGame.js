import React, { useState } from 'react';
// IMPORT THE DATA HERE (Ensure questionsData.js is in the same folder)
import { fallbackQuestions } from './questionsData'; 

const TohidGame = () => {
  const [gameState, setGameState] = useState('setup'); // setup, loading, playing, results
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const availableCategories = [
    { name: 'Science', icon: '🔬' },
    { name: 'History', icon: '📚' },
    { name: 'Geography', icon: '🌍' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Movies', icon: '🎬' },
    { name: 'Music', icon: '🎵' },
    { name: 'Literature', icon: '📖' },
    { name: 'Art', icon: '🎨' },
    { name: 'Technology', icon: '💻' },
    { name: 'Food', icon: '🍕' },
    { name: 'Animals', icon: '🦁' },
    { name: 'Space', icon: '🚀' }
  ];

  const toggleCategory = (category) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // --- HYBRID GENERATOR START ---
  const generateQuestions = async () => {
    if (categories.length === 0) {
      alert('Please select at least one category!');
      return;
    }

    setGameState('loading'); // Show loading spinner

    try {
      // 1. API Category Mapping
      const categoryMapping = {
        'Science': 17, 'History': 23, 'Geography': 22, 'Sports': 21,
        'Movies': 11, 'Music': 12, 'Literature': 10, 'Art': 25,
        'Technology': 18, 'Animals': 27, 'Space': 17 
      };

      // Select random category from user choice
      const selectedCategoryName = categories[Math.floor(Math.random() * categories.length)];
      const apiCategoryId = categoryMapping[selectedCategoryName];

      // CRITICAL CHECK: If category not in API (like Food), go straight to Local
      if (!apiCategoryId) {
        console.log(`${selectedCategoryName} missing in API, switching to Local DB...`);
        generateLocalQuestions(); 
        return;
      }

      const difficultyMap = { easy: 'easy', medium: 'medium', hard: 'hard' };
      
      // 2. API Call with 4 Second Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(
        `https://opentdb.com/api.php?amount=${numQuestions}&category=${apiCategoryId}&difficulty=${difficultyMap[difficulty]}&type=multiple&encode=url3986`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('API Request Failed');

      const data = await response.json();
      
      // Handle empty API response
      if (data.response_code !== 0 || !data.results || data.results.length === 0) {
        throw new Error('No API results');
      }

      // 3. Format API Data
      const convertedQuestions = data.results.map(item => {
        const question = decodeURIComponent(item.question);
        const correctAnswer = decodeURIComponent(item.correct_answer);
        const incorrectAnswers = item.incorrect_answers.map(ans => decodeURIComponent(ans));
        
        // Shuffle API Options
        const allOptions = [correctAnswer, ...incorrectAnswers];
        const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
        
        return {
          question: question,
          options: shuffledOptions,
          correctAnswer: shuffledOptions.indexOf(correctAnswer),
          category: selectedCategoryName
        };
      });

      setQuestions(convertedQuestions);
      startGame();
      
    } catch (error) {
      console.log('API Error or Timeout, using Local Backup...', error);
      generateLocalQuestions();
    }
  };

  const generateLocalQuestions = () => {
    console.log("Using Local Database...");
    let pool = [];
    
    // 1. Collect questions from selected categories
    categories.forEach(cat => {
      if (fallbackQuestions[cat]) {
        pool = [...pool, ...fallbackQuestions[cat]];
      }
    });

    // Fallback if somehow pool is empty
    if (pool.length === 0) {
      pool = Object.values(fallbackQuestions).flat();
    }

    // 2. Shuffle and Select Questions
    const shuffledPool = pool.sort(() => 0.5 - Math.random());
    const selectedRawQuestions = shuffledPool.slice(0, numQuestions);

    // 3. Shuffle Options for Local Data (Crucial step)
    const finalQuestions = selectedRawQuestions.map(q => {
      const originalCorrectAnswerText = q.options[q.correctAnswer];
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      
      return {
        ...q,
        options: shuffledOptions,
        correctAnswer: shuffledOptions.indexOf(originalCorrectAnswerText)
      };
    });

    setQuestions(finalQuestions);
    startGame();
  };
  // --- HYBRID GENERATOR END ---

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  const selectAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      alert('Please select an answer!');
      return;
    }

    if (!showAnswer) {
      setShowAnswer(true);
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, {
      questionIndex: currentQuestion,
      selectedAnswer,
      isCorrect
    }];
    
    setAnswers(newAnswers);
    if (isCorrect) setScore(score + 1);
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setQuestions([]);
    setShowAnswer(false);
  };

  // --- RENDER VIEWS ---

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="relative z-10 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
                TohidAI
              </h1>
              <p className="text-xl text-slate-300">Advanced AI Knowledge Challenge</p>
            </div>

            {/* Main Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-10">
              
              {/* Categories */}
              <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-cyan-400">📝</span> Select Categories
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {availableCategories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => toggleCategory(cat.name)}
                      className={`p-4 rounded-2xl transition-all duration-300 border-2 hover:scale-105 flex flex-col items-center gap-2 ${
                        categories.includes(cat.name)
                          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="font-semibold">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* Difficulty */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-orange-400">🎯</span> Difficulty
                  </h2>
                  <div className="space-y-3">
                    {['easy', 'medium', 'hard'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`w-full p-4 rounded-xl font-bold capitalize text-left border-2 transition-all ${
                          difficulty === lvl
                            ? 'border-orange-400 bg-orange-500/10 text-orange-400'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count */}
                <div>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-purple-400">📊</span> Questions
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[5, 10, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setNumQuestions(num)}
                        className={`p-4 rounded-xl font-bold text-xl border-2 transition-all ${
                          numQuestions === num
                            ? 'border-purple-400 bg-purple-500/10 text-purple-400'
                            : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={generateQuestions}
                disabled={categories.length === 0}
                className="w-full py-6 rounded-2xl font-black text-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-500/30"
              >
                Start Challenge 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-24 h-24 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">Preparing Quiz...</h2>
        <p className="text-slate-400">Checking API & Loading Local Database</p>
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <span className="px-4 py-2 rounded-lg bg-white/10 font-bold text-cyan-400">
              Q{currentQuestion + 1}/{questions.length}
            </span>
            <span className="px-4 py-2 rounded-lg bg-white/10 font-bold text-green-400">
              Score: {score}
            </span>
          </div>

          {/* Progress */}
          <div className="h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="flex gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold">
                {question.category}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-snug">
              {question.question}
            </h2>

            <div className="space-y-4">
              {question.options.map((opt, idx) => {
                let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/50";
                
                if (showAnswer) {
                  if (idx === question.correctAnswer) {
                    btnStyle = "bg-green-500/20 border-green-500 text-green-400";
                  } else if (idx === selectedAnswer) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                  } else {
                    btnStyle = "opacity-50 border-transparent";
                  }
                } else if (selectedAnswer === idx) {
                  btnStyle = "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !showAnswer && selectAnswer(idx)}
                    disabled={showAnswer}
                    className={`w-full p-5 rounded-xl border-2 text-left font-semibold text-lg transition-all ${btnStyle}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{opt}</span>
                      {showAnswer && idx === question.correctAnswer && <span>✅</span>}
                      {showAnswer && idx === selectedAnswer && idx !== question.correctAnswer && <span>❌</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className="mt-8 w-full py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-cyan-500 to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {!showAnswer ? 'Check Answer' : (currentQuestion + 1 === questions.length ? 'Finish Game' : 'Next Question')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="text-6xl mb-6">{percentage >= 70 ? '🏆' : '💪'}</div>
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {percentage >= 70 ? 'Amazing Job!' : 'Good Effort!'}
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            You scored {score} out of {questions.length} ({percentage}%)
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="text-3xl font-bold text-green-400">{score}</div>
              <div className="text-sm text-green-200">Correct</div>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="text-3xl font-bold text-red-400">{questions.length - score}</div>
              <div className="text-sm text-red-200">Incorrect</div>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-[1.02] transition-all"
          >
            Play Again 🔄
          </button>
        </div>
      </div>
    );
  }
};

export default TohidGame;
