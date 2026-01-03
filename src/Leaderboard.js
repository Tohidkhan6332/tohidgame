import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const load = async () => {
      const thirtyDaysAgo = Timestamp.fromMillis(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      const q = query(
        collection(db, "scores"),
        where("createdAt", ">", thirtyDaysAgo),
        orderBy("score", "desc")
      );

      const snap = await getDocs(q);
      setScores(snap.docs.map((d) => d.data()));
    };

    load();
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl mb-4">Leaderboard (30 Days)</h2>
      {scores.map((s, i) => (
        <div key={i}>
          #{i + 1} {s.email} — {s.score}
        </div>
      ))}
    </div>
  );
}