import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth/auth.controller'
import { AuthGuard } from './auth/auth.guard'
import { Store } from './persistence/store'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')?.trim() || 'auctionly-dev-secret',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [Store, AuthGuard, { provide: APP_GUARD, useExisting: AuthGuard }],
})
export class AppModule {}
