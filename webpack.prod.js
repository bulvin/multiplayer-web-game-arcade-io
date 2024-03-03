import commonConfig from './webpack.common.js';
import TerserPlugin from 'terser-webpack-plugin';
import { merge } from 'webpack-merge';

const prodConfig = {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({}),
        ],
    },
};

export default merge(commonConfig, prodConfig);