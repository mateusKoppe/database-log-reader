const loadLogsValues = (logs) => {
  const transactionsStatus = logs
    .filter((t) => t.type == "transactionStart")
    .reduce((acc, t) => ({ ...acc, [t.data.name]: false }), {});

  let values = {};
  const transactionsActions = {};
  logs.forEach((log) => {
    console.log(log);
    switch (log.type) {
      case "transactionStart":
        transactionsActions[log.data.name] = {
          commited: false,
          changes: {},
        };
        return;

      case "transactionChange":
        transactionsActions[log.data.transaction].changes[log.data.column] =
          log.data.value;
        return;

      case "transactionCommit":
        transactionsActions[log.data.transaction].commited = true;
        values = {
          ...values,
          ...transactionsActions[log.data.transaction].changes,
        };
        return;
    }
  });

  console.log(transactionsActions);
  console.log(values)
};

exports.loadLogsValues = loadLogsValues;
