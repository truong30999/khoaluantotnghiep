const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "mysecretkey",
  backend_domain: process.env.BACKEND_DOMAIN || "http://localhost:8080",
  frontend_domain: process.env.BACKEND_DOMAIN || "http://localhost:3000",
  IMAGE_TYPE: {
    CMND: 'CMND',
    ROOM: 'ROOM',
    CUSTOMER: 'CUSTOMER',
    HOUSE: 'HOUSE',
    USER: 'USER'
  }
};

module.exports = config;
