import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { PrismaModule } from './prisma/prisma.service';
import { CoreModule } from './common/core.service';
import { AuthGuard } from './common/auth.guard';
import { Public } from './common/decorators';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { ProductsModule } from './products/products.module';
import { MessagesModule } from './messages/messages.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { StateModule } from './state/state.module';

@ApiTags('Santé du service')
@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'pharmaconnect-backend',
      timestamp: new Date().toISOString(),
    };
  }
}

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() || '';
  const weak = new Set(['pharmaconnect-dev-secret-change-in-prod', 'change-me-with-a-long-random-secret']);
  if (secret.length < 32 || weak.has(secret)) {
    throw new Error('JWT_SECRET invalide ou manquant : configurez une chaîne aléatoire d’au moins 32 caractères.');
  }
  return secret;
}

@Module({
  imports: [
    PrismaModule,
    CoreModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: resolveJwtSecret(),
        signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any },
      }),
    }),
    AuthModule,
    PublicModule,
    PharmaciesModule,
    ProductsModule,
    MessagesModule,
    PaymentsModule,
    ReportsModule,
    AdminModule,
    StateModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
