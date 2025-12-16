import { Injectable, Inject, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { DrizzleDB } from '../../database/database';
import { users } from '../../database/schema';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, loginDto.email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Save refresh token
    await this.db
      .update(users)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(users.id, user.id));

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, registerDto.email),
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const [newUser] = await this.db
      .insert(users)
      .values({
        email: registerDto.email,
        passwordHash,
        name: registerDto.name,
        role: registerDto.role,
        regionId: registerDto.regionId || null,
      })
      .returning();

    const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.role);

    // Save refresh token
    await this.db
      .update(users)
      .set({ refreshToken: tokens.refreshToken })
      .where(eq(users.id, newUser.id));

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
      });

      const user = await this.db.query.users.findFirst({
        where: eq(users.id, payload.sub),
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Update refresh token
      await this.db
        .update(users)
        .set({ refreshToken: tokens.refreshToken })
        .where(eq(users.id, user.id));

      return { tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.db.update(users).set({ refreshToken: null }).where(eq(users.id, userId));
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        // region: true, // We'll add this when we set up relations
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      regionId: user.regionId,
    };
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: process.env.JWT_SECRET || 'super-secret-key',
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
