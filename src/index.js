require("dotenv").config();

const app = () => {
  console.log(process.env.PGUSER)
}

module.exports = app;
