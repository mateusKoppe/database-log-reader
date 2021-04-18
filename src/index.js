require("dotenv").config();
const readline = require("readline");
const { generateTable, populateTable } = require("./database");
const { getTableConfig, getLogTokens } = require("./tokens");

const app = () => {
  const std = readline.createInterface({
    input: process.stdin,
  });

  const lines = [];

  std.on("line", (line) => lines.push(line));
  std.on("close", function () {
    // Get table config on first line and filter empty logs
    const [tableConfigRaw, ...logs] = lines.filter((x) => x);
    const tableConfig = getTableConfig(tableConfigRaw);
    generateTable("test", tableConfig);
    populateTable("test", tableConfig);
  });
};

module.exports = app;
