import { tokenTypes, elementTypes, elTypeAr } from "./syntax.js";

const Files = {
  inTest: "./test.scrml",
  outputFile: "out/output.json",
  outputText: "out/output.txt",
  astFile: "out/ast.json",
  syntaxFile: "out/syntax.js",
  program: "out/program.json",
  tokens: "out/tokens.json",
};

(async function () {
  console.log("doin some sht");
  const datastr = await Bun.file(Files.inTest).text();
  const data = datastr.includes("(END)")
    ? datastr.substring(0, datastr.indexOf("(END)"))
    : datastr;
    const lexed = lex(data)
  await Bun.write(Files.outputFile, JSON.stringify(lexed, null, 2));
  console.log("Tokens written to output file.");
})();

const shti = {
  component: function (name: string, attributes: {}) {
    name = name;
  },
};

function findSht(data: string) {
  let context = "markup";
  let cursor = 0;
  let lookAhead = 1;
  while (cursor < data.length) {
    if (data[cursor] === "$") {
      if (data[lookAhead] === "{") {
        context = "script";
        let scopeLevel = 0;
        while (data[lookAhead] !== "}" && scopeLevel > 0) {
          if (data[lookAhead] === "{") {
            scopeLevel++;
          }
        }
      }
      if (data[lookAhead] )
      lookAhead++;
    }
    cursor++;
    lookAhead = cursor + 1;
  }
}

export function lex(input: string) {
  const tokens = [];
  let position = 0;
  let line = 1;
  let col = 1;

  function getTagName(tag: string) {
    const match = tag.match(/^<\s*\/?\s*([a-zA-Z][\w-]*)/);
    return match && match[1] ? match[1].toLowerCase() : null;
  }

  while (position < input.length) {
    let matchFound = false;
    const chunk = input.slice(position);
    for (let i = 0; i < tokenTypes.length; i++) {
      const { test, type } = tokenTypes[i]!;
      const match = test.exec(chunk);
      if (match) {
        matchFound = true;
        const value = match[0];
        if (chunk.indexOf(match[0]) === 0) {
          // if (type === "document_object" || type === "document_object_closer") {
          //   const tagName = getTagName(value);
          //   if (tagName !== null) {
          //     console.log(elTypeAr.indexOf(tagName))
          //   }
          //   console.log(value, tagName);
          // }
          if (type != "whitespace" && type != "new_line") {
            tokens.push({ type, value, line, col });
          }
          if (type === "new_line") {
            line++;
            col = 0;
          }
          position += value.length;
          col += value.length;
          break;
        }
      }
    }
    // console.log(position, input.length, input[position])
    if (!matchFound) {
      throw new SyntaxError(
        `Unexpected token at position ${position}: ${input[position]}`
      );
    }
  }
  return tokens;
}