import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, Avatar, Stack, CircularProgress } from "@mui/material";
import { getInitData, getTelegramUser } from "../utils/telegram";
import { socket } from "../utils/socket";

type PlayerInfo = {
  id: string;
  username?: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
};

const WaitingRoom: React.FC<{
  gameId: string;
  onReady: () => void;
}> = ({ gameId, onReady }) => {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const user = getTelegramUser();
  const triggeredReady = useRef(false);

  useEffect(() => {
    // Make sure only one emit (no extra calls)
    console.log("Emitting join_game");
    socket.emit("join_game", {
      gameId,
      initData: getInitData(),
    });

    // Listen to game_state
    const handleGameState = (state: any) => {
      // Map from whatever backend sends
      const roomPlayers = (state.players || []).map((p: any) => ({
        id: p.id ?? p.userId ?? "", // Support both keys just in case
        username: p.username,
        photo_url: p.photo_url,
        first_name: p.first_name,
        last_name: p.last_name,
      }));
      setPlayers(roomPlayers);

      // Find unique, non-empty player IDs
      const uniqueIds = [...new Set(roomPlayers.filter(p => p.id).map(p => String(p.id)))];
      if (
        uniqueIds.length === 2 &&
        !triggeredReady.current
      ) {
        triggeredReady.current = true;
        setTimeout(onReady, 1000); // Wait a moment for both to sync up visually
      }
    };

    socket.on("game_state", handleGameState);

    // Clean up listener
    return () => {
      socket.off("game_state", handleGameState);
      triggeredReady.current = false;
    };
  }, [gameId]);

  // Find "me" and "opponent"
  const me = players.find(p => String(p.id) === String(user?.id));
  const opponent = players.find(p => p.id && String(p.id) !== String(user?.id));

  return (
    <Box p={4} maxWidth={400} mx="auto" bgcolor="background.paper" borderRadius={4} boxShadow={4}>
      <Typography variant="h5" align="center" mb={2}>
        Waiting Room
      </Typography>
      <Typography align="center" mb={2}>
        Share this code to invite a friend:
        <Box component="span" sx={{ fontWeight: 700, fontSize: "1.2em", ml: 1, letterSpacing: "0.2em" }}>
          {gameId}
        </Box>
      </Typography>
      <Stack direction="row" spacing={4} justifyContent="center" mb={3}>
        {/* Always show your avatar and name */}
        <Stack alignItems="center" spacing={1}>
          <Avatar src={me?.photo_url || user?.photo_url} sx={{ width: 52, height: 52 }}>
            {(!me?.photo_url && (me?.first_name || user?.first_name)) ? (me?.first_name || user?.first_name)[0] : null}
          </Avatar>
          <Typography>
            {me?.first_name || user?.first_name || me?.username || user?.username || "You"}
          </Typography>
        </Stack>
        {/* Show opponent if present */}
        {opponent ? (
          <Stack alignItems="center" spacing={1}>
            <Avatar src={opponent.photo_url} sx={{ width: 52, height: 52 }} />
            <Typography>
              {opponent.first_name || opponent.username || "Opponent"}
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={1}>
            <Avatar sx={{ width: 52, height: 52, bgcolor: "grey.300" }} />
            <Typography color="text.secondary">Waiting...</Typography>
          </Stack>
        )}
      </Stack>
      {(players.length < 2 || !opponent) && (
        <Box display="flex" justifyContent="center">
          <CircularProgress size={32} />
        </Box>
      )}
    </Box>
  );
};
export default WaitingRoom;
