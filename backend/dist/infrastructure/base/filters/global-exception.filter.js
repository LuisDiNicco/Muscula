"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const authentication_error_1 = require("../../../domain/errors/authentication.error");
const authorization_error_1 = require("../../../domain/errors/authorization.error");
const conflict_error_1 = require("../../../domain/errors/conflict.error");
const entity_not_found_error_1 = require("../../../domain/errors/entity-not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const context = host.switchToHttp();
        const request = context.getRequest();
        const response = context.getResponse();
        if (exception instanceof common_1.HttpException) {
            const statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            const details = typeof exceptionResponse === 'object' ? exceptionResponse : undefined;
            const body = {
                statusCode,
                message: exception.message,
                error: exception.name,
                details,
            };
            response.status(statusCode).json(body);
            return;
        }
        const mapped = this.mapDomainException(exception);
        this.logger.error(`[${request.method}] ${request.url} - ${mapped.error}: ${mapped.message}`);
        response.status(mapped.statusCode).json(mapped);
    }
    mapDomainException(exception) {
        if (exception instanceof entity_not_found_error_1.EntityNotFoundError) {
            return this.makeResponse(common_1.HttpStatus.NOT_FOUND, exception.message, exception.name);
        }
        if (exception instanceof conflict_error_1.ConflictError) {
            return this.makeResponse(common_1.HttpStatus.CONFLICT, exception.message, exception.name);
        }
        if (exception instanceof validation_error_1.ValidationError) {
            return this.makeResponse(common_1.HttpStatus.BAD_REQUEST, exception.message, exception.name);
        }
        if (exception instanceof authentication_error_1.AuthenticationError) {
            return this.makeResponse(common_1.HttpStatus.UNAUTHORIZED, exception.message, exception.name);
        }
        if (exception instanceof authorization_error_1.AuthorizationError) {
            return this.makeResponse(common_1.HttpStatus.FORBIDDEN, exception.message, exception.name);
        }
        return this.makeResponse(common_1.HttpStatus.INTERNAL_SERVER_ERROR, 'Unexpected internal server error', 'InternalServerError');
    }
    makeResponse(statusCode, message, error) {
        return {
            statusCode,
            message,
            error,
        };
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map