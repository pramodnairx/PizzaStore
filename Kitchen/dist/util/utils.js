"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("config"));
const logger = winston_1.default.createLogger({
    level: `${config_1.default.get('kitchenService.logging.default')}`,
    format: winston_1.default.format.json(),
    //defaultMeta: { service: 'user-service' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
        })
    ]
});
exports.logger = logger;
