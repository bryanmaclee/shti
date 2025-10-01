
export function assembleOutput(tokens: any[]) {
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


