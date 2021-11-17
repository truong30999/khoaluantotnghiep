const config = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "mysecretkey",
  backend_domain: process.env.BACKEND_DOMAIN || "http://localhost:8080",
  frontend_domain: process.env.BACKEND_DOMAIN || "http://localhost:3000",
  API_ACCESS_TOKEN: "aBqgq-LZ2rnbcOOOPTnMTOJsmtwAwX4G"
};

module.exports = config;
