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
  const lexed = lex(data);
  if (lexed) {
    await Bun.write(Files.outputFile, JSON.stringify(lexed, null, 2));
    const code = assembleOutput(lexed);
    await Bun.write("out/code.html", code);
  } else {
    console.log("DID NOT COMPLETE");
  }
  console.log("Tokens written to output file.");
})();

const shti = {
  component: function (name: string, attributes: {}) {
    name = name;
  },
};

function assembleOutput(tokens: any[]) {
  let outCode = "";
  let scope = 0;
  tokens.forEach((token) => {
    if (token.type === "script_opener") {
      outCode += "<script> ";
      scope++;
    } else if (token.type === "close_curly") {
      scope--;
      if (scope === 0) {
        outCode += "</script> ";
      } else {
        outCode += token.value + " ";
      }
    } else {
      outCode += token.value + " ";
    }
  });
  return outCode;
}

function lex(input: string) {
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
    let newLine = true;
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
          //     console.log(elTypeAr.indexOf(tagName));
          //   }
          //   console.log(value, tagName);
          // }
          if (type != "whitespace") {
            tokens.push({ type, value, line, col });
          }
          if (type === "new_line") {
            line++;
            col = 0;
            newLine = true;
          }
          position += value.length;
          col += value.length;
          newLine = false;
          break;
        }
      } 
      // else {
      //   console.log(
      //     `Unexpected token at position ${position}, line: ${line}, col: ${col} :: ${input[position]}`
      //   );
      //   break;
      //   // return null;
      // }
    }
    // console.log(position, input.length, input[position]);
  }
  return tokens;
}
