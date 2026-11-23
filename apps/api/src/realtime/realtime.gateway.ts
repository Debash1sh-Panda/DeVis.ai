import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-task')
  handleJoinTask(client: Socket, taskId: string) {
    client.join(`task:${taskId}`);
    this.logger.log(`Client ${client.id} joined task room: ${taskId}`);
  }

  @SubscribeMessage('join-user')
  handleJoinUser(client: Socket, userId: string) {
    if (userId) {
      client.join(`user:${userId}`);
      this.logger.log(`Client ${client.id} joined user room: ${userId}`);
    }
  }

  emit(event: string, taskId: string, data: unknown) {
    if (this.server) {
      this.server.to(`task:${taskId}`).emit(event, data);
    }
  }

  emitToUser(event: string, userId: string, data: unknown) {
    if (this.server) {
      if (userId) {
        this.server.to(`user:${userId}`).emit(event, data);
      } else {
        this.server.emit(event, data);
      }
    }
  }

  broadcast(event: string, data: unknown) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}
