
import { merge } from 'webpack-merge';
import commonConfig from './webpack.common.js';

const devConfig = {
    mode: 'development',
};

export default merge(commonConfig, devConfig);
