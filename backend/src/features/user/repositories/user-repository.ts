import { CreateUser, User } from "@/features/user/models/user";
import { EntityRepository } from "@/repositories/unstruct-repository";

export class UserRepository extends EntityRepository<User> {
  protected readonly entityType = "USER";

  // User-specific SK pattern: Simple profile, no hierarchy needed
  protected generateSortKey(id: string, status?: string, timestamp?: string): string {
    return "PROFILE#";
  }

  async createUser(input: CreateUser & { id: string; userId: string }): Promise<User> {
    const user: User = {
      id: input.id,
      email: input.email,
      name: input.name,
      createdAt: new Date().toISOString(),
    };

    return await this.create({ ...user, userId: input.userId }, {
      GSI4PK: `USER#email#${input.email}`,
      GSI4SK: input.id,
    });
  }

  async getUser(id: string): Promise<User | null> {
    return await this.get(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // Now uses efficient GSI4 query instead of scan
    const users = await this.queryByAttribute("email", email);
    return users[0] || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return await this.update(id, updates);
  }

  async deleteUser(id: string): Promise<void> {
    return await this.delete(id);
  }
}
