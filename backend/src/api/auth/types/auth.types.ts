export type JWT = {
  accessToken: string;
};

export type TokenSet = {
  refreshToken: string;
  refreshTimeout: Date;
  accessToken: string;
};

export type RedirectURL = {
  url: string;
};

export type ReturnMessage = {
  message: string;
};
