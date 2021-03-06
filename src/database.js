const { Client } = require("pg");

const populateTable = async (table, tableConfig) => {
  const client = new Client();
  await client.connect();

  const query = Object.entries(tableConfig).reduce((acc, [id, columns]) => `
    ${acc}
    INSERT INTO ${table}
    (id, ${Object.keys(columns).join(",")})
    VALUES
    (${id}, ${Object.values(columns).join(",")});
  `, "");

  try {
    await client.query(query);
  } catch {
    throw new Error(`Fail to populate table ${table}. Aborting.`);
  }

  client.end();
};

const generateTable = async (table, tableConfig) => {
  const columns = Object.keys(Object.values(tableConfig)[0]);
  const client = new Client();
  await client.connect();

  // Slice to remove the last "," in the columns
  const query = `
    DROP TABLE IF EXISTS ${table};
    CREATE TABLE ${table} (
      id int primary key,
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

  try {
    const promises = Object.entries(values).map(async ([id, columns]) => {
      const { rows: [{ count }] } = await client.query(`SELECT count(id) FROM ${table} WHERE id = ${id}`);
      if (Number(count)) {
        return await client.query(`
          UPDATE ${table} SET
          ${Object.entries(columns)
            .map(([key, value]) => `${key}=${value}`)
            .join(",")}
          WHERE id = ${id};
        `);
      } else {
        return await client.query(`
          INSERT INTO ${table}
          (id, ${Object.keys(columns).join(",")})
          VALUES
          (${id}, ${Object.values(columns).join(",")});
        `);
      }
    })
    await Promise.all(promises)
  } catch {
    throw new Error(`Fail to restore table ${table} from logs.`);
  }

  client.end();
};

exports.generateTable = generateTable;
exports.populateTable = populateTable;
exports.updateValues = updateValues;
