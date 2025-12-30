import React, { useState } from 'react';

const TohidGame = () => {
  const [gameState, setGameState] = useState('setup'); // setup, loading, playing, checking, results
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

  const generateQuestions = async () => {
    if (categories.length === 0) {
      alert('Please select at least one category!');
      return;
    }

    setGameState('loading');
    
    try {
      // Option 1: Use Open Tohid Database (completely free, no API key needed)
      const categoryMapping = {
        'Science': 17,
        'History': 23,
        'Geography': 22,
        'Sports': 21,
        'Movies': 11,
        'Music': 12,
        'Literature': 10,
        'Art': 25,
        'Technology': 18,
        'Animals': 27,
        'Space': 17 // Using general science for space
      };

      // Get random category from selected ones
      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      const categoryId = categoryMapping[selectedCategory] || 9; // Default to general knowledge

      const difficultyMap = { easy: 'easy', medium: 'medium', hard: 'hard' };
      
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${numQuestions}&category=${categoryId}&difficulty=${difficultyMap[difficulty]}&type=multiple&encode=url3986`
      );

      if (!response.ok) {
        throw new Error('Tohid API request failed');
      }

      const data = await response.json();
      
      if (data.response_code !== 0 || !data.results || data.results.length === 0) {
        throw new Error('No questions available for selected criteria');
      }

      // Convert Open Tohid DB format to our format
      const convertedQuestions = data.results.map((item, index) => {
        // Decode URL-encoded strings
        const question = decodeURIComponent(item.question);
        const correctAnswer = decodeURIComponent(item.correct_answer);
        const incorrectAnswers = item.incorrect_answers.map(ans => decodeURIComponent(ans));
        
        // Shuffle options
        const allOptions = [correctAnswer, ...incorrectAnswers];
        const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(correctAnswer);
        
        return {
          question: question,
          options: shuffledOptions,
          correctAnswer: correctIndex,
          category: selectedCategory
        };
      });

      setQuestions(convertedQuestions);
      setGameState('playing');
      setCurrentQuestion(0);
      setScore(0);
      setAnswers([]);
      
    } catch (error) {
      console.error('Error fetching questions from API:', error);
      
      // Fallback to local questions
      console.log('Using local fallback questions...');
      generateFallbackQuestions();
    }
  };

  const generateFallbackQuestions = () => {
    const fallbackQuestions = {
      Science: [
        {
          question: "What is the chemical symbol for gold?",
          options: ["Au", "Ag", "Go", "Gd"],
          correctAnswer: 0,
          category: "Science"
        },
        {
          question: "What is the hardest natural substance on Earth?",
          options: ["Gold", "Iron", "Diamond", "Platinum"],
          correctAnswer: 2,
          category: "Science"
        },
        {
          question: "What gas makes up about 78% of Earth's atmosphere?",
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
          correctAnswer: 2,
          category: "Science"
        },
        {
          question: "What is the speed of light in vacuum?",
          options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "200,000 km/s"],
          correctAnswer: 0,
          category: "Science"
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1,
          category: "Science"
        }
      ],
      History: [
        {
          question: "In which year did World War II end?",
          options: ["1944", "1945", "1946", "1947"],
          correctAnswer: 1,
          category: "History"
        },
        {
          question: "Who was the first person to walk on the moon?",
          options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
          correctAnswer: 1,
          category: "History"
        },
        {
          question: "The Great Wall of China was primarily built during which dynasty?",
          options: ["Tang", "Song", "Ming", "Qing"],
          correctAnswer: 2,
          category: "History"
        },
        {
          question: "Which ancient wonder of the world was located in Alexandria?",
          options: ["Hanging Gardens", "Lighthouse", "Colossus", "Temple of Artemis"],
          correctAnswer: 1,
          category: "History"
        },
        {
          question: "The Renaissance period began in which country?",
          options: ["France", "Germany", "Italy", "Spain"],
          correctAnswer: 2,
          category: "History"
        }
      ],
      Geography: [
        {
          question: "What is the largest continent by area?",
          options: ["Africa", "Asia", "North America", "South America"],
          correctAnswer: 1,
          category: "Geography"
        },
        {
          question: "Which river is the longest in the world?",
          options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
          correctAnswer: 1,
          category: "Geography"
        },
        {
          question: "What is the capital of Australia?",
          options: ["Sydney", "Melbourne", "Canberra", "Perth"],
          correctAnswer: 2,
          category: "Geography"
        },
        {
          question: "Which mountain range contains Mount Everest?",
          options: ["Andes", "Rocky Mountains", "Alps", "Himalayas"],
          correctAnswer: 3,
          category: "Geography"
        },
        {
          question: "What is the smallest country in the world?",
          options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
          correctAnswer: 1,
          category: "Geography"
        }
      ],
      Technology: [
        {
          question: "What does 'HTTP' stand for?",
          options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "HyperText Translation Protocol", "High Transfer Text Protocol"],
          correctAnswer: 0,
          category: "Technology"
        },
        {
          question: "Which company developed the Java programming language?",
          options: ["Microsoft", "Sun Microsystems", "IBM", "Oracle"],
          correctAnswer: 1,
          category: "Technology"
        },
        {
          question: "What does 'AI' stand for in technology?",
          options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Interface", "Algorithmic Integration"],
          correctAnswer: 1,
          category: "Technology"
        },
        {
          question: "Which was the first widely-used web browser?",
          options: ["Internet Explorer", "Netscape Navigator", "Mosaic", "Firefox"],
          correctAnswer: 2,
          category: "Technology"
        },
        {
          question: "What does 'RAM' stand for in computing?",
          options: ["Random Access Memory", "Rapid Access Memory", "Read Access Memory", "Remote Access Memory"],
          correctAnswer: 0,
          category: "Technology"
        }
      ],
      Sports: [
        {
          question: "How many players are on a basketball team on the court at one time?",
          options: ["4", "5", "6", "7"],
          correctAnswer: 1,
          category: "Sports"
        },
        {
          question: "In which sport would you perform a slam dunk?",
          options: ["Tennis", "Volleyball", "Basketball", "Baseball"],
          correctAnswer: 2,
          category: "Sports"
        },
        {
          question: "How often are the Summer Olympic Games held?",
          options: ["Every 2 years", "Every 4 years", "Every 3 years", "Every 5 years"],
          correctAnswer: 1,
          category: "Sports"
        },
        {
          question: "What is the maximum score possible in ten-pin bowling?",
          options: ["250", "280", "300", "350"],
          correctAnswer: 2,
          category: "Sports"
        },
        {
          question: "In soccer, how many players are on the field for each team?",
          options: ["10", "11", "12", "9"],
          correctAnswer: 1,
          category: "Sports"
        }
      ],
      Movies: [
        {
          question: "Which movie features the famous line 'May the Force be with you'?",
          options: ["Star Trek", "Star Wars", "Stargate", "Guardians of the Galaxy"],
          correctAnswer: 1,
          category: "Movies"
        },
        {
          question: "Who directed the movie 'Jaws'?",
          options: ["George Lucas", "Steven Spielberg", "Martin Scorsese", "Francis Ford Coppola"],
          correctAnswer: 1,
          category: "Movies"
        },
        {
          question: "In which movie does Tom Hanks say 'Life is like a box of chocolates'?",
          options: ["Cast Away", "Philadelphia", "Forrest Gump", "Big"],
          correctAnswer: 2,
          category: "Movies"
        },
        {
          question: "Which animated movie features the song 'Let It Go'?",
          options: ["Moana", "Frozen", "Tangled", "Encanto"],
          correctAnswer: 1,
          category: "Movies"
        },
        {
          question: "What is the highest-grossing film of all time (as of 2024)?",
          options: ["Titanic", "Avatar", "Avengers: Endgame", "Star Wars: The Force Awakens"],
          correctAnswer: 1,
          category: "Movies"
        }
      ]
    };

    // Filter questions based on selected categories
    let availableQuestions = [];
    categories.forEach(category => {
      if (fallbackQuestions[category]) {
        availableQuestions.push(...fallbackQuestions[category]);
      }
    });

    // If no categories match, use all questions
    if (availableQuestions.length === 0) {
      availableQuestions = Object.values(fallbackQuestions).flat();
    }

    // Shuffle and select the required number of questions
    const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numQuestions);

    setQuestions(selectedQuestions);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
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
      // First click - show the answer
      setShowAnswer(true);
      return;
    }

    // Second click - move to next question
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, {
      questionIndex: currentQuestion,
      selectedAnswer,
      isCorrect
    }];
    
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
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

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        
        <div className="relative z-10 px-4 py-6 sm:py-8 lg:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 lg:mb-12">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl">🧠</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  TohidAI
                </h1>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Challenge your knowledge with AI-powered tohid game questions tailored to your interests
              </p>
            </div>

            {/* Main Setup Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 lg:p-10">
              {/* Categories Section */}
              <div className="mb-8 lg:mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📝</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Choose Categories</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {availableCategories.map(category => (
                    <button
                      key={category.name}
                      onClick={() => toggleCategory(category.name)}
                      className={`group p-4 sm:p-5 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 border-2 hover:scale-105 ${
                        categories.includes(category.name)
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-300 shadow-lg shadow-cyan-500/25'
                          : 'bg-white/5 text-white border-white/20 hover:border-cyan-400/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-xl sm:text-2xl">{category.icon}</span>
                        <span className="text-xs sm:text-sm font-medium leading-tight text-center">
                          {category.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-8 lg:mb-12">
                {/* Difficulty Section */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-sm">🎯</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Difficulty Level</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      { value: 'easy', label: 'Easy', desc: 'Perfect for beginners', icon: '🟢' },
                      { value: 'medium', label: 'Medium', desc: 'Balanced challenge', icon: '🟡' },
                      { value: 'hard', label: 'Hard', desc: 'Expert level', icon: '🔴' }
                    ].map(diff => (
                      <button
                        key={diff.value}
                        onClick={() => setDifficulty(diff.value)}
                        className={`w-full p-4 rounded-xl font-semibold transition-all duration-300 border-2 hover:scale-105 ${
                          difficulty === diff.value
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white border-orange-300 shadow-lg shadow-orange-500/25'
                            : 'bg-white/5 text-white border-white/20 hover:border-orange-400/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{diff.icon}</span>
                            <div className="text-left">
                              <div className="font-bold">{diff.label}</div>
                              <div className="text-xs opacity-80">{diff.desc}</div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions Section */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-sm">📊</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Question Count</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[5, 10, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setNumQuestions(num)}
                        className={`p-4 rounded-xl font-bold text-lg transition-all duration-300 border-2 hover:scale-105 ${
                          numQuestions === num
                            ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white border-purple-300 shadow-lg shadow-purple-500/25'
                            : 'bg-white/5 text-white border-white/20 hover:border-purple-400/50 hover:bg-white/10'
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
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-400 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white font-black py-4 sm:py-6 px-8 rounded-xl sm:rounded-2xl text-lg sm:text-xl lg:text-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span>🚀</span>
                  <span>Start Game</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-cyan-400/20 rounded-full animate-spin border-t-cyan-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl animate-pulse">🧠</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4">Generating Questions...</h2>
          <p className="text-slate-300 text-lg sm:text-xl">AI is crafting your personalized tohid game challenge</p>
          <div className="mt-6 flex justify-center space-x-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-2 h-2 bg-cyan-400 rounded-full animate-pulse`} style={{animationDelay: `${i * 0.2}s`}}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Progress */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                <span className="text-cyan-400 font-bold text-sm sm:text-base">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                <span className="text-green-400 font-bold text-sm sm:text-base flex items-center space-x-2">
                  <span>🏆</span>
                  <span>Score: {score}</span>
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 sm:h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 lg:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 mb-6">
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full text-xs sm:text-sm font-bold">
                  {question.category}
                </span>
                <span className="text-slate-400 text-xs sm:text-sm font-medium capitalize">
                  {difficulty} difficulty
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed text-white">
                {question.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => {
                let buttonClass = 'group w-full p-4 sm:p-6 rounded-xl sm:rounded-2xl font-semibold text-left transition-all duration-300 border-2 transform hover:scale-105 ';
                let showIcon = '';
                
                if (showAnswer) {
                  if (index === question.correctAnswer) {
                    buttonClass += 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300 shadow-lg shadow-green-500/25';
                    showIcon = '✓';
                  } else if (index === selectedAnswer && index !== question.correctAnswer) {
                    buttonClass += 'bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300 shadow-lg shadow-red-500/25';
                    showIcon = '✗';
                  } else {
                    buttonClass += 'bg-white/5 text-slate-400 border-white/20 opacity-60';
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-300 shadow-lg shadow-cyan-500/25';
                  } else {
                    buttonClass += 'bg-white/5 text-white border-white/20 hover:border-cyan-400/50 hover:bg-white/10';
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && selectAnswer(index)}
                    disabled={showAnswer}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center font-black text-sm sm:text-base">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-sm sm:text-base lg:text-lg flex-1">{option}</span>
                      </div>
                      {showIcon && (
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className="text-xl font-bold">{showIcon}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-400 disabled:from-gray-500 disabled:to-gray-600 disabled:opacity-50 text-white font-black py-4 sm:py-6 px-8 rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-3">
                <span>
                  {!showAnswer ? '🔍 Check Answer' : 
                   currentQuestion + 1 === questions.length ? '🏁 Finish Game' : '➡️ Next Question'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    const getPerformanceData = () => {
      if (percentage >= 90) return { emoji: '🏆', title: 'Outstanding!', color: 'from-yellow-400 to-orange-500', desc: 'You\'re a tohid game master!' };
      if (percentage >= 80) return { emoji: '🥇', title: 'Excellent!', color: 'from-green-400 to-emerald-500', desc: 'Impressive knowledge!' };
      if (percentage >= 70) return { emoji: '🥈', title: 'Great Job!', color: 'from-blue-400 to-cyan-500', desc: 'Well done!' };
      if (percentage >= 60) return { emoji: '🥉', title: 'Good Work!', color: 'from-purple-400 to-pink-500', desc: 'Keep it up!' };
      if (percentage >= 40) return { emoji: '📚', title: 'Not Bad!', color: 'from-orange-400 to-red-500', desc: 'Room to improve!' };
      return { emoji: '💪', title: 'Keep Trying!', color: 'from-gray-400 to-gray-600', desc: 'Practice makes perfect!' };
    };

    const performance = getPerformanceData();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${performance.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-3xl sm:text-4xl">{performance.emoji}</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {performance.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300">{performance.desc}</p>
          </div>
          
          {/* Score Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 lg:p-10 mb-8">
            <div className="text-center mb-8">
              <div className={`inline-block text-6xl sm:text-7xl lg:text-8xl font-black mb-4 bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}>
                {score}/{questions.length}
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-6 text-white">
                {percentage}% Correct
              </div>
              
              {/* Performance Ring */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(148 163 184 / 0.2)" strokeWidth="8"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className="text-cyan-400" stopColor="currentColor" />
                      <stop offset="100%" className="text-blue-500" stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-white">{percentage}%</span>
                </div>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-white">Question Review</h3>
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer && userAnswer.isCorrect;
                return (
                  <div key={index} className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                    isCorrect ? 'border-green-400/50 bg-green-500/10' : 'border-red-400/50 bg-red-500/10'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold mb-3 text-white leading-relaxed">{question.question}</div>
                        <div className="space-y-2">
                          <div className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            <span className="font-medium">Your answer: </span>
                            {question.options[userAnswer.selectedAnswer]}
                          </div>
                          {!isCorrect && (
                            <div className="text-green-400 text-sm">
                              <span className="font-medium">Correct answer: </span>
                              {question.options[question.correctAnswer]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl">
                        {isCorrect ? '✅' : '❌'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Play Again Button */}
            <button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-400 text-white font-black py-4 sm:py-6 px-8 rounded-xl sm:rounded-2xl text-lg sm:text-xl lg:text-2xl transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-3">
                <span>🔄</span>
                <span>Play Again</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default TohidGame;
              
