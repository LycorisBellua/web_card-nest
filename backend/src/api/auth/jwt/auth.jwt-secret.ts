const jwt_access_secret = process.env.JWT_ACCESS_SECRET;
const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET;

if (!jwt_access_secret) {
  throw new Error('JWT_ACCESS_SECRET environment variable is not set');
}

if (!jwt_refresh_secret) {
  throw new Error('JWT_REFRESH_SECRET environment variable is not set');
}

export const jwtConstants = {
  accessSecret: jwt_access_secret,
  refreshSecret: jwt_refresh_secret,
};
