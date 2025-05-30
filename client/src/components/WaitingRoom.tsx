import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Stack, CircularProgress, Alert, Button, Tooltip } from "@mui/material";
import { getTelegramUser } from "../utils/telegram";
import { socket } from "../utils/socket";

// CHANGE this to your actual bot username
const BOT_USERNAME = "block_tournament_bot";

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

type PlayerInfo = {
  id: string;
  username?: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
};

const WaitingRoom: React.FC<{
  gameId: string;
  lobbyCode?: string | null;
}> = ({ gameId, lobbyCode }) => {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = getTelegramUser();
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [shareResult, setShareResult] = useState<string | null>(null);

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

  // Invite link: https://t.me/BOT_USERNAME?startapp=LOBBYCODE
  const inviteLink = lobbyCode
    ? `https://t.me/${BOT_USERNAME}?startapp=${lobbyCode}`
    : "";

  function handleCopyInvite() {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 1200);
    }
  }

  // Universal Telegram share link (works everywhere)
  const shareText = encodeURIComponent("👾 Join my Block Tournament! Tap to join my lobby:");
  const shareUrl = encodeURIComponent(inviteLink);
  const telegramShareUrl = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;

  // Try native WebApp share dialog, fallback to Telegram universal share
  function handleShareTelegram(e?: React.MouseEvent) {
    // @ts-ignore
    if (window.Telegram?.WebApp?.showShareDialog && inviteLink) {
      // @ts-ignore
      window.Telegram.WebApp.showShareDialog({
        message: `👾 Join my Block Tournament! Tap to join the lobby:`,
        url: inviteLink
      }, (res: any) => {
        setShareResult(res?.status === 'sent' ? "Invite sent!" : "Invite cancelled");
        setTimeout(() => setShareResult(null), 1500);
      });
      // prevent link click
      if (e) e.preventDefault();
    }
    // else fallback to opening share link in new tab (handled below)
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: 'linear-gradient(100deg, #24154b 60%, #4b267b 100%)',
              borderRadius: 3,
              boxShadow: '0 2px 32px 0 #a259ff26',
              border: `2px solid ${colors.accent}`,
              py: 2,
              px: 2.5,
              mt: 1.5,
              mb: 2
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: 1.1,
                color: colors.accent,
                mb: 0.7
              }}
            >
              Invite your friend!
            </Typography>
            <Box
              sx={{
                fontWeight: 700,
                fontSize: 25,
                bgcolor: 'rgba(80,30,130,0.22)',
                color: colors.white,
                px: 2.5,
                py: 1,
                letterSpacing: "0.19em",
                borderRadius: 2,
                display: "inline-flex",
                alignItems: "center",
                boxShadow: colors.glow,
                userSelect: "all",
                mb: 1
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

            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1.3 }}>
              <Button
                variant="outlined"
                onClick={handleCopyInvite}
                sx={{
                  color: colors.accent,
                  borderColor: colors.accent,
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  '&:hover': { background: colors.accentAlt, color: colors.white }
                }}
                size="small"
              >
                Copy Invite Link
              </Button>
              {/* Universal share link, but try showShareDialog first if available */}
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
                onClick={handleShareTelegram}
              >
                <Button
                  variant="contained"
                  sx={{
                    background: colors.accent,
                    color: colors.white,
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.1,
                    boxShadow: colors.glow,
                    letterSpacing: 0.3,
                    '&:hover': { background: colors.accentAlt, color: "#fff" },
                    transition: "background 0.18s"
                  }}
                  size="small"
                  startIcon={<span style={{fontSize: 20}}>✈️</span>}
                >
                  Share in Telegram
                </Button>
              </a>
            </Stack>
            {inviteCopied && (
              <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: 14, mt: 0.4 }}>
                Invite link copied!
              </Typography>
            )}
            {shareResult && (
              <Typography sx={{ color: colors.accent, fontWeight: 700, fontSize: 14, mt: 0.4 }}>
                {shareResult}
              </Typography>
            )}
          </Box>
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
