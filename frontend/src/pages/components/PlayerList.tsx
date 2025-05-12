interface Player {
  id: string;
  name: string;
  points: number;
  avatar: string;
}

interface PlayerListProps {
  players: Player[];
  currentDrawer?: string | null; // Add this prop as optional for compatibility
}

const PlayerList = ({ players, currentDrawer }: PlayerListProps) => {
  return (
    <div className="w-48 bg-white rounded shadow overflow-y-auto">
      {players.map((player, index) => (
        <div
          key={player.id || index} // Use player.id if available, fallback to index
          className={`flex items-center justify-between p-2 ${
            index % 2 === 0 ? "bg-gray-50" : "bg-white"
          }${currentDrawer === player.id ? " border-l-4 border-blue-500" : ""}`}
        >
          <div className="flex items-center">
            <div className="text-2xl mr-2">{player.avatar}</div>
            <div>
              <div className="text-sm font-medium">{player.name}</div>
              <div className="text-xs text-yellow-600">{player.points} pts</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerList;
