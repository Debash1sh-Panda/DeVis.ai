import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepository) {}

  async create(data: { email: string; name: string; passwordHash: string }) {
    return this.repo.create(data);
  }

  async findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async findById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
