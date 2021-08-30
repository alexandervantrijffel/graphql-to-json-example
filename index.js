const parse = require("graphql/language").parse;
const { transform } = require("./transform.js");
const { toJSON } = require("./transform.js");
const fs = require("fs");
const util = require("util");

module.exports = (schema) => {
  if (typeof schema !== "string")
    throw new TypeError("GraphQL Schema must be a string");
  return transform(parse(schema));
};

const parseTypes = (types) => {
  if (!types) return [];
  return types.split(",").map((type) => type.trim());
};

if (require.main === module) {
  const { program } = require("commander");
  program.requiredOption(
    "-s, --schema <schema file>",
    "path to graphql.schema file"
  );
  program.requiredOption(
    "-t, --types <graphql types>",
    "GraphQL types to include, separated by comma's. Example AType,AnotherType"
  );
  program.parse(process.argv);

  const options = program.opts();
  const types = parseTypes(options.types);

  if (!types.length) {
    console.error(
      "One or more GraphQL types are required. Specify with --types Foo,Bar"
    );
    return;
  }

  console.log("Parsing file " + options.schema);
  const mockGraphQLProduct = fs.readFileSync(options.schema, {
    encoding: "utf-8",
  });

  const parsed = parse(mockGraphQLProduct);
  const result = toJSON(parsed.definitions, types);
  console.log(
    "Json input for graphql types " +
      (!types.length ? "all types" : types.join())
  );
  console.log(util.inspect(result, false, (depth = 99), true));
}
