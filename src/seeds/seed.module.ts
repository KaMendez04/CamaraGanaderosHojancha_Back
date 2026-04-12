import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeedService } from './seed.service'
import { User } from '../users/entities/user.entity'
import { Role } from '../role/entities/role.entity'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    AuthModule,
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
