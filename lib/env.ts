import {parseEnv} from './env-schema';

export {parseEnv, type AppEnv} from './env-schema';

export const env = parseEnv(process.env);
