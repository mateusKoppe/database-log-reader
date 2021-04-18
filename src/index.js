require("dotenv").config();
const readline = require("readline");
const { generateTable, populateTable, updateValues } = require("./database");
const { restoreFromLogs } = require("./logs");
const { getTableConfig, getLogTokens } = require("./tokens");

const table = "test";

const app = () => {
  const std = readline.createInterface({
    input: process.stdin,
  });

  const lines = [];

  std.on("line", (line) => lines.push(line));
  std.on("close", async () => {
    // Get table config on first line and filter empty logs
    const [tableConfigRaw, ...logsRaw] = lines.filter((x) => x);
    try {
      const logs = getLogTokens(logsRaw);
      const tableConfig = getTableConfig(tableConfigRaw);
      await generateTable(table, tableConfig);
      console.log(`Table ${table} created.`);
      await populateTable(table, tableConfig);
      console.log(`Table ${table} populated.`);
      const { values, transactionsStatus } = restoreFromLogs(logs);
      await updateValues(table, values);
      console.log(`Table ${table} restored from logs.`);
      Object.entries(transactionsStatus).forEach(([transaction, restored]) => {
        console.log(
          `Transaction ${transaction}: ${restored ? "Restored" : "Unrestored"}`
        );
      });
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = app;
