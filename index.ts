const Files = {
  inTest: "./test.scrml",
  outputFile: "out/output.json",
  outputText: "out/output.txt",
  astFile: "out/ast.json",
  syntaxFile: "out/syntax.js",
  program: "out/program.json",
  tokens: "out/tokens.json",
};

(async function main() {
  const datastr = await Bun.file(Files.inTest).text();
  const data = datastr.includes("(END)")
    ? datastr.substring(0, datastr.indexOf("(END)"))
    : datastr;
  await Bun.write(Files.outputFile, JSON.stringify(data, null, 2));
  console.log("Tokens written to output file.");
});

const shti = {
    component: function(name: string, attributes: {}){
        name = name;
    }
}



function findSht(data: string) {
  let context = "markup";
  let cursor = 0;
  let lookAhead = 1;
  while (cursor < data.length) {
    if (data[cursor] === "#") {
      if (data[lookAhead] === "{") {
        context = "script";
        let scopeLevel = 0;
        lookAhead++;
        while (data[lookAhead] !== "}" && scopeLevel > 0) {
          if (data[lookAhead] === "{") {
            scopeLevel++;
          }
        }
      }
    }
    cursor++;
    lookAhead = cursor + 1;
  }
}
