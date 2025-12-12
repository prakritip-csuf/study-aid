import React, { useState } from "react";

export default function UserProgress({ totalCards }) {
  const [completedCount, setCompletedCount] = useState(0);

  // Increment progress
  const incrementProgress = () => {
    if (completedCount < totalCards) {
      setCompletedCount(completedCount + 1);
    }
  };

  // Reset progress
  const resetProgress = () => {
    setCompletedCount(0);
  };

  const percentage = totalCards > 0 ? ((completedCount / totalCards) * 100).toFixed(2) : 0;

  return (
    <div style={{ margin: "20px 0", width: "100%" }}>
      <h3>Progress</h3>
      <div style={{ height: "20px", width: "100%", background: "#eee", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percentage}%`, background: "#4caf50", transition: "width 0.3s ease" }}></div>
      </div>
      <p style={{ marginTop: "8px" }}>
        {completedCount} / {totalCards} completed — <strong>{percentage}%</strong>
      </p>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={incrementProgress}
          style={{
            padding: "8px 12px",
            background: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          ✔ Mark as Done
        </button>

        <button
          onClick={resetProgress}
          style={{
            padding: "8px 12px",
            background: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Reset Progress
        </button>
      </div>
    </div>
  );
}




// import React, { useEffect, useState } from "react";

// const API_URL = "http://localhost:5000/api";

// export default function UserProgress({ userId, setId, triggerIncrement, totalCards }) {
//   const [progress, setProgress] = useState({
//     completed_count: 0,
//     total_count: totalCards || 0,
//     percentage: 0,
//   });

//   // ----------------------------
//   // FETCH PROGRESS (runs on mount)
//   // ----------------------------
//   const fetchProgress = async () => {
//     try {
//       const res = await fetch(`${API_URL}/progress/${userId}/${setId}`);
//       if (!res.ok) throw new Error("Failed to load progress");
//       const data = await res.json();
//       setProgress(data);
//     } catch (err) {
//       console.error("Failed to fetch progress", err);
//     }
//   };

//   // --------------------------------
//   // UPDATE PROGRESS (Mark as Done)
//   // --------------------------------
//   const incrementProgress = async () => {
//     try {
//       const res = await fetch(`${API_URL}/progress/${setId}/increment`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_id: userId }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setProgress(data);
//       }
//     } catch (err) {
//       console.error("Progress update error", err);
//     }
//   };

//   // -----------------------
//   // RESET PROGRESS
//   // -----------------------
//   const resetProgress = async () => {
//     try {
//       const res = await fetch(`${API_URL}/progress/${setId}/reset`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_id: userId }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setProgress(data);
//       }
//     } catch (err) {
//       console.error("Failed to reset progress", err);
//     }
//   };

//   // ----------------------------
//   // EFFECTS
//   // ----------------------------
//   // Run once: load progress
//   useEffect(() => {
//     fetchProgress();
//   }, []);

//   // Trigger increment whenever the button is clicked
//   useEffect(() => {
//     if (triggerIncrement) {
//       incrementProgress();
//     }
//   }, [triggerIncrement]);

//   // Update total_count if cards change
//   useEffect(() => {
//     setProgress((p) => ({ ...p, total_count: totalCards }));
//   }, [totalCards]);

//   // --------------------
//   // UI
//   // --------------------
//   return (
//     <div style={{ margin: "20px 0", width: "100%" }}>
//       <h3>Progress</h3>

//       <div
//         style={{
//           height: "20px",
//           width: "100%",
//           background: "#eee",
//           borderRadius: "10px",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             height: "100%",
//             width: `${progress.percentage}%`,
//             background: "#4caf50",
//             transition: "width 0.3s ease",
//           }}
//         ></div>
//       </div>

//       <p style={{ marginTop: "8px" }}>
//         {progress.completed_count} / {progress.total_count} completed — 
//         <strong> {progress.percentage}%</strong>
//       </p>

//       <button
//         onClick={resetProgress}
//         style={{
//           marginTop: "10px",
//           padding: "8px 12px",
//           background: "#f44336",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Reset Progress
//       </button>
//     </div>
//   );
// }
