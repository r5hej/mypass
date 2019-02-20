'use strict';

import json  from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    external: ['fs', 'express', 'express-session', 'express-formidable', 'bcryptjs', 'camo', 'events'],
    output: {
        file: 'dist/index.js',
        format: 'cjs',
		sourcemap: true
    },
    plugins: [
        commonjs()
    ]
}