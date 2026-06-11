"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const data_source_1 = require("../../data-source");
let UserService = class UserService {
    async testDatabaseConnection() {
        try {
            if (!data_source_1.AppDataSource.isInitialized) {
                await data_source_1.AppDataSource.initialize();
            }
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.release();
            return {
                connected: true,
                message: 'Successfully connected to the database',
            };
        }
        catch (error) {
            return {
                connected: false,
                message: `Failed to connect to database: ${error.message}`,
            };
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)()
], UserService);
//# sourceMappingURL=user.service.js.map