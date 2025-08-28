module.exports = {
  apps: [{
    name: 'demomenu-backend',
    script: 'server.js',
    cwd: '/opt/demomenu/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: '/var/log/demomenu/error.log',
    out_file: '/var/log/demomenu/out.log',
    log_file: '/var/log/demomenu/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    watch: false,
    ignore_watch: ['node_modules', 'uploads', 'logs']
  }]
};