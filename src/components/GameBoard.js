// src/components/GameBoard.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { ref, onValue, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

export default function GameBoard() {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentDice, setCurrentDice] = useState(null);
  const [forcedDice, setForcedDice] = useState(null);
  const [roomCode] = useState("LUDO123");
  const [gameOver, setGameOver] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const boardSize = 10;
  const homeZones = {
    Red: 0,
    Green: 13,
    Yellow: 26,
    Blue: 39
  };

  const safeZones = [0, 8, 13, 21, 26, 34, 39, 47];
  const pathLength = 52;

  useEffect(() => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val() || {};
      const playersList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
      setPlayers(playersList);
    });

    const masterRef = ref(db, `masterControl/forcedDice`);
    onValue(masterRef, (snapshot) => {
      setForcedDice(snapshot.val());
    });
  }, [roomCode]);

  const rollDice = () => {
    if (gameOver || isRolling) return;

    setIsRolling(true);

    setTimeout(() => {
      let diceValue = forcedDice ? forcedDice : Math.floor(Math.random() * 6) + 1;

      let updatedPlayers = [...players];
      let currentPlayer = updatedPlayers[currentPlayerIndex];
      currentPlayer.position += diceValue;
      if (currentPlayer.position >= pathLength) {
        currentPlayer.position = currentPlayer.position % pathLength;
      }
      currentPlayer.coins += diceValue * 10;

      updatedPlayers.forEach((player) => {
        if (
          player.id !== currentPlayer.id &&
          player.position === currentPlayer.position &&
          !safeZones.includes(player.position)
        ) {
          player.position = 0;
          update(ref(db, `rooms/${roomCode}/players/${player.id}`), {
            position: player.position,
          });
        }
      });

      update(ref(db, `rooms/${roomCode}/players/${currentPlayer.id}`), {
        coins: currentPlayer.coins,
        position: currentPlayer.position,
      });

      if (currentPlayer.position === homeZones[currentPlayer.color] && currentPlayer.coins >= 1000) {
        setGameOver(true);
        alert(`${currentPlayer.name} has won the game! 🎉`);
        update(ref(db, `rooms/${roomCode}/gameState`), { gameOver: true });
        return;
      }

      setCurrentDice(diceValue);
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);

      update(ref(db, `rooms/${roomCode}/gameState`), {
        currentDice: diceValue,
        currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
      });

      setIsRolling(false);
    }, 1000);
  };

  const getTokenPosition = (position, color) => {
    const startOffset = homeZones[color];
    const finalPosition = (startOffset + position) % pathLength;
    let row = Math.floor(finalPosition / boardSize);
    let col = finalPosition % boardSize;
    return { top: `${row * 50}px`, left: `${col * 50}px` };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-700 text-white flex flex-col items-center justify-center p-4 relative">
      <h1 className="text-4xl font-bold mb-4">Ludo Game Board</h1>

      {gameOver ? (
        <div className="text-3xl mb-4 text-yellow-300 animate-bounce">Game Over 🎉</div>
      ) : (
        <>
          <div className="text-xl mb-4">Current Turn: {players[currentPlayerIndex]?.name}</div>

          <div className="text-6xl mb-4 animate-spin-slow">🎲 {isRolling ? "🔄" : currentDice || "Roll the Dice!"}</div>

          <button
            onClick={rollDice}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded mb-4"
          >
            Roll Dice
          </button>
        </>
      )}

      {/* Board Grid */}
      <div className="relative w-[500px] h-[250px] bg-green-200 grid grid-cols-10 gap-1 p-2 mb-8">
        {Array.from({ length: pathLength }).map((_, idx) => (
          <div
            key={idx}
            className={\`w-full h-full border border-gray-400 flex items-center justify-center \${safeZones.includes(idx) ? 'bg-yellow-300' : 'bg-white'}\`}
          >
            {idx + 1}
          </div>
        ))}

        {/* Player Tokens */}
        {players.map((player) => (
          <AnimatePresence key={player.id}>
            <motion.div
              key={player.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, top: getTokenPosition(player.position, player.color).top, left: getTokenPosition(player.position, player.color).left }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: player.color }}
            >
              {player.name.charAt(0)}
            </motion.div>
          </AnimatePresence>
        ))}
      </div>

      <div className="w-full max-w-md">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex justify-between items-center bg-white text-black p-2 rounded mb-2"
          >
            <span>{player.name} ({player.color})</span>
            <span>{player.coins} coins - Position: {player.position}</span>
          </div>
        ))}
      </div>
    </div>
  );
}