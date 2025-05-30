import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Stack, CircularProgress, Alert, Button, Tooltip } from "@mui/material";
import { getTelegramUser } from "../utils/telegram";
import { socket } from "../utils/socket";

type PlayerInfo = {
  id: string;
  username?: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
};

const colors = {
  background: "#190332",
  cardGlass: "rgba(60,20,80,0.82)",
  accent: "#8f4be8",
  accentAlt: "#3d246c",
  white: "#fff",
  inputBg: "rgba(40, 20, 60, 0.32)",
  divider: "rgba(162,89,255,0.14)",
  glow: "0 0 8px 1px rgba(143,75,232,0.22)"
};

const WaitingRoom: React.FC<{
  gameId: string;
  lobbyCode?: string | null;
}> = ({ gameId, lobbyCode }) => {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = getTelegramUser();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(null);

    const handleGameState = (state: any) => {
      const roomPlayers = (state.players || []).map((p: any) => ({
        id: p.id ?? p.userId ?? "",
        username: p.username,
        photo_url: p.photo_url,
        first_name: p.first_name,
        last_name: p.last_name,
      }));
      setPlayers(roomPlayers);
    };

    const handleError = (msg: string) => {
      setError(msg);
    };

    socket.on("game_state", handleGameState);
    socket.on("error", handleError);

    return () => {
      socket.off("game_state", handleGameState);
      socket.off("error", handleError);
    };
  }, [gameId]);

  const me = players.find(p => String(p.id) === String(user?.id));
  const opponent = players.find(p => p.id && String(p.id) !== String(user?.id));

  function handleCopy() {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  }

  return (
    <Box
      minHeight="100vh"
      sx={{
        bgcolor: colors.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, sm: 8 }
      }}
    >
      <Box
        sx={{
          p: { xs: 2.5, sm: 4 },
          minWidth: 320,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: `0 8px 40px 0 ${colors.accentAlt}`,
          bgcolor: colors.cardGlass,
          backdropFilter: "blur(12px)",
          border: `1.5px solid ${colors.accentAlt}`,
          mx: { xs: 1.5, sm: 2 },
        }}
      >
        <Typography
          variant="h5"
          align="center"
          mb={2}
          sx={{
            color: colors.white,
            fontWeight: 700,
            letterSpacing: 1.2,
            textShadow: "0 2px 8px rgba(143,75,232,0.10)"
          }}
        >
          Waiting Room
        </Typography>
        {lobbyCode ? (
          <Stack alignItems="center" mb={3}>
            <Typography
              align="center"
              sx={{ color: colors.white, mb: 0.5, opacity: 0.92 }}
            >
              Share this code to invite a friend:
            </Typography>
            <Box
              sx={{
                fontWeight: 700,
                fontSize: 24,
                bgcolor: "rgba(80,30,130,0.18)",
                color: colors.accent,
                px: 2,
                py: 0.5,
                letterSpacing: "0.15em",
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                boxShadow: colors.glow,
                mt: 0.5,
                mb: 1,
                userSelect: "all"
              }}
            >
              {lobbyCode}
              <Tooltip title={copied ? "Copied!" : "Copy"}>
                <Button
                  onClick={handleCopy}
                  sx={{
                    color: colors.white,
                    minWidth: 0,
                    px: 1,
                    ml: 1,
                    bgcolor: "rgba(110,60,255,0.11)",
                    fontSize: 18,
                    borderRadius: 1,
                    '&:hover': { bgcolor: colors.accent }
                  }}
                  size="small"
                >
                  📋
                </Button>
              </Tooltip>
            </Box>
          </Stack>
        ) : (
          <Typography
            align="center"
            mb={2}
            sx={{ color: colors.white, opacity: 0.86 }}
          >
            Looking for an opponent...
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          mb={3}
        >
          <Stack alignItems="center" spacing={1}>
            <Avatar
              src={me?.photo_url || user?.photo_url}
              sx={{
                width: 56,
                height: 56,
                bgcolor: colors.accent,
                fontWeight: 700,
                fontSize: 24,
                boxShadow: colors.glow,
                border: `2px solid ${colors.white}`
              }}
            >
              {(!me?.photo_url && (me?.first_name || user?.first_name)) ? (me?.first_name || user?.first_name)[0] : null}
            </Avatar>
            <Typography
              sx={{
                color: colors.white,
                fontWeight: 600,
                fontSize: 16
              }}
            >
              {me?.first_name || user?.first_name || me?.username || user?.username || "You"}
            </Typography>
          </Stack>
          {opponent ? (
            <Stack alignItems="center" spacing={1}>
              <Avatar
                src={opponent.photo_url}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: colors.accentAlt,
                  fontWeight: 700,
                  fontSize: 24,
                  boxShadow: colors.glow,
                  border: `2px solid ${colors.white}`
                }}
              />
              <Typography
                sx={{
                  color: colors.white,
                  fontWeight: 600,
                  fontSize: 16
                }}
              >
                {opponent.first_name || opponent.username || "Opponent"}
              </Typography>
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={1}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "grey.800",
                  color: colors.white,
                  opacity: 0.4
                }}
              />
              <Typography color="text.secondary" sx={{ color: colors.white, opacity: 0.52, fontSize: 15 }}>
                Waiting...
              </Typography>
            </Stack>
          )}
        </Stack>
        {(players.length < 2 || !opponent) && !error && (
          <Box display="flex" justifyContent="center" mb={1.5}>
            <CircularProgress size={32} sx={{
              color: colors.accent
            }} />
          </Box>
        )}
        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              bgcolor: "#3c1444",
              color: colors.accent,
              border: `1px solid ${colors.accentAlt}`,
              borderRadius: 1,
              fontWeight: 600,
              width: "100%"
            }}
          >
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default WaitingRoom;
