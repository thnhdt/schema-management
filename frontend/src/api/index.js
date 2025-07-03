import * as auth from './auth';
import * as database from './database';
import * as table from './table';
import * as func from './function';
import * as sequence from './sequence';
import * as user from './user';
import * as node from './node';

export * from './auth';
export * from './database';
export * from './table';
export * from './function';
export * from './sequence';
export * from './user';
export * from './node';

export default {
  auth,
  database,
  table,
  function: func,
  sequence,
  user,
  node,
}; 
