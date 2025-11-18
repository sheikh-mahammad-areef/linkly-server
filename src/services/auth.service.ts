//  ------------------------------------------------------------------
//  file: src/services/auth.service.ts
//  Authentication business logic
//  ------------------------------------------------------------------

import { ERROR_CODE_ENUM } from '../enums/error-code.enum';
import { Bookmark } from '../models/bookmark.model';
import { RefreshToken } from '../models/refreshToken.model';
import { User } from '../models/user.model';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '../utils/app-error.utils';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/token.utils';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  totalBookmarks: number;
  memberSince: Date;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictException(
        'Email already registered',
        ERROR_CODE_ENUM.AUTH_EMAIL_ALREADY_EXISTS,
      );
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    // Store refresh token
    await this.storeRefreshToken(String(user._id), refreshToken);

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found', ERROR_CODE_ENUM.AUTH_USER_NOT_FOUND);
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Invalid credentials',
        ERROR_CODE_ENUM.AUTH_INVALID_CREDENTIALS,
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    // Store refresh token
    await this.storeRefreshToken(String(user._id), refreshToken);

    return {
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new BadRequestException(
        'No refresh token provided',
        ERROR_CODE_ENUM.AUTH_REFRESH_TOKEN_NOT_FOUND,
      );
    }

    // Verify token exists in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token', ERROR_CODE_ENUM.AUTH_INVALID_TOKEN);
    }

    // Verify token signature
    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      // Clean up invalid token
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new UnauthorizedException(
        'Expired or invalid refresh token',
        ERROR_CODE_ENUM.AUTH_EXPIRED_TOKEN,
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id);

    return { accessToken: newAccessToken };
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new BadRequestException(
        'No refresh token provided',
        ERROR_CODE_ENUM.AUTH_REFRESH_TOKEN_NOT_FOUND,
      );
    }

    // const result = await RefreshToken.deleteOne({ token: refreshToken });
    // Check if any document was deleted
    // if (result.deletedCount === 0) {
    //   throw new UnauthorizedException(
    //     'Invalid or expired refresh token',
    //     ERROR_CODE_ENUM.AUTH_INVALID_TOKEN,
    //   );
    // }

    //should succeed silently if token does not exist (idempotent)
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    // Delete old refresh tokens for this user
    await RefreshToken.deleteMany({ userId });

    // Store new token
    await RefreshToken.create({
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User not found', ERROR_CODE_ENUM.AUTH_USER_NOT_FOUND);
    }

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get user profile with statistics
   */
  async getProfileWithStats(userId: string): Promise<UserProfile & { stats: UserStats }> {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('User not found', ERROR_CODE_ENUM.AUTH_USER_NOT_FOUND);
    }

    // Get bookmark count
    const bookmarkCount = await Bookmark.countDocuments({ user: userId });

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalBookmarks: bookmarkCount,
        memberSince: user.createdAt,
      },
    };
  }
}

export const authService = new AuthService();
