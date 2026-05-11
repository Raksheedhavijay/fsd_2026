const os = require('os');

const getLanIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const getServerBase = () =>
  `http://${getLanIP()}:${process.env.PORT || 5000}`;

module.exports = { getLanIP, getServerBase };
