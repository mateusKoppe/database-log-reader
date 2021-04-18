const tableConfigRegex = /((\s*[a-zA-Z]+=\d+\s*\|)*((\s*[a-zA-Z]+=\d+\s*)))/g;

const getTableConfig = (line) => {
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

const generateTokens = (lines) => {};

exports.getTableConfig = getTableConfig;
