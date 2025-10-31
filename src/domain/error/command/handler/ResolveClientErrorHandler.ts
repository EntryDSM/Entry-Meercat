import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ResolveClientErrorCommand } from '../ResolveClientErrorCommand';
import { ClientError } from '../../entity/ClientError.entity';

@CommandHandler(ResolveClientErrorCommand)
export class ResolveClientErrorHandler implements ICommandHandler<ResolveClientErrorCommand, void> {
  constructor(
    @InjectRepository(ClientError)
    private readonly clientErrorRepository: Repository<ClientError>,
  ) {}

  async execute(command: ResolveClientErrorCommand): Promise<void> {
    const error = await this.clientErrorRepository.findOne({
      where: { id: command.errorId },
    });

    if (!error) {
      throw new NotFoundException('Client error not found');
    }

    error.resolve();
    await this.clientErrorRepository.save(error);
  }
}
