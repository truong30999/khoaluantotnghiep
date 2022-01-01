const config = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "mysecretkey",
  backend_domain: process.env.BACKEND_DOMAIN || "http://localhost:8080",
  frontend_domain: process.env.BACKEND_DOMAIN || "http://localhost:3000",
  API_ACCESS_TOKEN: "aBqgq-LZ2rnbcOOOPTnMTOJsmtwAwX4G",
  API_FIREBASE_PUSH_NOTIFI: "AAAAqS6yhNc:APA91bGdeD624OCVndKXswOr8diqUrFLO-Ex8v5FI2qs8U4tw_z9_WxM42FSjg2Q36g__HbVGQSuUpUkklUgrhrKPHdQj0PlSGG5ron1y-cqUN0uLN5GiePtk_6clCCw0tkChK0jEl4a",
  GOOGLE_CLIENT_ID: "917515198013-tf8flvn0gvpq8p5mj57chd3t1n284pod.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "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"
};

module.exports = config;
