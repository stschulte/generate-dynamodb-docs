#!/usr/bin/env node

import { cli } from './cli.js';

// we use a top level await to make this easier to test
void await cli(process.argv);
