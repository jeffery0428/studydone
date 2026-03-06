import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { validateEnv } from "./common/config/env.validation";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CheckModule } from "./modules/check/check.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { StorageModule } from "./modules/storage/storage.module";
import { StripeModule } from "./modules/stripe/stripe.module";
import { CreditsModule } from "./modules/credits/credits.module";
import { HumanReviewModule } from "./modules/human-review/human-review.module";
import { MeModule } from "./modules/me/me.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StorageModule,
    AuthModule,
    CheckModule,
    ReportsModule,
    StripeModule,
    CreditsModule,
    HumanReviewModule,
    MeModule,
  ],
})
export class AppModule {}

