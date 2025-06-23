import React, { useState } from 'react';
import { db } from '../firebase/config';
import { ref, set } from 'firebase/database';

export default function MasterControl() {
  const [diceValue, setDiceValue] = useState(1);

  const controlDice = () => {
    set(ref(db, 'masterControl/forcedDice'), diceValue);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Master Dice Control</h1>
      <input
        type="number"
        min="1"
        max="6"
        value={diceValue}
        onChange={(e) => setDiceValue(Number(e.target.value))}
        className="text-black p-2 rounded mb-4"
      />
      <button
        onClick={controlDice}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
      >
        Set Dice Value
      </button>
    </div>
  );
}