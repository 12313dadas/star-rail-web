module.exports = {
  apps: [
    {
      name: 'star-rail-api',
      script: './dist/index.js',
      cwd: '/opt/star-rail-web/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
