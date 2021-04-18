require("dotenv").config();
const readline = require("readline");
const { getTableConfig, getLogTokens } = require("./tokens");

const app = () => {
  const std = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const lines = [];

  std.on("line", (line) => lines.push(line));
  std.on("close", function () {
    // Get table config on first line and filter empty logs
    const [tableConfigRaw, ...logs] = lines.filter((x) => x);
    console.log(getTableConfig(tableConfigRaw));
    console.log(getLogTokens(logs));
  });
};

module.exports = app;
