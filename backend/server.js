require('dotenv').config({ path: '../.env' });

const app = require('./app');
const config = require('./config/config');

const PORT = config.PORT || 3000;

app.listen(PORT, () => {
  console.log(`QI Credit server is running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Database: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
});