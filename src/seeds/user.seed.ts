import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../app.module';
import { User } from '../users/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { EncoderService } from '../auth/encoder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const roleRepo = app.get<Repository<Role>>(getRepositoryToken(Role));
    const encoderService = app.get(EncoderService);

    const roleName = 'ADMIN';
    const email = 'camara.ganaderos.hojancha1985@gmail.com';
    const plainPassword = '123456*';

    let role = await roleRepo.findOne({
      where: { name: roleName },
    });

    if (!role) {
      role = roleRepo.create({
        name: roleName,
      } as Partial<Role>);

      role = await roleRepo.save(role);
      console.log(`Rol creado: ${roleName}`);
    }

    let user = await userRepo.findOne({
      where: { email },
      relations: ['role'],
    });

    const hashedPassword = await encoderService.encodePassword(plainPassword);

    if (!user) {
      user = userRepo.create({
        email,
        password: hashedPassword,
        isActive: true,
        role,
      } as Partial<User>);

      await userRepo.save(user);
      console.log(`Usuario creado: ${email}`);
    } else {
      user.password = hashedPassword;
      user.isActive = true;
      user.role = role;

      await userRepo.save(user);
      console.log(`Usuario actualizado: ${email}`);
    }

    console.log('Seed completado correctamente.');
  } catch (error) {
    console.error('Error ejecutando seed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();