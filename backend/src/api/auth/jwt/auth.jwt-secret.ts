const jwt_access_secret = process.env.JWT_ACCESS_SECRET;

if (!jwt_access_secret) {
  throw new Error('JWT_ACCESS_SECRET environment variable is not set');
}

export const jwtConstants = {
  accessSecret: jwt_access_secret,
};
