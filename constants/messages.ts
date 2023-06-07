export const MESSAGES = {
  AUTHENTICATION: {
    LOGIN: {
      SUCCESS: 'ログインしました',
      ERROR: 'ログインできませんでした',
    },
    LOGOUT: {
      SUCCESS: 'ログアウトしました',
      ERROR: 'ログアウトできませんでした',
    },
  },
  ROOM: {
    CREATE: {
      SUCCESS: '部屋を作成しました',
      ERROR: '部屋を作成できませんでした',
    },
    ENTER: {
      SUCCESS: '部屋に入室しました',
      ERROR: '部屋に入室できませんでした',
      NOT_FOUND: '部屋が見つかりませんでした',
      FULL: '部屋が満員です',
      PASSWORD: {
        REQUIRED: 'パスワードが必要です',
        INVALID: 'パスワードが間違っています',
      },
    },
  },
}
