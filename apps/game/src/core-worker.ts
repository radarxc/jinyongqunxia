import { exposeProjectionCore } from '@tianshu/platform/host';
import content from 'virtual:tianshu-content';
import { createGameSession } from './runtime/session';

exposeProjectionCore(createGameSession(content));
