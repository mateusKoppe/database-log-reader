const loadLogsValues = (logs) => {
  const transactionsStatus = logs
    .filter((t) => t.type == "transactionStart")
    .reduce((acc, t) => ({ ...acc, [t.data.name]: false }), {});

  const getNewCheckpoint = () => ({
    active: false,
    changes: {},
    actions: {},
  });

  let transactionsActions = {};
  let values = {};
  let checkpoint = getNewCheckpoint();
  logs.forEach((log) => {
    console.log({checkpoint, log})
    switch (log.type) {
      case "transactionStart":
        if (checkpoint.active) {
          checkpoint.actions[log.data.name] = {
            commited: false,
            changes: {},
          };
        } else {
          transactionsActions[log.data.name] = {
            commited: false,
            changes: {},
          };
        }
        return;

      case "transactionChange":
        if (checkpoint.active) {
          checkpoint.actions[log.data.transaction].changes[log.data.column] =
            log.data.value;
        } else {
          transactionsActions[log.data.transaction].changes[log.data.column] =
            log.data.value;
        }
        return;

      case "transactionCommit":
        if (checkpoint.active) {
          checkpoint.values = {
            ...checkpoint.values,
            ...checkpoint.actions[log.data.transaction].changes,
          };
          checkpoint.actions[log.data.transaction].commited = true;
        } else {
          transactionsActions[log.data.transaction].commited = true;
          values = {
            ...values,
            ...transactionsActions[log.data.transaction].changes,
          };
        }
        return;

      case "checkpointStart":
        checkpoint = {
          active: true,
          actions: {
            ...transactionsActions,
          },
          values: { ...values },
        };
        return;

      case "checkpointEnd":
        transactionsActions = {
          ...transactionsActions,
          ...checkpoint.actions,
        };
        values = {
          ...values,
          ...checkpoint.values,
        };
        checkpoint = getNewCheckpoint();
    }
  });

  console.log(transactionsActions);
  console.log(values);
};

exports.loadLogsValues = loadLogsValues;
