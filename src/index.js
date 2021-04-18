require("dotenv").config();
const readline = require("readline");
const { generateTable, populateTable, updateValues } = require("./database");
const { restoreFromLogs } = require("./logs");
const { getTableConfig, getLogTokens } = require("./tokens");

const app = () => {
  const std = readline.createInterface({
    input: process.stdin,
  });

  const lines = [];

  std.on("line", (line) => lines.push(line));
  std.on("close", async () => {
    // Get table config on first line and filter empty logs
    const [tableConfigRaw, ...logsRaw] = lines.filter((x) => x);
    const logs = getLogTokens(logsRaw);
    const tableConfig = getTableConfig(tableConfigRaw);
    await generateTable("test", tableConfig);
    await populateTable("test", tableConfig);
    const restore = restoreFromLogs(logs);
    await updateValues("test", restore.values);
    Object.entries(restore.transactionsStatus).forEach(
      ([transaction, restored]) => {
        console.log(
          `Transaction ${transaction}: ${restored ? "Restored" : "Unrestored"}`
        );
      }
    );
  });
};

module.exports = app;
