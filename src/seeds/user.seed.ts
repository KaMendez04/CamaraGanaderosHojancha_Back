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
    const username = 'Luis Adrian';
    const plainPassword = '123456*';

    const roleName2 = 'JUNTA';
    const email2 = 'junta@gmail.com';
    const username2 = 'Junta';
    const plainPassword2 = '123456*';

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
        username,
        email,
        password: hashedPassword,
        isActive: true,
        role: role,
      } as Partial<User>);

      await userRepo.save(user);
      console.log(`Usuario creado: ${email}`);
    } else {
      user.username = username;
      user.password = hashedPassword;
      user.isActive = true;
      user.role = role;

      await userRepo.save(user);
      console.log(`Usuario actualizado: ${email}`);
    }

    let role2 = await roleRepo.findOne({
      where: { name: roleName2 },
    });

    if (!role2) {
      role2 = roleRepo.create({
        name: roleName2,
      } as Partial<Role>);

      role2 = await roleRepo.save(role2);
      console.log(`Rol creado: ${roleName2}`);
    }

    let user2 = await userRepo.findOne({
      where: { email: email2 },
      relations: ['role'],
    });

    const hashedPassword2 = await encoderService.encodePassword(plainPassword2);

    if (!user2) {
      user2 = userRepo.create({
        username: username2,
        email: email2,
        password: hashedPassword2,
        isActive: true,
        role: role2,
      } as Partial<User>);

      await userRepo.save(user2);
      console.log(`Usuario creado: ${email2}`);
    } else {
      user2.username = username2;
      user2.password = hashedPassword2;
      user2.isActive = true;
      user2.role = role2;

      await userRepo.save(user2);
      console.log(`Usuario actualizado: ${email2}`);
    }

    console.log('Seed completado correctamente.');
  } catch (error) {
    console.error('Error ejecutando seed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();