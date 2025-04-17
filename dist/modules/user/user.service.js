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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const Models_1 = require("../../temp/entities/Models");
const field_utils_1 = require("../../core/utils/field.utils");
const prisma_service_1 = require("../../prisma/prisma.service");
const field_chain_service_1 = require("../../core/fields/services/field-chain.service");
const fields_service_1 = require("../../core/fields/fields.service");
const fields_1 = require("../../core/fields/fields");
const enitities_functions_1 = require("../../core/utils/enitities-functions");
const api_error_1 = require("../../core/exceptions/api.error");
const uuid_1 = require("uuid");
const bcryptjs_1 = require("bcryptjs");
let UserService = class UserService {
    constructor(prisma, fieldChainService, fieldsService) {
        this.prisma = prisma;
        this.fieldChainService = fieldChainService;
        this.fieldsService = fieldsService;
    }
    async getUsers(users, usersFields) {
        if (users.length === 0) {
            return [];
        }
        const chaines = await this.fieldChainService.findMany({
            sourceName: Models_1.Models.Table.Users,
            sourceId: { in: users.map(c => c.id) },
        });
        const customRoles = await this.prisma.roles.findMany();
        const result = users.map(user => ({
            id: user.id,
            email: user.email,
            password: user.password,
            isActivated: user.isActivated,
            activationLink: user.activationLink,
            roleLevel: user.roleLevel,
            deleted: user.deleted,
            customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
            fields: (0, field_utils_1.getFieldsWithValues)(usersFields, chaines, user.id)
        }));
        return result;
    }
    async findAll() {
        const [users, relatedFields] = await Promise.all([
            this.prisma.users.findMany(),
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.User)
        ]);
        let list = await this.getUsers(users, relatedFields);
        return {
            list: list,
            total: users.length
        };
    }
    async findMany(query) {
        const { page, size, sortOrder, sortField, } = query;
        delete query['page'];
        delete query['size'];
        delete query['sortOrder'];
        delete query['sortField'];
        const naturalFields = [
            'email',
            'password',
            'isActivated',
            'activationLink',
            'roleLevel',
            'deleted',
        ];
        let naturalQuery = {};
        for (const key in query) {
            if (Object.prototype.hasOwnProperty.call(query, key)) {
                if (naturalFields.includes(key)) {
                    naturalQuery[key] = query[key];
                    delete query[key];
                }
            }
        }
        if (sortField && sortOrder && naturalFields.includes(sortField)) {
            naturalQuery = {
                ...naturalQuery,
                sortField,
                sortOrder
            };
        }
        const searchUsersIds = (Object.values(naturalQuery).length ? await this.fieldChainService.getEntityIdsByQuery(Models_1.Models.Table.Users, fields_1.FieldDomains.User, query) : []).map(id => +id);
        const naturalSearchUsersIds = Object.values(naturalQuery).length || (sortField && naturalFields.includes(sortField)) ? await (0, enitities_functions_1.getEntityIdsByNaturalQuery)(this.prisma.users, naturalQuery) : [];
        let usersIds = [...searchUsersIds].map(id => +id);
        if (searchUsersIds.length && naturalSearchUsersIds.length) {
            usersIds = searchUsersIds.filter(id => naturalSearchUsersIds.includes(id)).map(id => +id);
        }
        if (!searchUsersIds.length && naturalSearchUsersIds.length) {
            usersIds = [...naturalSearchUsersIds];
        }
        if (sortField && sortOrder && !naturalFields.includes(sortField)) {
            const sortFieldConfig = await this.prisma.fields.findFirst({ where: {
                    name: sortField
                } });
            if (sortFieldConfig && searchUsersIds.length) {
                const sortChaines = await this.fieldChainService.findMany({
                    fieldId: sortFieldConfig.id,
                    sourceId: { in: searchUsersIds.map(id => +id) },
                    sourceName: Models_1.Models.Table.Users,
                }, sortOrder.toLowerCase());
                usersIds = sortChaines.map(ch => ch.sourceId);
            }
        }
        if (page && size) {
            const start = (+page - 1) * +size;
            usersIds = usersIds.slice(start, start + +size);
        }
        const users = usersIds.length > 0 ? await this.prisma.users.findMany({ where: {
                id: { in: usersIds.map(id => +id) }
            } }) : [];
        const [usersFields,] = await Promise.all([
            this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.User),
        ]);
        let list = await this.getUsers(users, usersFields);
        ;
        return {
            list: list,
            total: searchUsersIds.length
        };
    }
    async create(createUserDto) {
        const existUser = await this.prisma.users.findFirst({ where: { email: createUserDto.email } });
        if (existUser) {
            throw api_error_1.ApiError.BadRequest(`User with ${createUserDto.email} exists`);
        }
        const activationLink = (0, uuid_1.v4)();
        createUserDto.password = await (0, bcryptjs_1.hash)(createUserDto.password, 3);
        if (!createUserDto.isActivated) {
            createUserDto = Object.assign({}, createUserDto, { activationLink });
        }
        const fields = [...createUserDto.fields];
        delete createUserDto.fields;
        const user = await this.prisma.users.create({ data: createUserDto });
        await Promise.all(fields.map(f => this.fieldChainService.create({
            sourceId: user.id,
            fieldId: f.id,
            value: f.value,
            sourceName: Models_1.Models.Table.Users
        })));
        if (!createUserDto.isActivated) {
        }
        return user;
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await (0, bcryptjs_1.hash)(updateUserDto.password, 3);
        }
        const fields = [...updateUserDto.fields];
        delete updateUserDto.fields;
        const user = await this.prisma.users.update({ where: { id: id }, data: updateUserDto });
        const existsFieldChains = (await Promise.all(fields.map(f => this.fieldChainService.findMany({
            fieldId: f.id,
            sourceId: id,
            sourceName: Models_1.Models.Table.Users
        })))).reduce((prev, cur) => [...prev, ...cur], []);
        const existFieldIds = existsFieldChains.map(ef => +ef.fieldId);
        const existsFields = fields.filter(f => existFieldIds.includes(+f.id));
        const nonExistFields = fields.filter(f => !existFieldIds.includes(+f.id));
        existsFields.length > 0 && await Promise.all(existsFields.map(f => this.fieldChainService.update({
            value: f.value
        }, {
            fieldId: f.id,
            sourceId: id,
            sourceName: Models_1.Models.Table.Users
        })));
        nonExistFields.length > 0 && await Promise.all(nonExistFields.map(f => this.fieldChainService.create({
            fieldId: f.id,
            sourceId: id,
            sourceName: Models_1.Models.Table.Users,
            value: f.value,
        })));
        return user;
    }
    async remove(id) {
        const user = await this.prisma.users.update({ where: { id }, data: { deleted: true } });
        return user;
    }
    async findOne(id) {
        const user = await this.prisma.users.findUnique({ where: { id } });
        const relatedFields = await this.fieldsService.getFieldsByDomain(fields_1.FieldDomains.User);
        const chaines = await this.fieldChainService.findMany({
            sourceName: Models_1.Models.Table.Users,
            sourceId: id,
        });
        const customRoles = await this.prisma.roles.findMany();
        const result = {
            id: user.id,
            email: user.email,
            isActivated: user.isActivated,
            deleted: user.deleted,
            roleLevel: user.roleLevel,
            customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
            fields: (0, field_utils_1.getFieldsWithValues)(relatedFields, chaines, user.id)
        };
        return result;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, field_chain_service_1.FieldChainService, fields_service_1.FieldsService])
], UserService);
//# sourceMappingURL=user.service.js.map