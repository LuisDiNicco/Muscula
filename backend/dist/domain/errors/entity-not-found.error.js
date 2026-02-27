"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNotFoundError = void 0;
class EntityNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EntityNotFoundError';
    }
}
exports.EntityNotFoundError = EntityNotFoundError;
//# sourceMappingURL=entity-not-found.error.js.map