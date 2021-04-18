const { Client } = require("pg");

const populateTable = async (table, tableConfig) => {
  const client = new Client();
  await client.connect();

  const query = `
    INSERT INTO ${table}
    (${ Object.keys(tableConfig).join(",") })
    VALUES
    (${ Object.values(tableConfig).join(",") });
  `;


  try {
    await client.query(query);
    console.log(`Table ${table} populated.`);
  } catch {
    console.log(`Fail to populate table ${table}. Aborting.`);
  }
  
  client.end();
}

const generateTable = async (table, tableConfig) => {
  const columns = Object.keys(tableConfig);
  const client = new Client();
  await client.connect();

  // Slice to remove the last "," in the columns
  const query = `
    DROP TABLE IF EXISTS ${table};
    CREATE TABLE ${table} (
      ${columns
        .map((column) => `${column} int`)
        .join(",")
      }
    );
  `;
  try {
    await client.query(query);
    console.log(`Table ${table} created.`);
  } catch {
    console.log(`Fail to create table ${table}. Aborting.`);
  }
  client.end();
};

exports.generateTable = generateTable;
exports.populateTable = populateTable;
