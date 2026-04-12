import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { Role } from '../role/entities/role.entity'
import { EncoderService } from '../auth/encoder.service'

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly encoderService: EncoderService,
  ) {}

  async onModuleInit() {
    await this.seedUsers()
  }

  private async seedUsers() {
    try {
      // Verificar si ya existen usuarios
      const userCount = await this.userRepo.count()
      if (userCount > 0) {
        console.log('Usuarios ya existen, omitiendo seed')
        return
      }

      console.log('Iniciando seed de usuarios...')

      // Crear rol ADMIN
      let adminRole = await this.roleRepo.findOne({
        where: { name: 'ADMIN' },
      })

      if (!adminRole) {
        adminRole = this.roleRepo.create({
          name: 'ADMIN',
        })
        adminRole = await this.roleRepo.save(adminRole)
        console.log('Rol ADMIN creado')
      }

      // Crear rol JUNTA
      let juntaRole = await this.roleRepo.findOne({
        where: { name: 'JUNTA' },
      })

      if (!juntaRole) {
        juntaRole = this.roleRepo.create({
          name: 'JUNTA',
        })
        juntaRole = await this.roleRepo.save(juntaRole)
        console.log('Rol JUNTA creado')
      }

      // Crear usuario ADMIN
      const adminPassword = await this.encoderService.encodePassword('123456*')
      const adminUser = this.userRepo.create({
        username: 'Luis Adrian',
        email: 'camara.ganaderos.hojancha1985@gmail.com',
        password: adminPassword,
        isActive: true,
        role: adminRole,
      })
      await this.userRepo.save(adminUser)
      console.log('Usuario ADMIN creado')

      // Crear usuario JUNTA
      const juntaPassword = await this.encoderService.encodePassword('123456*')
      const juntaUser = this.userRepo.create({
        username: 'Junta',
        email: 'junta@gmail.com',
        password: juntaPassword,
        isActive: true,
        role: juntaRole,
      })
      await this.userRepo.save(juntaUser)
      console.log('Usuario JUNTA creado')

      console.log('Seed de usuarios completado exitosamente')
    } catch (error) {
      console.error('Error en seed de usuarios:', error)
    }
  }
}
