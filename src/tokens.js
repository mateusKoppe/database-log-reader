const getTableConfig = (line) => {
  const tableConfigRegex = /((\s*[a-zA-Z]+=\d+\s*\|)*((\s*[a-zA-Z]+=\d+\s*)))/g;

  if (!tableConfigRegex.exec(line)) throw new Error("Fail to get table config");
  const groups = line.split("|");

  const groupRegex = /([a-zA-Z])=(\d+)/;
  const formatGroup = (group) => {
    const result = groupRegex.exec(group.replace(" ", ""));
    if (!result) throw new Error(`Fail to get column config on group ${group}`);
    // Return {firstGroup: secondGroup} found in the regex
    return {
      [result[1]]: Number(result[2]),
    };
  };

  // Sum all groups
  return groups.reduce(
    (acc, group) => ({
      ...acc,
      ...formatGroup(group),
    }),
    {}
  );
};

const getLogTokens = (lines) => {
  const tokenTypes = {
    transactionStart: {
      regex: /<start (T\d+)>/i,
      formatData: (value) => ({
        name: value[1],
      }),
    },
    transactionChange: {
      regex: /<(T\d+),([A-Z]),(\d+)>/i,
      formatData: (value) => ({
        transaction: value[1],
        column: value[2],
        value: Number(value[3]),
      }),
    },
    transactionCommit: {
      regex: /<commit (T\d+)>/i,
      formatData: (value) => ({
        transaction: value[1],
      }),
    },
    checkpointStart: {
      regex: /<start checkpoint\(((T\d+,)+(T\d+))\)>/i,
      formatData: (value) => ({
        transactions: value[1].split(","),
      }),
    },
    checkpointEnd: {
      regex: /<end checkpoint>/i,
      formatData: () => null,
    },
  };

  return lines.map((value) => {
    const [tokenKey, tokenTypeHandler] =
      Object.entries(tokenTypes).find(([_, t]) => t.regex.exec(value)) || [];
    if (!tokenTypeHandler) throw new Error(`Invalid ${value} token`);

    return {
      type: tokenKey,
      data: tokenTypeHandler.formatData(tokenTypeHandler.regex.exec(value)),
    };
  });
};

exports.getTableConfig = getTableConfig;
exports.getLogTokens = getLogTokens;
