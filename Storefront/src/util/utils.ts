import winston from 'winston';
import config from 'config';

const logger = winston.createLogger({
    level: `${config.get('storefront.logging.default')}`,
    format: winston.format.json(),
    //defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ]
});

export {logger}