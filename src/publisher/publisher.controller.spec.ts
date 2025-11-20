import { Test, TestingModule } from '@nestjs/testing';
import { PublisherController } from './publisher.controller';
import { PublisherService } from './publisher.service';

describe('PublisherController', () => {
  let controller: PublisherController;
  let service: jest.Mocked<PublisherService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<PublisherService> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublisherController],
      providers: [{ provide: PublisherService, useValue: mockService }],
    }).compile();

    controller = module.get(PublisherController);
    service = module.get(PublisherService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create', async () => {
    const dto = { name: 'Editorial X' } as any;
    const created = { id: 1, name: 'Editorial X' } as any;

    service.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(created);
  });

  it('findAll', async () => {
    const list = [{ id: 1 }] as any[];
    service.findAll.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toBe(list);
  });

  it('findOne', async () => {
    const pub = { id: 5 } as any;
    service.findOne.mockResolvedValue(pub);

    const result = await controller.findOne(5);

    expect(service.findOne).toHaveBeenCalledWith(5);
    expect(result).toBe(pub);
  });

  it('update', async () => {
    const dto = { name: 'New name' } as any;
    const updated = { id: 2, name: 'New name' } as any;

    service.update.mockResolvedValue(updated);

    const result = await controller.update(2, dto);

    expect(service.update).toHaveBeenCalledWith(2, dto);
    expect(result).toBe(updated);
  });

  it('remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(3);

    expect(service.remove).toHaveBeenCalledWith(3);
  });
});
