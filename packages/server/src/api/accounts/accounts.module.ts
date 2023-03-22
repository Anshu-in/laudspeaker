import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { Account } from './entities/accounts.entity';
import { AccountsService } from './accounts.service';
import { AuthModule } from '../auth/auth.module';
import { CustomersModule } from '../customers/customers.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    forwardRef(() => AuthModule),
    forwardRef(() => CustomersModule),
    WebhooksModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, S3Service],
  exports: [AccountsService],
})
export class AccountsModule {}
