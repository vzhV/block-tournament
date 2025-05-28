import React, { useState } from "react";
import { Box, Button, TextField, Typography, Stack, Avatar } from "@mui/material";
import { getTelegramUser } from "../utils/telegram";

const MainMenu: React.FC<{ onJoin: (gameId: string) => void; }> = ({ onJoin }) => {
  const [gameId, setGameId] = useState("");
  const user = getTelegramUser();

  function handleCreateGame() {
    const newGameId = Math.random().toString(36).substr(2, 6).toUpperCase();
    onJoin(newGameId);
  }
  function handleJoinGame() {
    if (gameId.length > 2) onJoin(gameId.trim().toUpperCase());
  }

  return (
    <Box p={4} maxWidth={380} mx="auto" bgcolor="background.paper" borderRadius={4} boxShadow={4}>
      <Stack alignItems="center" spacing={2}>
        <Avatar src={user?.photo_url} sx={{ width: 56, height: 56 }}>
          {(!user?.photo_url && user?.first_name) ? user.first_name[0] : null}
        </Avatar>
        <Typography variant="h6">
          Welcome, {user?.first_name || user?.username || "Player"}!
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreateGame} fullWidth>
          Create New Game
        </Button>
        <Typography variant="body2" color="text.secondary">or join a game</Typography>
        <TextField
          label="Enter Game Code"
          value={gameId}
          onChange={e => setGameId(e.target.value)}
          variant="outlined"
          fullWidth
          inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
        />
        <Button variant="outlined" color="primary" onClick={handleJoinGame} fullWidth>
          Join Game
        </Button>
      </Stack>
    </Box>
  );
};
export default MainMenu;
