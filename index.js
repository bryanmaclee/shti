"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var syntax_js_1 = require("./syntax.js");
var Files = {
    inTest: "./tests/fullTest.scrml",
    outputFile: "out/output.json",
    outputText: "out/output.txt",
    astFile: "out/ast.json",
    syntaxFile: "out/syntax.js",
    program: "out/program.json",
    tokens: "out/tokens.json",
};
var args = process.argv.slice(2);
var testFile = "";
if (args[0]) {
    testFile = args[0];
}
else {
    testFile = Files.inTest;
}
console.log(testFile);
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var datastr, dataStart, data, lexed, code, ast;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Bun.file(testFile).text()];
                case 1:
                    datastr = _a.sent();
                    dataStart = datastr.includes("((BEGIN))")
                        ? datastr.substring(datastr.indexOf("((BEGIN))") + 9)
                        : datastr;
                    data = dataStart.includes("((END))")
                        ? dataStart.substring(0, dataStart.indexOf("((END))"))
                        : dataStart;
                    lexed = lex(data);
                    if (!lexed) return [3 /*break*/, 5];
                    return [4 /*yield*/, Bun.write(Files.tokens, JSON.stringify(lexed, null, 2))];
                case 2:
                    _a.sent();
                    code = assembleOutput(lexed);
                    return [4 /*yield*/, Bun.write("out/code.html", code)];
                case 3:
                    _a.sent();
                    ast = generateAst(lexed);
                    return [4 /*yield*/, Bun.write(Files.astFile, JSON.stringify(ast, null, 2))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    console.log("DID NOT COMPLETE");
                    _a.label = 6;
                case 6:
                    console.log("Tokens written to output file.");
                    return [2 /*return*/];
            }
        });
    });
})();
function generateAst(tokens, opener, ast) {
    if (opener === void 0) { opener = ""; }
    if (ast === void 0) { ast = []; }
    var openerScope = 0;
    var indentLevel = 0;
    var context = "script";
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var sb = {};
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
                if (openerScope < 0)
                    return ast;
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
var shti = {
    component: function (name, attributes) {
        name = name;
    },
};
function assembleOutput(tokens) {
    // console.log("got here bitches!");
    var outCode = "";
    var scope = 0;
    var context = "";
    var indent = "  ";
    tokens.forEach(function (token) {
        switch (token.type) {
            case "script_opener":
                outCode += "<script> ";
                scope++;
                break;
            case "close_curly":
                scope--;
                if (scope === 0) {
                    outCode += "</script> ";
                }
                else {
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
                var indentation = "";
                for (var i = 0; i < scope; i++) {
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
function lex(input) {
    var tokens = [];
    var position = 0;
    var start = {
        line: 1,
        col: 1,
    };
    var end = {
        line: 1,
        col: 1,
    };
    var line = 1;
    var col = 1;
    var limiter = 0;
    var repeater = 0;
    function getTagName(tag) {
        var match = tag.match(/^<\s*\/?\s*([a-zA-Z][\w-]*)/);
        return match && match[1] ? match[1].toLowerCase() : null;
    }
    while (position < input.length) {
        var matchFound = false;
        var newLine = true;
        var chunk = input.slice(position);
        var globMl = new RegExp(/\r\n|\r|\n/g);
        for (var i = 0; i < syntax_js_1.tokenTypes.length; i++) {
            var _a = syntax_js_1.tokenTypes[i], test = _a.test, type = _a.type;
            var match = test.exec(chunk);
            var stripped = null;
            if (match) {
                matchFound = true;
                var value = match[0];
                if (chunk.indexOf(match[0]) === 0) {
                    if (type === "document_object" || type === "document_object_closer") {
                        var tagName = getTagName(value);
                        if (tagName !== null) {
                            stripped = tagName;
                        }
                    }
                    if (!stripped)
                        stripped = value;
                    var multiLine = __spreadArray([], value.matchAll(globMl), true);
                    console.log(multiLine, "over");
                    var tempLineNum = line + multiLine.length;
                    var tempColNum = value.length - value.lastIndexOf(globMl);
                    if (type != "whitespace") {
                        tokens.push({ type: type, value: value, stripped: stripped, start: { line: line, col: col }, end: { line: tempLineNum, col: tempColNum } });
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
        }
        else {
            limiter = 0;
        }
        repeater = position;
    }
    return tokens;
}
