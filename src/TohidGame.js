import React, { useState } from 'react';
import { fallbackQuestions } from './TohidData';

// 🔥 FIREBASE + LEADERBOARD IMPORTS
import useTopThree from "./useTopThree";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const TohidGame = ({ user }) => {
  const [gameState, setGameState] = useState('setup');
  const [categories, setCategories] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  // 🔥 NEW
  const topThree = useTopThree();
  const [scoreSaved, setScoreSaved] = useState(false);

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

  // --- QUESTION GENERATION (UNCHANGED) ---
  const generateQuestions = async () => {
    if (categories.length === 0) return alert('Select at least one category');

    setGameState('loading');

    try {
      const categoryMapping = {
        Science: 17, History: 23, Geography: 22, Sports: 21,
        Movies: 11, Music: 12, Literature: 10, Art: 25,
        Technology: 18, Animals: 27, Space: 17
      };

      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
      const apiCategoryId = categoryMapping[selectedCategory];

      if (!apiCategoryId) return generateLocalQuestions();

      const response = await fetch(
        `https://opentdb.com/api.php?amount=${numQuestions}&category=${apiCategoryId}&difficulty=${difficulty}&type=multiple&encode=url3986`
      );

      const data = await response.json();
      if (data.response_code !== 0) throw new Error();

      const formatted = data.results.map(q => {
        const correct = decodeURIComponent(q.correct_answer);
        const options = [...q.incorrect_answers.map(decodeURIComponent), correct]
          .sort(() => Math.random() - 0.5);

        return {
          question: decodeURIComponent(q.question),
          options,
          correctAnswer: options.indexOf(correct),
          category: selectedCategory
        };
      });

      setQuestions(formatted);
      startGame();
    } catch {
      generateLocalQuestions();
    }
  };

  const generateLocalQuestions = () => {
    let pool = [];
    categories.forEach(c => fallbackQuestions[c] && (pool = pool.concat(fallbackQuestions[c])));
    if (!pool.length) pool = Object.values(fallbackQuestions).flat();

    const selected = pool.sort(() => Math.random() - 0.5).slice(0, numQuestions);
    const final = selected.map(q => {
      const correctText = q.options[q.correctAnswer];
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      return { ...q, options: shuffled, correctAnswer: shuffled.indexOf(correctText) };
    });

    setQuestions(final);
    startGame();
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setShowAnswer(false);
    setSelectedAnswer(null);
    setScoreSaved(false);
  };

  const selectAnswer = (i) => setSelectedAnswer(i);

  const nextQuestion = async () => {
    if (selectedAnswer === null) return alert('Select an answer');

    if (!showAnswer) {
      setShowAnswer(true);
      return;
    }

    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (correct) setScore(s => s + 1);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(q => q + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setGameState('results');

      // 🔥 SAVE SCORE (ONLY ONCE)
      if (!scoreSaved && user) {
        await addDoc(collection(db, "scores"), {
          uid: user.uid,
          email: user.email,
          score,
          createdAt: serverTimestamp(),
        });
        setScoreSaved(true);
      }
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCategories([]);
    setQuestions([]);
    setScore(0);
    setScoreSaved(false);
  };

  // ================= RENDER =================

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">

        {/* 🔥 TOP 3 PUBLIC SCORES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {topThree.map((u, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl text-center ${
                i === 0
                  ? "bg-yellow-400 text-black"
                  : i === 1
                  ? "bg-gray-300 text-black"
                  : "bg-orange-400 text-black"
              }`}
            >
              <div className="font-black text-xl">
                {i === 0 ? "🥇 FIRST" : i === 1 ? "🥈 SECOND" : "🥉 THIRD"}
              </div>
              <div className="text-sm break-all">{u.email}</div>
              <div className="text-2xl font-bold">Score: {u.score}</div>
            </div>
          ))}
        </div>

        <button
          onClick={generateQuestions}
          className="w-full py-4 bg-cyan-600 rounded-xl text-xl font-bold"
        >
          Start Quiz 🚀
        </button>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <h2 className="text-2xl mb-4">{q.question}</h2>

        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !showAnswer && selectAnswer(i)}
            className="block w-full mb-3 p-3 bg-white/10 rounded"
          >
            {opt}
          </button>
        ))}

        <button
          onClick={nextQuestion}
          className="mt-6 w-full py-3 bg-blue-600 rounded-xl text-xl"
        >
          {showAnswer ? "Next" : "Check Answer"}
        </button>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl mb-4">Final Score</h1>
        <p className="text-2xl mb-6">{score} / {questions.length}</p>
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-green-600 rounded-xl text-xl"
        >
          Play Again 🔄
        </button>
      </div>
    );
  }
};

export default TohidGame;