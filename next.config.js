const path = require('path')
module.exports = {
    swcMinify: false,
    //output: 'export',
    //basePath: '/ArmonicaWeb-Next',
    //assetPrefix: '/ArmonicaWeb-Next/',
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
      },
    webpack: (config, options) => {       

        config.module.rules.push({
            test: /\.(jpe?g|png|svg|gif|ico|eot|ttf|woff|woff2|mp4|wav|pdf|webm|txt)$/,
            type: 'asset/resource',
            generator: {
                filename: 'static/chunks/[path][name].[hash][ext]'
            },
        });
      return config
    },
  }