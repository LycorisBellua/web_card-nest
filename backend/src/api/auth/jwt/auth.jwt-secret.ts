const jwt_secret = process.env.JWT_SECRET;

if (!jwt_secret) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const jwtConstants = {
  secret: jwt_secret,
};
