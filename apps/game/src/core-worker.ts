import { exposeProjectionCore } from '@tianshu/platform/host';
import content from 'virtual:tianshu-content';
import { loadTown } from 'virtual:tianshu-towns';
import { createGameSession } from './runtime/session';

exposeProjectionCore(createGameSession(content, undefined, loadTown));
