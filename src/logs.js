const { cloneDeep, merge } = require("lodash");

const restoreFromLogs = (logs) => {
  const getNewCheckpoint = () => ({
    active: false,
    changes: {},
    actions: {},
  });

  const addValue = (values, newValue) =>
    merge(values, {
      [newValue.id]: {
        [newValue.column]: newValue.value
      }
    })

  let transactionsActions = {};
  let values = {};
  let checkpoint = getNewCheckpoint();
  logs.forEach((log) => {
    switch (log.type) {
      case "transactionStart":
        if (checkpoint.active) {
          checkpoint.actions[log.transaction] = {
            commited: false,
            changes: {},
          };
        } else {
          transactionsActions[log.transaction] = {
            commited: false,
            changes: {},
          };
        }
        return;

      case "transactionChange":
        if (checkpoint.active) {
          checkpoint.actions[log.transaction].changes = addValue(
            checkpoint.actions[log.transaction].changes,
            log
          )
        } else {
          transactionsActions[log.transaction].changes = addValue(
            transactionsActions[log.transaction].changes,
            log
          )
        }
        return;

      case "transactionCommit":
        if (checkpoint.active) {
          checkpoint.values = merge(
            checkpoint.values,
            checkpoint.actions[log.transaction].changes
          )
          checkpoint.actions[log.transaction].commited = true;
        } else {
          transactionsActions[log.transaction].commited = true;
          values = merge(
            values,
            transactionsActions[log.transaction].changes,
          )
        }
        return;

      case "checkpointStart":
        checkpoint = {
          active: true,
          actions: cloneDeep(transactionsActions),
          values: cloneDeep(values),
        };
        return;

      case "checkpointEnd":
        transactionsActions = merge(transactionsActions, checkpoint.actions)
        values = merge(values, checkpoint.values)
        checkpoint = getNewCheckpoint();
    }
  });

  const transactionsStatus = Object.entries(transactionsActions).reduce(
    (acc, [transaction, { commited }]) => merge(acc, {
      [transaction]: commited,
    }),
    {}
  );

  return { values, transactionsStatus };
};

exports.restoreFromLogs = restoreFromLogs;
