
import { tokenTypes } from "./syntax.js";

export function lex(input: string) {
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
              stripped = tagName;
            }
          }
          if (!stripped) stripped = value;
          const multiLine = [...value.matchAll(globMl)];
          // console.log(multiLine, "over");
          const tempLineNum = line + multiLine.length;
          const tempColNum = value.length - (value.lastIndexOf("\n") + 1);
          // lookAheadFor(value, />/);
          if (type != "whitespace") {
            tokens.push({
              type,
              value,
              stripped,
              start: { line, col },
              end: { line: tempLineNum, col: tempColNum },
            });
          }
          if (type === "new_line") {
            col = 0;
            newLine = true;
          }
          line += multiLine.length;
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

function lookAheadFor(str: string, quer: RegExp) {
  const ret = str.match(quer);
  console.log(ret);
}