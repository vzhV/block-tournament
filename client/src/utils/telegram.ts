// utils/telegram.ts
export function getTelegramUser() {
  // @ts-ignore
  const tg = window?.Telegram?.WebApp;
  if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
    // fallback as before
    return {
      id: "dev-user",
      username: "testuser",
      first_name: "Dev",
      last_name: "User",
      photo_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=DevUser"
    };
  }
  const user = tg.initDataUnsafe.user;
  return {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    photo_url: user.photo_url
  };
}

export function getTelegramAuth() {
  // @ts-ignore
  return window?.Telegram?.WebApp?.initDataUnsafe || {};
}

// utils/telegram.ts
export function getInitData() {
  // @ts-ignore
  return window.Telegram.WebApp.initData || "";
}
