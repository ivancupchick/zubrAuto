"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fields_service_1 = require("../../core/fields/fields.service");
const fields_1 = require("../../core/fields/fields");
const Models_1 = require("../../temp/entities/Models");
const field_utils_1 = require("../../core/utils/field.utils");
const field_chain_service_1 = require("../../core/fields/services/field-chain.service");
const FieldNames_1 = require("../../temp/entities/FieldNames");
let ClientService = class ClientService {
    constructor(prisma, fieldsService, fieldChainService) {
        this.prisma = prisma;
        this.fieldsService = fieldsService;
        this.fieldChainService = fieldChainService;
    }
    async create(createClientDto) {
        const client = await this.prisma.clients.create({
            data: {
                carIds: createClientDto.carIds
            }
        });
        await Promise.all(createClientDto.fields.map(f => this.fieldChainService.create({
            sourceId: client.id,
            fieldId: f.id,
            value: f.value,
            sourceName: Models_1.Models.Table.Clients
        })));
        return client;
    }
    async findAll() {
        const [clients, relatedFields] = await Promise.all([
            this.prisma.clients.findMany(),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Client)
        ]);
        let list = await this.getClients(clients, relatedFields);
        return {
            list: list,
            total: clients.length
        };
    }
    async findMany(query) {
        const { page, size, sortOrder, sortField, } = query;
        delete query['page'];
        delete query['size'];
        delete query['sortOrder'];
        delete query['sortField'];
        const searchClientsIds = await this.fieldChainService.getEntityIdsByQuery(Models_1.Models.Table.Clients, fields_1.FieldDomains.Client, query);
        let clientsIds = [...searchClientsIds];
        if (sortField && sortOrder) {
            const sortFieldConfig = await this.prisma.fields.findFirst({ where: { name: sortField } });
            if (sortFieldConfig && searchClientsIds.length) {
                const sortChaines = await this.fieldChainService.findMany({
                    fieldId: sortFieldConfig.id,
                    sourceId: { in: searchClientsIds.map(id => +id) },
                    sourceName: Models_1.Models.Table.Clients,
                }, sortOrder.toLowerCase());
                clientsIds = sortChaines.map(ch => `${ch.sourceId}`);
            }
        }
        if (page && size) {
            const start = (+page - 1) * +size;
            clientsIds = clientsIds.slice(start, start + +size);
        }
        const clientsResults = clientsIds.length > 0
            ? await this.prisma.clients.findMany({
                where: {
                    id: { in: clientsIds.map((id) => +id) },
                },
            })
            : [];
        const clients = clientsIds.map(id => clientsResults.find(cr => +cr.id === +id));
        const [clientsFields,] = await Promise.all([
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Client),
        ]);
        let list = await this.getClients(clients, clientsFields);
        ;
        return {
            list: list,
            total: searchClientsIds.length
        };
    }
    async getClients(clients, clientsFields) {
        const chaines = clients.length > 0 ? await this.fieldChainService.findMany({
            sourceName: Models_1.Models.Table.Clients,
            sourceId: { in: clients.map(c => c.id) },
        }) : [];
        const result = clients.map(client => ({
            id: client.id,
            carIds: client.carIds,
            fields: (0, field_utils_1.getFieldsWithValues)(clientsFields, chaines, client.id)
        }));
        return result;
    }
    async findOne(id) {
        const client = await this.prisma.clients.findUnique({ where: { id } });
        const relatedFields = await this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Client);
        const chaines = await this.fieldChainService.findMany({
            sourceName: Models_1.Models.Table.Clients,
            sourceId: id,
        });
        const result = {
            id: client.id,
            carIds: client.carIds,
            fields: (0, field_utils_1.getFieldsWithValues)(relatedFields, chaines, client.id)
        };
        return result;
    }
    async update(id, updateClientDto) {
        const client = await this.prisma.clients.update({ where: { id }, data: {
                carIds: updateClientDto.carIds
            } });
        const existsFieldChains = (await Promise.all(updateClientDto.fields.map(f => this.fieldChainService.findMany({
            fieldId: f.id,
            sourceId: id,
            sourceName: Models_1.Models.Table.Clients
        })))).reduce((prev, cur) => [...prev, ...cur], []);
        const existFieldIds = existsFieldChains.map(ef => +ef.fieldId);
        const existsFields = updateClientDto.fields.filter(f => existFieldIds.includes(+f.id));
        const nonExistFields = updateClientDto.fields.filter(f => !existFieldIds.includes(+f.id));
        existsFields.length > 0 && await Promise.all(existsFields.map(f => this.fieldChainService.update({
            value: f.value
        }, {
            fieldId: f.id,
            sourceId: id,
            sourceName: Models_1.Models.Table.Clients,
        })));
        nonExistFields.length > 0 && await Promise.all(nonExistFields.map(f => this.fieldChainService.create({
            fieldId: f.id,
            sourceId: id,
            sourceName: Models_1.Models.Table.Clients,
            value: f.value,
        })));
        return client;
    }
    async remove(id) {
        await this.fieldChainService.deleteMany({
            sourceName: Models_1.Models.Table.Clients,
            sourceId: id,
        });
        const client = await this.prisma.clients.delete({ where: { id } });
        return client;
    }
    async completeDeal(clientId, carId) {
        const [clientFields, carFields,] = await Promise.all([
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Client),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.Car),
        ]);
        const clientStatusField = clientFields.find(cf => cf.name === FieldNames_1.FieldNames.Client.dealStatus);
        const carStatusField = carFields.find(cf => cf.name === FieldNames_1.FieldNames.Car.status);
        const [clientStatusChain, carStatusChain,] = await Promise.all([
            this.fieldChainService.findOne({
                sourceName: Models_1.Models.Table.Clients,
                sourceId: clientId,
                fieldId: clientStatusField.id,
            }),
            this.fieldChainService.findOne({
                sourceName: Models_1.Models.Table.Cars,
                sourceId: carId,
                fieldId: carStatusField.id,
            }),
        ]);
        const clientStatusIndex = clientStatusField.variants.split(',').findIndex(v => v === FieldNames_1.FieldNames.DealStatus.Sold);
        const carStatusIndex = carStatusField.variants.split(',').findIndex(v => v === FieldNames_1.FieldNames.CarStatus.customerService_Sold);
        const clientStatus = `${FieldNames_1.FieldNames.Client.dealStatus}-${clientStatusIndex !== -1 ? clientStatusIndex : 0}`;
        const carStatus = `${FieldNames_1.FieldNames.Car.status}-${carStatusIndex !== -1 ? carStatusIndex : 0}`;
        const res = await Promise.all([
            this.fieldChainService.updateById(clientStatusChain.id, clientStatusChain.fieldId, { value: clientStatus }),
            this.fieldChainService.updateById(carStatusChain.id, clientStatusChain.fieldId, { value: carStatus }),
        ]);
        return res;
    }
};
exports.ClientService = ClientService;
exports.ClientService = ClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, fields_service_1.FieldsService, field_chain_service_1.FieldChainService])
], ClientService);
//# sourceMappingURL=client.service.js.map