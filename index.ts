import { tokenTypes, elementTypes, elTypeAr } from "./syntax.js";

type Token = {
  type: string;
  value: string;
  stripped: string;
  start: {
    line: number;
    col: number;
  };
  end: {
    line: number;
    col: number;
  };

};
const Files = {
  inTest: "./tests/fullTest.scrml",
  outputFile: "out/output.json",
  outputText: "out/output.txt",
  astFile: "out/ast.json",
  syntaxFile: "out/syntax.js",
  program: "out/program.json",
  tokens: "out/tokens.json",
};

const args = process.argv.slice(2);
let testFile = "";
if (args[0]) {
  testFile = args[0];
} else {
  testFile = Files.inTest;
}

console.log(testFile);

(async function () {
  // console.log("doin some sht");
  const datastr = await Bun.file(testFile).text();
  const dataStart = datastr.includes("((BEGIN))")
    ? datastr.substring(datastr.indexOf("((BEGIN))") + 9)
    : datastr;
  const data = dataStart.includes("((END))")
    ? dataStart.substring(0, dataStart.indexOf("((END))"))
    : dataStart;
  const lexed = lex(data);
  if (lexed) {
    await Bun.write(Files.tokens, JSON.stringify(lexed, null, 2));
    const code = assembleOutput(lexed);
    await Bun.write("out/code.html", code);
    const ast = generateAst(lexed);
    await Bun.write(Files.astFile, JSON.stringify(ast, null, 2));
  } else {
    console.log("DID NOT COMPLETE");
  }
  console.log("Tokens written to output file.");
})();

function generateAst(tokens: Token[], opener: string = "", ast: any = []) {
  let openerScope = 0;
  let indentLevel = 0;
  let context = "script";
  for (let i = 0; i < tokens.length; i++) {
    const token: Token = tokens[i]!;
    const sb: any = {};
    if (opener === token.stripped && token.type === "document_object")
      openerScope++;
    if (opener === token.stripped && token.type === "document_object_closer")
      openerScope--;
    switch (token.type) {
      case "document_object":
        sb.token = token;
        sb.children = generateAst(tokens.slice(i + 1), token.stripped);
        break;
      case "document_object_closer":
        sb.token = token;
        sb.children = [];
        if (openerScope < 0) return ast;
        break;
      default:
        sb.token = token;
        sb.children = [];
        break;
    }
    ast.push(sb);
    i += sb.children.length;
  }
  return ast;
}

const shti = {
  component: function (name: string, attributes: {}) {
    name = name;
  },
};

function assembleOutput(tokens: any[]) {
  // console.log("got here bitches!");
  let outCode = "";
  let scope = 0;
  let context = "";
  const indent = "  ";
  tokens.forEach((token) => {
    switch (token.type) {
      case "script_opener":
        outCode += "<script> ";
        scope++;
        break;
      case "close_curly":
        scope--;
        if (scope === 0) {
          outCode += "</script> ";
        } else {
          outCode += token.value + " ";
        }
        break;
      case "open_curly":
        outCode += "{ ";
        scope++;
        break;
      case "keyword":
        switch (token.value) {
          case "component":
            outCode += "const ";
            context = "component";
            break;
        }
        break;
      case "equals":
        outCode += token.value + " ";
        if ((context = "component")) {
        }
        break;
      case "new_line":
        let indentation = "";
        for (let i = 0; i < scope; i++) {
          indentation += indent;
        }
        outCode += token.value + indentation;
        break;
      default:
        outCode += token.value + " ";
    }
  });
  return outCode;
}

function lex(input: string) {
  const tokens = [];
  let position = 0;
  const start = {
    line: 1,
    col: 1,
  };
  const end = {
    line: 1,
    col: 1,
  };
  let line = 1;
  let col = 1;
  let limiter = 0;
  let repeater = 0;

  function getTagName(tag: string) {
    const match = tag.match(/^<\s*\/?\s*([a-zA-Z][\w-]*)/);
    return match && match[1] ? match[1].toLowerCase() : null;
  }

  while (position < input.length) {
    let matchFound = false;
    let newLine = true;
    const chunk = input.slice(position);
    const globMl = new RegExp(/\r\n|\r|\n/g);
    for (let i = 0; i < tokenTypes.length; i++) {
      const { test, type } = tokenTypes[i]!;
      const match = test.exec(chunk);
      let stripped: null | string = null;
      if (match) {
        matchFound = true;
        const value = match[0];
        if (chunk.indexOf(match[0]) === 0) {
          if (type === "document_object" || type === "document_object_closer") {
            const tagName = getTagName(value);
            if (tagName !== null) {
              // console.log(elTypeAr.indexOf(tagName));
              stripped = tagName;
            }
            // console.log(value, tagName);
          }
          if (!stripped) stripped = value;
          const multiLine = [...value.matchAll(globMl)]
          console.log(multiLine, "over")
          const tempLineNum = line+multiLine.length;
          if (type != "whitespace") {
            tokens.push({ type, value, stripped, start: { line, col }, end: { line: tempLineNum, col}});
          }
          if (type === "new_line") {
            // line++;
            col = 0;
            newLine = true;
          }
          line+= multiLine.length;
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
    if (repeater === position) {
      limiter++;
      if (limiter >= 50) {
        console.log(position, input.length, input[position]);
        break;
      }
    } else {
      limiter = 0;
    }
    repeater = position;
  }
  return tokens;
}
