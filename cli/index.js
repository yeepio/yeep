#!/usr/bin/env node
if (process.env.NODE_ENV === 'development') {
  require('@babel/register');
}
require('./cli');
