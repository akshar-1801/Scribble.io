import { createContext, useContext, useState } from "react";

export const PlayerContext = createContext(); 

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);

  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
