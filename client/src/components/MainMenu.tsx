import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Avatar,
  Divider,
  Alert,
  Paper,
  Tooltip
} from "@mui/material";
import { getTelegramUser } from "../utils/telegram";

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

const MainMenu: React.FC<{
  onQuickPlay: () => void;
  onCreatePrivate: () => void;
  onJoinPrivate: (code: string) => void;
  error: string | null;
  lobbyCode: string | null;
}> = ({ onQuickPlay, onCreatePrivate, onJoinPrivate, error, lobbyCode }) => {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const user = getTelegramUser();

  function handleJoin() {
    if (code.trim().length > 2) {
      onJoinPrivate(code.trim().toUpperCase());
    }
  }
  function handleCopy() {
    if (lobbyCode) {
      navigator.clipboard.writeText(lobbyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
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
      <Paper
        elevation={10}
        sx={{
          p: { xs: 2.5, sm: 4 },
          minWidth: 320,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2, // smaller radius!
          boxShadow: `0 8px 40px 0 ${colors.accentAlt}`,
          bgcolor: colors.cardGlass,
          backdropFilter: "blur(12px)",
          border: `1.5px solid ${colors.accentAlt}`,
          mx: { xs: 1.5, sm: 2 }
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <Avatar
            src={user?.photo_url}
            sx={{
              width: 60,
              height: 60,
              bgcolor: colors.accent,
              fontSize: 30,
              boxShadow: colors.glow,
              border: `1.5px solid ${colors.white}`
            }}
          >
            {(!user?.photo_url && user?.first_name)
              ? user.first_name[0].toUpperCase()
              : null}
          </Avatar>

          <Typography
            variant="h5"
            sx={{
              color: colors.white,
              fontWeight: 600,
              letterSpacing: 1.3,
              display: "flex",
              alignItems: "center"
            }}
          >
            Welcome,&nbsp;
            <span style={{ color: colors.accent, fontWeight: 700 }}>
              {user?.first_name || user?.username || "Player"}!
            </span>
          </Typography>

          <Button
            variant="contained"
            onClick={onQuickPlay}
            fullWidth
            sx={{
              background: colors.accentAlt,
              color: colors.white,
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 1.5,
              py: 1.2,
              boxShadow: colors.glow,
              mb: 0.5,
              '&:hover': {
                background: colors.accent,
                color: "#fff"
              },
              transition: "background 0.18s"
            }}
          >
            Quick Play <span style={{
            fontSize: 14,
            fontWeight: 500,
            marginLeft: 8,
            opacity: 0.82
          }}>(PvP)</span>
          </Button>

          <Divider
            flexItem
            sx={{
              color: colors.accent,
              borderColor: colors.divider,
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: 1.1,
              my: 0.5
            }}
          >or</Divider>

          <Button
            variant="contained"
            onClick={onCreatePrivate}
            fullWidth
            sx={{
              background: colors.accent,
              color: colors.white,
              fontWeight: 700,
              fontSize: 17,
              borderRadius: 1.5,
              py: 1.1,
              boxShadow: colors.glow,
              '&:hover': {
                background: "#5a2776"
              },
              transition: "background 0.18s"
            }}
          >
            Create Private Game
          </Button>

          {lobbyCode && (
            <Stack spacing={1} alignItems="center" width="100%">
              <Typography
                variant="body2"
                sx={{
                  color: colors.white,
                  opacity: 0.85
                }}
              >
                Share this code with a friend:
              </Typography>
              <Box
                sx={{
                  fontSize: 22,
                  letterSpacing: 2,
                  fontWeight: 700,
                  bgcolor: "rgba(80,30,130,0.18)",
                  color: colors.accent,
                  p: "8px 14px",
                  borderRadius: 2,
                  boxShadow: colors.glow,
                  display: "flex",
                  alignItems: "center",
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
          )}

          <Divider
            flexItem
            sx={{
              color: colors.accent,
              borderColor: colors.divider,
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: 1.1,
              my: 0.5
            }}
          >or join by code</Divider>

          <TextField
            label="Private Game Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            variant="outlined"
            fullWidth
            autoComplete="off"
            sx={{
              bgcolor: colors.inputBg,
              mt: 0.5,
              // Label color (default)
              "& .MuiInputLabel-root": {
                color: colors.accent,
                opacity: 0.75,
                fontWeight: 600,
                letterSpacing: 1
              },
              // Label color (focused)
              "& .MuiInputLabel-root.Mui-focused": {
                color: colors.accent,
                opacity: 1
              },
              // Border color (default)
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.accentAlt,
              },
              // Border color (hover)
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.accent,
              },
              // Border color (focused)
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.accent,
                boxShadow: `0 0 0 2px ${colors.accent}33`, // a little purple glow
              },
              // Input text style
              "& .MuiInputBase-input": {
                color: colors.white,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontSize: 17
              }
            }}
            inputProps={{
              maxLength: 10,
              style: { textTransform: "uppercase" }
            }}
          />
          <Button
            variant="outlined"
            onClick={handleJoin}
            fullWidth
            disabled={code.length < 3}
            sx={{
              border: `2px solid ${colors.accent}`,
              color: colors.accent,
              fontWeight: 600,
              borderRadius: 1.5,
              fontSize: 16,
              py: 1,
              transition: "all 0.15s",
              '&:hover': {
                borderColor: colors.accentAlt,
                color: colors.white,
                background: colors.accentAlt,
                boxShadow: colors.glow
              }
            }}
          >
            Join Private Game
          </Button>

          {error && (
            <Alert
              severity="error"
              sx={{
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
        </Stack>
      </Paper>
    </Box>
  );
};

export default MainMenu;
