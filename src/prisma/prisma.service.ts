import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  wallet_Currency: any;
  wallet_Balance: any;
  wallet_Transaction: any;

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Database has been connected successfully');
    } catch (error) {
      console.error('Failed to connect to the database', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('Database connection closed successfully');
    } catch (error) {
      console.error('Failed to disconnect from the database', error);
    }
  }
}
