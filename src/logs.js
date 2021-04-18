const { cloneDeep } = require("lodash");

const restoreFromLogs = (logs) => {
  const getNewCheckpoint = () => ({
    active: false,
    changes: {},
    actions: {},
  });

  let transactionsActions = {};
  let values = {};
  let checkpoint = getNewCheckpoint();
  logs.forEach((log) => {
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
            ...cloneDeep(transactionsActions),
          },
          values: { ...cloneDeep(values) },
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

  const transactionsStatus = Object.entries(transactionsActions).reduce(
    (acc, [transaction, { commited }]) => ({
      ...acc,
      ...{ [transaction]: commited },
    }),
    {}
  );

  return { values, transactionsStatus };
};

exports.restoreFromLogs = restoreFromLogs;
