import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { PublisherService } from './publisher.service';
import { Publisher } from './publisher.entity';

type MockRepo<T = any> = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  remove: jest.Mock;
};

const createMockRepo = (): MockRepo => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('PublisherService', () => {
  let service: PublisherService;
  let repo: MockRepo<Publisher>;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublisherService,
        { provide: getRepositoryToken(Publisher), useValue: repo },
      ],
    }).compile();

    service = module.get(PublisherService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create success', async () => {
    const dto = { name: 'Norma' } as any;
    const created = { id: 1, ...dto };

    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('findAll success', async () => {
    const list = [{ id: 1 }] as any[];

    repo.find.mockResolvedValue(list);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalled();
    expect(result).toBe(list);
  });

  it('findOne success', async () => {
    const publisher = { id: 10 } as Publisher;

    repo.findOne.mockResolvedValue(publisher);

    const result = await service.findOne(10);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(result).toBe(publisher);
  });

  it('findOne not found → throws', async () => {
    repo.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update success', async () => {
    const existing = { id: 2, name: 'Old' } as any;
    const dto = { name: 'New' };
    const saved = { id: 2, name: 'New' };

    jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    repo.save.mockResolvedValue(saved);

    const result = await service.update(2, dto);

    expect(service.findOne).toHaveBeenCalledWith(2);
    expect(repo.save).toHaveBeenCalledWith({ ...existing, ...dto });
    expect(result).toBe(saved);
  });

  it('remove success', async () => {
    const existing = { id: 3 } as Publisher;

    jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    repo.remove.mockResolvedValue(undefined);

    await service.remove(3);

    expect(service.findOne).toHaveBeenCalledWith(3);
    expect(repo.remove).toHaveBeenCalledWith(existing);
  });
});
