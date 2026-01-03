import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "./Login";
import TohidGame from "./TohidGame";
import Leaderboard from "./Leaderboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("game");

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) return <Login />;

  return (
    <div>
      <div className="flex gap-4 p-4 bg-black text-white">
        <button onClick={() => setTab("game")}>Game</button>
        <button onClick={() => setTab("leaderboard")}>Leaderboard</button>
        <button onClick={() => signOut(auth)}>Logout</button>
      </div>

      {tab === "game" && <TohidGame user={user} />}
      {tab === "leaderboard" && <Leaderboard />}
    </div>
  );
}