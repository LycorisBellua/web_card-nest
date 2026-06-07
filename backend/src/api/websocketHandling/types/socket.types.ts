import { Socket, DefaultEventsMap } from 'socket.io';
import { JwtPayload } from 'src/api/auth/jwt/auth.jwt-payload';

export interface SocketData {
  user: JwtPayload;
}

export type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
