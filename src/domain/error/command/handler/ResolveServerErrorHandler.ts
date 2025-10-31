import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ResolveServerErrorCommand } from '../ResolveServerErrorCommand';
import { ServerError } from '../../entity/ServerError.entity';

@CommandHandler(ResolveServerErrorCommand)
export class ResolveServerErrorHandler implements ICommandHandler<ResolveServerErrorCommand, void> {
  constructor(
    @InjectRepository(ServerError)
    private readonly serverErrorRepository: Repository<ServerError>,
  ) {}

  async execute(command: ResolveServerErrorCommand): Promise<void> {
    const error = await this.serverErrorRepository.findOne({
      where: { id: command.errorId },
    });

    if (!error) {
      throw new NotFoundException('Server error not found');
    }

    error.resolve();
    await this.serverErrorRepository.save(error);
  }
}
