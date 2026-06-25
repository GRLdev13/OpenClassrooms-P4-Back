import { homedir } from 'os';
import { join } from 'path';

export const CURRENT_USER_PATH = process.env.USERPROFILE || homedir();
export const GLOBAL_RESOURCE_PATH = join(CURRENT_USER_PATH, 'DataShare');
export const FILE_RESOURCE_PATH = join(GLOBAL_RESOURCE_PATH, 'files');
