const { Client } = require("pg");

const populateTable = async (table, tableConfig) => {
  const client = new Client();
  await client.connect();

  const query = `
    INSERT INTO ${table}
    (${Object.keys(tableConfig).join(",")})
    VALUES
    (${Object.values(tableConfig).join(",")});
  `;

  try {
    await client.query(query);
  } catch {
    throw new Error(`Fail to populate table ${table}. Aborting.`);
  }

  client.end();
};

const generateTable = async (table, tableConfig) => {
  const columns = Object.keys(tableConfig);
  const client = new Client();
  await client.connect();

  // Slice to remove the last "," in the columns
  const query = `
    DROP TABLE IF EXISTS ${table};
    CREATE TABLE ${table} (
      ${columns.map((column) => `${column} int`).join(",")}
    );
  `;
  try {
    await client.query(query);
  } catch {
    throw new Error(`Fail to create table ${table}. Aborting.`);
  }
  client.end();
};

const updateValues = async (table, values) => {
  const client = new Client();
  await client.connect();

  const query = `
    UPDATE ${table} SET
    ${Object.entries(values)
      .map(([key, value]) => `${key}=${value}`)
      .join(",")};
  `;

  try {
    await client.query(query);
  } catch {
    throw new Error(`Fail to restore table ${table} from logs.`);
  }

  client.end();
};

exports.generateTable = generateTable;
exports.populateTable = populateTable;
exports.updateValues = updateValues;
