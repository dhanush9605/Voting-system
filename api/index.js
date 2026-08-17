var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/node_modules/dotenv/package.json
var require_package = __commonJS({
  "server/node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.6.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// server/node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "server/node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var packageJson = require_package();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (debug || !quiet) {
        const keysCount = Object.keys(parsedAll).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// server/node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "server/node_modules/object-assign/index.js"(exports2, module2) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// server/node_modules/vary/index.js
var require_vary = __commonJS({
  "server/node_modules/vary/index.js"(exports2, module2) {
    "use strict";
    module2.exports = vary;
    module2.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
      if (typeof header !== "string") {
        throw new TypeError("header argument is required");
      }
      if (!field) {
        throw new TypeError("field argument is required");
      }
      var fields = !Array.isArray(field) ? parse(String(field)) : field;
      for (var j = 0; j < fields.length; j++) {
        if (!FIELD_NAME_REGEXP.test(fields[j])) {
          throw new TypeError("field argument contains an invalid header name");
        }
      }
      if (header === "*") {
        return header;
      }
      var val = header;
      var vals = parse(header.toLowerCase());
      if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
        return "*";
      }
      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i].toLowerCase();
        if (vals.indexOf(fld) === -1) {
          vals.push(fld);
          val = val ? val + ", " + fields[i] : fields[i];
        }
      }
      return val;
    }
    function parse(header) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = header.length; i < len; i++) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(header.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(header.substring(start, end));
      return list;
    }
    function vary(res, field) {
      if (!res || !res.getHeader || !res.setHeader) {
        throw new TypeError("res argument is required");
      }
      var val = res.getHeader("Vary") || "";
      var header = Array.isArray(val) ? val.join(", ") : String(val);
      if (val = append(header, field)) {
        res.setHeader("Vary", val);
      }
    }
  }
});

// server/node_modules/cors/lib/index.js
var require_lib = __commonJS({
  "server/node_modules/cors/lib/index.js"(exports2, module2) {
    (function() {
      "use strict";
      var assign = require_object_assign();
      var vary = require_vary();
      var defaults = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204
      };
      function isString(s) {
        return typeof s === "string" || s instanceof String;
      }
      function isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
          for (var i = 0; i < allowedOrigin.length; ++i) {
            if (isOriginAllowed(origin, allowedOrigin[i])) {
              return true;
            }
          }
          return false;
        } else if (isString(allowedOrigin)) {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        } else {
          return !!allowedOrigin;
        }
      }
      function configureOrigin(options, req) {
        var requestOrigin = req.headers.origin, headers = [], isAllowed;
        if (!options.origin || options.origin === "*") {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: "*"
          }]);
        } else if (isString(options.origin)) {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: options.origin
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        } else {
          isAllowed = isOriginAllowed(requestOrigin, options.origin);
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: isAllowed ? requestOrigin : false
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        }
        return headers;
      }
      function configureMethods(options) {
        var methods = options.methods;
        if (methods.join) {
          methods = options.methods.join(",");
        }
        return {
          key: "Access-Control-Allow-Methods",
          value: methods
        };
      }
      function configureCredentials(options) {
        if (options.credentials === true) {
          return {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          };
        }
        return null;
      }
      function configureAllowedHeaders(options, req) {
        var allowedHeaders = options.allowedHeaders || options.headers;
        var headers = [];
        if (!allowedHeaders) {
          allowedHeaders = req.headers["access-control-request-headers"];
          headers.push([{
            key: "Vary",
            value: "Access-Control-Request-Headers"
          }]);
        } else if (allowedHeaders.join) {
          allowedHeaders = allowedHeaders.join(",");
        }
        if (allowedHeaders && allowedHeaders.length) {
          headers.push([{
            key: "Access-Control-Allow-Headers",
            value: allowedHeaders
          }]);
        }
        return headers;
      }
      function configureExposedHeaders(options) {
        var headers = options.exposedHeaders;
        if (!headers) {
          return null;
        } else if (headers.join) {
          headers = headers.join(",");
        }
        if (headers && headers.length) {
          return {
            key: "Access-Control-Expose-Headers",
            value: headers
          };
        }
        return null;
      }
      function configureMaxAge(options) {
        var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
        if (maxAge && maxAge.length) {
          return {
            key: "Access-Control-Max-Age",
            value: maxAge
          };
        }
        return null;
      }
      function applyHeaders(headers, res) {
        for (var i = 0, n = headers.length; i < n; i++) {
          var header = headers[i];
          if (header) {
            if (Array.isArray(header)) {
              applyHeaders(header, res);
            } else if (header.key === "Vary" && header.value) {
              vary(res, header.value);
            } else if (header.value) {
              res.setHeader(header.key, header.value);
            }
          }
        }
      }
      function cors2(options, req, res, next) {
        var headers = [], method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        if (method === "OPTIONS") {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options, req));
          headers.push(configureMethods(options, req));
          headers.push(configureAllowedHeaders(options, req));
          headers.push(configureMaxAge(options, req));
          headers.push(configureExposedHeaders(options, req));
          applyHeaders(headers, res);
          if (options.preflightContinue) {
            next();
          } else {
            res.statusCode = options.optionsSuccessStatus;
            res.setHeader("Content-Length", "0");
            res.end();
          }
        } else {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options, req));
          headers.push(configureExposedHeaders(options, req));
          applyHeaders(headers, res);
          next();
        }
      }
      function middlewareWrapper(o) {
        var optionsCallback = null;
        if (typeof o === "function") {
          optionsCallback = o;
        } else {
          optionsCallback = function(req, cb) {
            cb(null, o);
          };
        }
        return function corsMiddleware(req, res, next) {
          optionsCallback(req, function(err, options) {
            if (err) {
              next(err);
            } else {
              var corsOptions = assign({}, defaults, options);
              var originCallback = null;
              if (corsOptions.origin && typeof corsOptions.origin === "function") {
                originCallback = corsOptions.origin;
              } else if (corsOptions.origin) {
                originCallback = function(origin, cb) {
                  cb(null, corsOptions.origin);
                };
              }
              if (originCallback) {
                originCallback(req.headers.origin, function(err2, origin) {
                  if (err2 || !origin) {
                    next(err2);
                  } else {
                    corsOptions.origin = origin;
                    cors2(corsOptions, req, res, next);
                  }
                });
              } else {
                next();
              }
            }
          });
        };
      }
      module2.exports = middlewareWrapper;
    })();
  }
});

// server/node_modules/cookie/index.js
var require_cookie = __commonJS({
  "server/node_modules/cookie/index.js"(exports2) {
    "use strict";
    exports2.parse = parse;
    exports2.serialize = serialize;
    var __toString = Object.prototype.toString;
    var __hasOwnProperty = Object.prototype.hasOwnProperty;
    var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    function parse(str, opt) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var len = str.length;
      if (len < 2) return obj;
      var dec = opt && opt.decode || decode;
      var index = 0;
      var eqIdx = 0;
      var endIdx = 0;
      do {
        eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break;
        endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = len;
        } else if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key = str.slice(keyStartIdx, keyEndIdx);
        if (!__hasOwnProperty.call(obj, key)) {
          var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          var valEndIdx = endIndex(str, endIdx, valStartIdx);
          if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
            valStartIdx++;
            valEndIdx--;
          }
          var val = str.slice(valStartIdx, valEndIdx);
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str, index, max) {
      do {
        var code = str.charCodeAt(index);
        if (code !== 32 && code !== 9) return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str, index, min) {
      while (index > min) {
        var code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9) return index + 1;
      }
      return min;
    }
    function serialize(name, val, opt) {
      var enc = opt && opt.encode || encodeURIComponent;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (!opt) return str;
      if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + maxAge;
      }
      if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// server/node_modules/cookie-parser/node_modules/cookie-signature/index.js
var require_cookie_signature = __commonJS({
  "server/node_modules/cookie-parser/node_modules/cookie-signature/index.js"(exports2) {
    var crypto = require("crypto");
    exports2.sign = function(val, secret) {
      if ("string" != typeof val) throw new TypeError("Cookie value must be provided as a string.");
      if ("string" != typeof secret) throw new TypeError("Secret string must be provided.");
      return val + "." + crypto.createHmac("sha256", secret).update(val).digest("base64").replace(/\=+$/, "");
    };
    exports2.unsign = function(val, secret) {
      if ("string" != typeof val) throw new TypeError("Signed cookie string must be provided.");
      if ("string" != typeof secret) throw new TypeError("Secret string must be provided.");
      var str = val.slice(0, val.lastIndexOf(".")), mac = exports2.sign(str, secret);
      return sha1(mac) == sha1(val) ? str : false;
    };
    function sha1(str) {
      return crypto.createHash("sha1").update(str).digest("hex");
    }
  }
});

// server/node_modules/cookie-parser/index.js
var require_cookie_parser = __commonJS({
  "server/node_modules/cookie-parser/index.js"(exports2, module2) {
    "use strict";
    var cookie = require_cookie();
    var signature = require_cookie_signature();
    module2.exports = cookieParser2;
    module2.exports.JSONCookie = JSONCookie;
    module2.exports.JSONCookies = JSONCookies;
    module2.exports.signedCookie = signedCookie;
    module2.exports.signedCookies = signedCookies;
    function cookieParser2(secret, options) {
      var secrets = !secret || Array.isArray(secret) ? secret || [] : [secret];
      return function cookieParser3(req, res, next) {
        if (req.cookies) {
          return next();
        }
        var cookies = req.headers.cookie;
        req.secret = secrets[0];
        req.cookies = /* @__PURE__ */ Object.create(null);
        req.signedCookies = /* @__PURE__ */ Object.create(null);
        if (!cookies) {
          return next();
        }
        req.cookies = cookie.parse(cookies, options);
        if (secrets.length !== 0) {
          req.signedCookies = signedCookies(req.cookies, secrets);
          req.signedCookies = JSONCookies(req.signedCookies);
        }
        req.cookies = JSONCookies(req.cookies);
        next();
      };
    }
    function JSONCookie(str) {
      if (typeof str !== "string" || str.substr(0, 2) !== "j:") {
        return void 0;
      }
      try {
        return JSON.parse(str.slice(2));
      } catch (err) {
        return void 0;
      }
    }
    function JSONCookies(obj) {
      var cookies = Object.keys(obj);
      var key;
      var val;
      for (var i = 0; i < cookies.length; i++) {
        key = cookies[i];
        val = JSONCookie(obj[key]);
        if (val) {
          obj[key] = val;
        }
      }
      return obj;
    }
    function signedCookie(str, secret) {
      if (typeof str !== "string") {
        return void 0;
      }
      if (str.substr(0, 2) !== "s:") {
        return str;
      }
      var secrets = !secret || Array.isArray(secret) ? secret || [] : [secret];
      for (var i = 0; i < secrets.length; i++) {
        var val = signature.unsign(str.slice(2), secrets[i]);
        if (val !== false) {
          return val;
        }
      }
      return false;
    }
    function signedCookies(obj, secret) {
      var cookies = Object.keys(obj);
      var dec;
      var key;
      var ret = /* @__PURE__ */ Object.create(null);
      var val;
      for (var i = 0; i < cookies.length; i++) {
        key = cookies[i];
        val = obj[key];
        dec = signedCookie(val, secret);
        if (val !== dec) {
          ret[key] = dec;
          delete obj[key];
        }
      }
      return ret;
    }
  }
});

// api/index.ts
var api_exports = {};
__export(api_exports, {
  default: () => api_default
});
module.exports = __toCommonJS(api_exports);

// server/src/index.ts
var import_dotenv4 = __toESM(require_main());
var import_express8 = __toESM(require("express"));
var import_cors = __toESM(require_lib());
var import_cookie_parser = __toESM(require_cookie_parser());

// server/src/config/db.ts
var import_mongoose = __toESM(require("mongoose"));
var cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
var connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false
    };
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voting-system";
    if (mongoURI.includes("<username>") || mongoURI.includes("<password>")) {
      console.warn("\u26A0\uFE0F MONGO_URI contains placeholders. Please update your .env file.");
    }
    console.log("\u{1F4E1} Connecting to MongoDB...");
    cached.promise = import_mongoose.default.connect(mongoURI, opts).then((mongoose9) => {
      console.log(`\u2705 MongoDB Connected`);
      return mongoose9;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`\u274C MongoDB Connection Error: ${e.message}`);
    throw e;
  }
  return cached.conn;
};
var db_default = connectDB;

// server/src/routes/authRoutes.ts
var import_express = __toESM(require("express"));

// server/src/controllers/authController.ts
var import_bcryptjs = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// server/src/models/User.ts
var import_mongoose2 = __toESM(require("mongoose"));
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["VOTER"] = "voter";
  UserRole2["ADMIN"] = "admin";
  UserRole2["CANDIDATE"] = "candidate";
  return UserRole2;
})(UserRole || {});
var VerificationStatus = /* @__PURE__ */ ((VerificationStatus2) => {
  VerificationStatus2["PENDING"] = "pending";
  VerificationStatus2["VERIFIED"] = "verified";
  VerificationStatus2["REJECTED"] = "rejected";
  return VerificationStatus2;
})(VerificationStatus || {});
var UserSchema = new import_mongoose2.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: "voter" /* VOTER */
  },
  studentId: { type: String, unique: true, sparse: true },
  verificationStatus: {
    type: String,
    enum: Object.values(VerificationStatus),
    default: "pending" /* PENDING */
  },
  isFaceVerified: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  votedElections: [{ type: import_mongoose2.Schema.Types.ObjectId, ref: "Election" }],
  votingRecords: [{
    electionId: { type: import_mongoose2.Schema.Types.ObjectId, ref: "Election" },
    transactionHash: { type: String },
    votedAt: { type: Date, default: Date.now }
  }],
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  imageHash: { type: String },
  imageUrl: { type: String },
  idCardUrl: { type: String },
  rejectionReason: { type: String },
  voteTransactionHash: { type: String },
  votedAt: { type: Date },
  refreshToken: { type: String },
  expoPushToken: { type: String }
}, {
  timestamps: true
});
UserSchema.index({ role: 1, createdAt: -1 });
var User_default = import_mongoose2.default.model("User", UserSchema);

// server/src/models/Notification.ts
var import_mongoose3 = __toESM(require("mongoose"));
var notificationSchema = new import_mongoose3.Schema({
  user: {
    type: import_mongoose3.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error"],
    default: "info"
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
var Notification_default = import_mongoose3.default.model("Notification", notificationSchema);

// server/src/utils/email.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_dotenv = __toESM(require_main());

// server/src/models/Settings.ts
var import_mongoose4 = __toESM(require("mongoose"));
var SettingsSchema = new import_mongoose4.Schema({
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceTitle: {
    type: String,
    default: "System Under Maintenance"
  },
  maintenanceMessage: {
    type: String,
    default: "Vora is currently undergoing scheduled maintenance to improve system performance and security. Please check back soon."
  },
  estimatedEndTime: {
    type: String,
    default: ""
  },
  allowAdminBypass: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
var Settings_default = import_mongoose4.default.model("Settings", SettingsSchema);

// server/src/utils/email.ts
import_dotenv.default.config();
var EMAIL_USER = process.env.EMAIL_USER?.trim();
var EMAIL_PASS = process.env.EMAIL_PASS?.trim();
var SMTP_HOST = process.env.SMTP_HOST?.trim() || "smtp-relay.brevo.com";
var createTransporter = () => {
  if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER.includes("user@example.com")) {
    console.warn("\u26A0\uFE0F Email credentials missing or placeholder. Email service will be disabled.");
    return null;
  }
  const transporter2 = import_nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: 2525,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    tls: {
      ciphers: "SSLv3"
    }
  });
  transporter2.verify(function(error, success) {
    if (error) {
      console.error("\u274C Email Service Error:", error);
    } else {
      console.log("\u2705 Email service ready");
    }
  });
  return transporter2;
};
var transporter = createTransporter();
var sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn("\u26A0\uFE0F Cannot send email: Transporter not initialized. Check .env");
    throw new Error("Email service is not configured.");
  }
  try {
    const settings = await Settings_default.findOne();
    if (settings && settings.emailNotificationsEnabled === false) {
      console.log(`\u{1F507} Email notifications are disabled globally. Skipping email to ${to}`);
      return null;
    }
    const mailOptions = {
      from: `"Voting System" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("\u274C Send Mail Failed:", error);
    throw error;
  }
};

// server/src/controllers/authController.ts
var import_expo_server_sdk = require("expo-server-sdk");
var expo = new import_expo_server_sdk.Expo();
var generateAccessToken = (id) => {
  return import_jsonwebtoken.default.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d"
  });
};
var generateRefreshToken = (id) => {
  return import_jsonwebtoken.default.sign({ id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d"
  });
};
var euclideanDistance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) return 1;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};
var sendTokenResponse = async (user, statusCode, res, rememberMe = false) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken2 = generateRefreshToken(user._id);
  user.refreshToken = refreshToken2;
  await user.save();
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.VERCEL === "1";
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: isProduction,
    // HTTPS required for None
    sameSite: isProduction ? "none" : "lax",
    // Must be 'none' for cross-site
    maxAge: 30 * 24 * 60 * 60 * 1e3
    // 30 days
  });
  const refreshTokenOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/"
  };
  if (rememberMe) {
    refreshTokenOptions.maxAge = 30 * 24 * 60 * 60 * 1e3;
  }
  res.cookie("refresh_token", refreshToken2, refreshTokenOptions);
  res.status(statusCode).json({
    token: accessToken,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    verificationStatus: user.verificationStatus,
    rejectionReason: user.rejectionReason,
    isFaceVerified: user.isFaceVerified,
    hasVoted: user.hasVoted,
    imageUrl: user.imageUrl,
    idCardUrl: user.idCardUrl,
    voteTransactionHash: user.voteTransactionHash,
    votedAt: user.votedAt
  });
};
var registerUser = async (req, res) => {
  try {
    const { name, email, password, role, studentId, imageHash, imageUrl, idCardUrl } = req.body;
    if (role === "admin" /* ADMIN */ || role === "admin") {
      res.status(400).json({ message: "Registration of Administrator accounts is not permitted." });
      return;
    }
    const userExists = await User_default.findOne({ $or: [{ email }, { studentId }] });
    if (userExists) {
      const message = userExists.email === email ? "User with this email already exists" : "User with this Student ID already exists";
      res.status(400).json({ message });
      return;
    }
    if (imageHash) {
      try {
        const newFaceDescriptor = JSON.parse(imageHash);
        const existingUsers = await User_default.find({
          imageHash: { $exists: true, $ne: null }
        }).sort({ createdAt: -1 }).limit(200).select("imageHash email");
        const DUPLICATE_THRESHOLD = 0.45;
        for (const existingUser of existingUsers) {
          if (!existingUser.imageHash) continue;
          if (!existingUser.imageHash.trim().startsWith("[")) continue;
          try {
            const existingDescriptor = JSON.parse(existingUser.imageHash);
            const distance = euclideanDistance(newFaceDescriptor, existingDescriptor);
            if (distance < DUPLICATE_THRESHOLD) {
              console.log(`Duplicate Registration Attempt: Face matches user ${existingUser._id} (${existingUser.email}) with distance ${distance}`);
              res.status(400).json({
                message: "This face is already registered with another account."
              });
              return;
            }
          } catch (e) {
            continue;
          }
        }
      } catch (error) {
        console.error("Error processing face descriptor during registration:", error);
        res.status(400).json({ message: "Invalid face data provided." });
        return;
      }
    }
    const salt = await import_bcryptjs.default.genSalt(10);
    const hashedPassword = await import_bcryptjs.default.hash(password, salt);
    const user = await User_default.create({
      name,
      email,
      password: hashedPassword,
      role: role || "voter" /* VOTER */,
      studentId,
      verificationStatus: "pending",
      imageHash,
      imageUrl,
      idCardUrl
    });
    if (user) {
      const admins = await User_default.find({ role: "admin" /* ADMIN */ });
      const notifications = admins.map((admin2) => ({
        user: admin2._id,
        type: "info",
        title: "New Voter Registration",
        message: `${user.name} (${user.studentId}) has registered and is pending verification.`
      }));
      if (notifications.length > 0) {
        await Notification_default.insertMany(notifications);
      }
      const messages = [];
      for (let admin2 of admins) {
        if (admin2.expoPushToken && import_expo_server_sdk.Expo.isExpoPushToken(admin2.expoPushToken)) {
          messages.push({
            to: admin2.expoPushToken,
            sound: "default",
            title: "New Voter Registration \u{1F6A8}",
            body: `${user.name} (${user.studentId}) is pending verification.`,
            data: { type: "registration", userId: user._id }
          });
        }
      }
      if (messages.length > 0) {
        const chunks = expo.chunkPushNotifications(messages);
        (async () => {
          for (let chunk of chunks) {
            try {
              await expo.sendPushNotificationsAsync(chunk);
            } catch (error) {
              console.error("Error sending push notification chunk:", error);
            }
          }
        })();
      }
      sendEmail({
        to: user.email,
        subject: "Welcome to Voting System",
        html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0F766E;">Welcome to Voting System!</h2>
                        <p>Hi ${user.name},</p>
                        <p>Thank you for registering. Your account has been created successfully.</p>
                        <p><strong>Student ID:</strong> ${user.studentId}</p>
                        <p>Your account is currently <strong>Pending Verification</strong>. You will receive another email once an admin reviews your details.</p>
                        <br>
                        <p>Best regards,<br>Voting System Team</p>
                    </div>
                `
      }).catch((err) => console.error("Welcome Email Failed:", err));
      sendEmail({
        to: process.env.SENDER_EMAIL || process.env.EMAIL_USER,
        subject: "New Voter Registration Alert \u{1F6A8}",
        html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0F766E;">New Voter Registration</h2>
                        <p>A new user has registered and is awaiting verification.</p>
                        <ul>
                            <li><strong>Name:</strong> ${user.name}</li>
                            <li><strong>Student ID:</strong> ${user.studentId}</li>
                            <li><strong>Email:</strong> ${user.email}</li>
                            <li><strong>Time:</strong> ${(/* @__PURE__ */ new Date()).toLocaleString()}</li>
                        </ul>
                        <p>Please log in to the <a href="${process.env.ADMIN_FRONTEND_URL || "http://localhost:8081"}">Admin Dashboard</a> to verify this user.</p>
                    </div>
                `
      }).catch((err) => console.error("Admin Alert Email Failed:", err));
      await sendTokenResponse(user, 201, res, false);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var loginUser = async (req, res) => {
  try {
    const { email, studentId, password, faceDescriptor, rememberMe } = req.body;
    const query = email ? { email } : { studentId };
    if (!email && !studentId) {
      res.status(400).json({ message: "Please provide email or student ID" });
      return;
    }
    const user = await User_default.findOne(query);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if (user.lockUntil && user.lockUntil > /* @__PURE__ */ new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 6e4);
      res.status(423).json({
        message: `Account is locked. Try again in ${minutesLeft} minutes.`
      });
      return;
    }
    if (await import_bcryptjs.default.compare(password, user.password)) {
      if (user.role === "voter" /* VOTER */) {
        if (!user.imageHash) {
        } else {
          if (!faceDescriptor) {
            res.status(428).json({
              message: "Face verification required",
              required: "face_descriptor"
            });
            return;
          }
          try {
            const registeredDescriptor = JSON.parse(user.imageHash);
            const distance = euclideanDistance(faceDescriptor, registeredDescriptor);
            const THRESHOLD = 0.6;
            if (distance > THRESHOLD) {
              console.log(`Login Failed: Face distance ${distance} > ${THRESHOLD}`);
              res.status(401).json({ message: "Face not recognized. Login failed." });
              return;
            }
          } catch (err) {
            console.error("Login Face Verify Error:", err);
            res.status(500).json({ message: "Error verifying biometric data" });
            return;
          }
        }
      }
      user.loginAttempts = 0;
      user.lockUntil = void 0;
      await user.save();
      await sendTokenResponse(user, 200, res, rememberMe);
    } else {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1e3);
        await user.save();
        res.status(423).json({ message: "Account is locked due to too many failed attempts. Try again in 15 minutes." });
        return;
      }
      await user.save();
      res.status(401).json({
        message: `Invalid credentials. ${5 - user.loginAttempts} attempts remaining.`
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var refreshToken = async (req, res) => {
  try {
    const refreshToken2 = req.cookies.refresh_token;
    if (!refreshToken2) {
      return res.status(401).json({ message: "Not authorized, no refresh token" });
    }
    const decoded = import_jsonwebtoken.default.verify(refreshToken2, process.env.JWT_REFRESH_SECRET || "refresh_secret");
    const user = await User_default.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken2) {
      return res.status(401).json({ message: "Not authorized, invalid refresh token" });
    }
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();
    const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true" || process.env.VERCEL === "1";
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1e3
      // 15 minutes
    });
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.json({ token: accessToken, message: "Token refreshed" });
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
var logoutUser = async (req, res) => {
  if (req.user) {
    const user = await User_default.findById(req.user.id);
    if (user) {
      user.refreshToken = void 0;
      await user.save();
    }
  }
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: /* @__PURE__ */ new Date(0)
  });
  res.cookie("refresh_token", "", {
    httpOnly: true,
    path: "/api/auth/refresh",
    expires: /* @__PURE__ */ new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully" });
};
var getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }
  const user = await User_default.findById(req.user._id).populate("votingRecords.electionId", "title startDate endDate");
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      rejectionReason: user.rejectionReason,
      isFaceVerified: user.isFaceVerified,
      hasVoted: user.hasVoted,
      imageUrl: user.imageUrl,
      idCardUrl: user.idCardUrl,
      voteTransactionHash: user.voteTransactionHash,
      votedAt: user.votedAt,
      votingRecords: user.votingRecords
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
var updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User_default.findById(req.user?._id);
    if (user && await import_bcryptjs.default.compare(currentPassword, user.password)) {
      const salt = await import_bcryptjs.default.genSalt(10);
      user.password = await import_bcryptjs.default.hash(newPassword, salt);
      await user.save();
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(401).json({ message: "Invalid current password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var updateFaceData = async (req, res) => {
  try {
    const { imageHash, imageUrl, idCardUrl, name, studentId } = req.body;
    const user = await User_default.findById(req.user?._id);
    if (user) {
      if (studentId && studentId !== user.studentId) {
        const existingUser = await User_default.findOne({ studentId });
        if (existingUser) {
          return res.status(400).json({ message: "Student ID is already registered." });
        }
        user.studentId = studentId;
      }
      if (name) user.name = name;
      if (imageHash) user.imageHash = imageHash;
      if (imageUrl) user.imageUrl = imageUrl;
      if (idCardUrl) user.idCardUrl = idCardUrl;
      if (user.verificationStatus === "rejected" /* REJECTED */) {
        user.verificationStatus = "pending" /* PENDING */;
        user.rejectionReason = void 0;
      }
      await user.save();
      res.json({
        message: "Profile updated successfully",
        verificationStatus: user.verificationStatus,
        name: user.name,
        studentId: user.studentId
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var verifyFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      res.status(400).json({ message: "Valid face descriptor is required" });
      return;
    }
    const user = await User_default.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.isFaceVerified) {
      res.status(200).json({ message: "User face is already verified", verified: true });
      return;
    }
    if (!user.imageHash) {
      console.warn("VerifyRequest: No imageHash found for user");
      res.status(400).json({ message: "No registered face data found for this user." });
      return;
    }
    let registeredDescriptor;
    try {
      registeredDescriptor = JSON.parse(user.imageHash);
    } catch (e) {
      res.status(500).json({ message: "Error parsing registered face data" });
      return;
    }
    const distance = euclideanDistance(faceDescriptor, registeredDescriptor);
    const THRESHOLD = 0.55;
    if (distance < THRESHOLD) {
      user.isFaceVerified = true;
      await user.save();
      res.json({ message: "Face verified successfully", verified: true, distance });
    } else {
      res.status(400).json({
        message: "Face verification failed. Data does not match.",
        verified: false,
        distance
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var savePushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    const user = await User_default.findById(req.user?._id);
    if (user) {
      user.expoPushToken = expoPushToken;
      await user.save();
      res.json({ message: "Push token saved successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// server/src/middleware/authMiddleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (token) {
    try {
      const decoded = import_jsonwebtoken2.default.verify(token, process.env.JWT_SECRET || "secret");
      req.user = await User_default.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
var admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// server/src/controllers/notificationController.ts
var getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification_default.find({ user: req.user?._id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
var markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification_default.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};
var markAllNotificationsRead = async (req, res) => {
  try {
    await Notification_default.updateMany(
      { user: req.user?._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
};

// server/src/routes/authRoutes.ts
var router = import_express.default.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getUserProfile);
router.put("/update-password", protect, updatePassword);
router.put("/update-face", protect, updateFaceData);
router.post("/verify-face", protect, verifyFace);
router.put("/push-token", protect, savePushToken);
router.get("/notifications", protect, getUserNotifications);
router.put("/notifications/:id/read", protect, markNotificationRead);
router.put("/notifications/read-all", protect, markAllNotificationsRead);
var authRoutes_default = router;

// server/src/routes/uploadRoutes.ts
var import_express2 = __toESM(require("express"));
var import_multer = __toESM(require("multer"));

// server/src/config/cloudinary.ts
var import_cloudinary = require("cloudinary");
var import_dotenv2 = __toESM(require_main());
import_dotenv2.default.config();
console.log("Cloudinary Config Check:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Loaded *****" + process.env.CLOUDINARY_API_KEY.slice(-4) : "MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded *****" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "MISSING");
import_cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});
var cloudinary_default = import_cloudinary.v2;

// server/node_modules/uuid/dist-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// server/node_modules/uuid/dist-node/rng.js
var import_node_crypto = require("node:crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_node_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// server/node_modules/uuid/dist-node/native.js
var import_node_crypto2 = require("node:crypto");
var native_default = { randomUUID: import_node_crypto2.randomUUID };

// server/node_modules/uuid/dist-node/v4.js
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  return _v4(options, buf, offset);
}
var v4_default = v4;

// server/src/controllers/uploadController.ts
var uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary_default.uploader.upload(dataURI, {
      folder: "voting-system/id-cards",
      public_id: `id_${v4_default()}`,
      resource_type: "auto"
      // timestamp is automatically handled by the SDK usually, or we can just pass nothing to let it default
    });
    res.json({
      message: "File uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error("Upload Error Metadata:", {
      filename: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });
    console.error("Cloudinary Error Detail:", error);
    res.status(500).json({
      message: error.message || "Image upload failed",
      details: error.error || error.message || "Internal server error"
    });
  }
};

// server/src/routes/uploadRoutes.ts
var router2 = import_express2.default.Router();
var storage = import_multer.default.memoryStorage();
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
router2.post("/", upload.single("file"), uploadFile);
var uploadRoutes_default = router2;

// server/src/routes/adminRoutes.ts
var import_express3 = __toESM(require("express"));

// server/src/models/Election.ts
var import_mongoose5 = __toESM(require("mongoose"));
var electionSchema = new import_mongoose5.default.Schema({
  title: {
    type: String,
    required: true,
    default: "Student Council Election"
  },
  description: {
    type: String,
    default: "Vote for your next student council representatives."
  },
  startDate: {
    type: Date,
    required: true,
    // Default to today
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true,
    // Default to 7 days from now
    default: () => new Date(+/* @__PURE__ */ new Date() + 7 * 24 * 60 * 60 * 1e3)
  },
  resultsPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  abstainCount: {
    type: Number,
    default: 0
  },
  lastEmailSentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ["active", "upcoming", "completed"],
    default: "active"
  }
}, {
  timestamps: true
});
var Election = import_mongoose5.default.model("Election", electionSchema);
var Election_default = Election;

// server/src/config/blockchain.ts
var import_ethers = require("ethers");
var import_dotenv3 = __toESM(require_main());
import_dotenv3.default.config();
var RPC_URL = process.env.SEPOLIA_RPC_URL;
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
var CONTRACT_ABI = [
  "function vote(string memory _candidateId) public",
  "function addCandidate(string memory _id, string memory _name) public",
  "function getAllCandidates() public view returns (tuple(string id, string name, uint256 voteCount)[])",
  "function candidates(string memory) public view returns (string id, string name, uint256 voteCount)"
];
var contract = null;
var wallet = null;
if (RPC_URL && PRIVATE_KEY) {
  const isPlaceholder = PRIVATE_KEY.includes("your_wallet_private_key") || PRIVATE_KEY.length < 32;
  if (isPlaceholder) {
    console.warn("\u26A0\uFE0F Blockchain PRIVATE_KEY appears to be a placeholder or invalid. Blockchain features disabled.");
  } else {
    try {
      const provider = new import_ethers.ethers.JsonRpcProvider(RPC_URL);
      wallet = new import_ethers.ethers.Wallet(PRIVATE_KEY, provider);
      if (CONTRACT_ADDRESS && !CONTRACT_ADDRESS.includes("your_deployed_contract_address")) {
        contract = new import_ethers.ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        console.log("\u2705 Blockchain connected successfully");
      } else {
        console.warn("\u26A0\uFE0F Blockchain wallet connected, but CONTRACT_ADDRESS is missing or placeholder. Voting functions disabled.");
      }
    } catch (error) {
      console.error("\u274C Failed to connect to blockchain:", error);
    }
  }
} else {
  console.warn("\u26A0\uFE0F Blockchain credentials (RPC_URL or PRIVATE_KEY) missing in .env. Blockchain features will be disabled.");
}

// server/src/controllers/adminController.ts
var import_ethers2 = require("ethers");

// server/src/models/Candidate.ts
var import_mongoose6 = __toESM(require("mongoose"));
var CandidateSchema = new import_mongoose6.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  manifesto: { type: String, required: true },
  imageUrl: { type: String },
  voteCount: { type: Number, default: 0 },
  electionId: { type: import_mongoose6.Schema.Types.ObjectId, ref: "Election", required: true }
}, {
  timestamps: true
});
var Candidate_default = import_mongoose6.default.model("Candidate", CandidateSchema);

// server/src/controllers/adminController.ts
var getAllVoters = async (req, res) => {
  try {
    const users = await User_default.find({ role: "voter" /* VOTER */ }).select("-password -refreshToken").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var verifyVoter = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const userId = req.params.id;
    if (!status || !["verified" /* VERIFIED */, "rejected" /* REJECTED */].includes(status)) {
      res.status(400).json({ message: "Invalid verification status" });
      return;
    }
    const user = await User_default.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.verificationStatus = status;
    if (status === "rejected" /* REJECTED */) {
      user.rejectionReason = rejectionReason;
    } else {
      user.rejectionReason = void 0;
    }
    await user.save();
    await Notification_default.create({
      user: user._id,
      type: status === "verified" /* VERIFIED */ ? "success" : "error",
      title: status === "verified" /* VERIFIED */ ? "Verification Approved" : "Verification Rejected",
      message: status === "verified" /* VERIFIED */ ? "Your account has been verified. You can now vote." : `Your verification was rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : "Please check your details."}`
    });
    sendEmail({
      to: user.email,
      subject: status === "verified" /* VERIFIED */ ? "Voter Verification Approved" : "Verification Status Update",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: ${status === "verified" /* VERIFIED */ ? "#0F766E" : "#9f1239"};">
                        ${status === "verified" /* VERIFIED */ ? "Verification Approved! \u{1F389}" : "Verification Application Update"}
                    </h2>
                    <p>Hi ${user.name},</p>
                    <p>
                        ${status === "verified" /* VERIFIED */ ? "Congratulations! Your voter account has been <strong>verified</strong> by the administration." : `We regret to inform you that your voter verification request has been <strong>rejected</strong>.${rejectionReason ? `<br><br><strong>Reason:</strong> ${rejectionReason}` : ""}`}
                    </p>
                    ${status === "verified" /* VERIFIED */ ? "<p>You are now eligible to cast your vote in the upcoming election.</p>" : "<p>Please contact the administration office for more details or to resubmit your application.</p>"}
                    <br>
                    <p>Best regards,<br>Voting System Board</p>
                </div>
            `
    }).catch((err) => console.error("Verification Email Failed:", err));
    res.json({
      message: `User ${status === "verified" /* VERIFIED */ ? "verified" : "rejected"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var deleteVoter = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User_default.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.role !== "voter" /* VOTER */) {
      res.status(403).json({ message: "Can only delete voters" });
      return;
    }
    await User_default.findByIdAndDelete(userId);
    res.json({ message: "Voter deleted successfully" });
  } catch (error) {
    console.error("Error deleting voter:", error);
    res.status(500).json({ message: "Server error during deletion" });
  }
};
var getDashboardStats = async (req, res) => {
  try {
    const totalRegistered = await User_default.countDocuments({ role: "voter" /* VOTER */ });
    const verifiedVoters = await User_default.countDocuments({ role: "voter" /* VOTER */, verificationStatus: "verified" /* VERIFIED */ });
    const activeElection = await Election_default.findOne({ status: "active" });
    const candidatesCount = activeElection ? await Candidate_default.countDocuments({ electionId: activeElection._id }) : 0;
    const abstainCount = activeElection?.abstainCount || 0;
    const votesCast = activeElection ? await User_default.countDocuments({ votedElections: activeElection._id }) : 0;
    const candidates = activeElection ? await Candidate_default.find({ electionId: activeElection._id }) : [];
    const votesByParty = activeElection ? await Candidate_default.aggregate([
      { $match: { electionId: activeElection._id } },
      {
        $group: {
          _id: "$party",
          value: { $sum: "$voteCount" }
        }
      },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]) : [];
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const dailyRegistrations = await User_default.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          role: "voter" /* VOTER */
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          votes: { $sum: 1 }
          // Reusing 'votes' key to match frontend expectation
        }
      },
      { $sort: { _id: 1 } }
    ]);
    let blockchainStats = {
      connected: false,
      network: "Unknown",
      address: "",
      balance: "0.00"
    };
    if (wallet) {
      try {
        const balanceWei = await wallet.provider?.getBalance(wallet.address);
        const balanceEth = balanceWei ? import_ethers2.ethers.formatEther(balanceWei) : "0.0";
        blockchainStats = {
          connected: true,
          network: "Sepolia",
          // Hardcoded for now as per config
          address: wallet.address,
          balance: parseFloat(balanceEth).toFixed(4)
        };
      } catch (err) {
        console.error("Error fetching blockchain balance:", err);
      }
    }
    const recentUsers = await User_default.find({ role: "voter" /* VOTER */ }).sort({ updatedAt: -1 }).limit(5).select("name verificationStatus hasVoted createdAt updatedAt");
    const recentActivity = recentUsers.map((user) => {
      let action = "Registered";
      let status = "pending";
      let time = user.createdAt;
      if (user.hasVoted) {
        action = "Voted";
        status = "voted";
        time = user.updatedAt;
      } else if (user.verificationStatus === "verified" /* VERIFIED */) {
        action = "Verified";
        status = "verified";
        time = user.updatedAt;
      }
      return {
        id: user._id,
        name: user.name,
        action,
        time,
        status
      };
    });
    res.json({
      stats: {
        totalRegistered,
        verifiedVoters,
        votesCast,
        candidates: candidatesCount
      },
      charts: {
        pieData: votesByParty.map((p, i) => ({ ...p, color: ["#0EA5E9", "#F97316", "#8B5CF6", "#D946EF"][i % 4] })),
        barData: dailyRegistrations.map((d) => ({
          day: new Date(d._id).toLocaleDateString("en-US", { weekday: "short" }),
          votes: d.votes
        }))
      },
      blockchain: blockchainStats,
      recentActivity
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};
var getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.query;
    let query = {};
    if (electionId) {
      query.electionId = electionId;
    } else {
      const activeElection = await Election_default.findOne({ status: "active" });
      if (activeElection) {
        query.electionId = activeElection._id;
      }
    }
    const candidates = await Candidate_default.find(query);
    const totalVotes = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);
    const results = candidates.map((candidate) => ({
      name: candidate.name,
      party: candidate.party,
      votes: candidate.voteCount,
      color: "hsl(var(--primary))",
      // Frontend can map colors or we can store them
      imageUrl: candidate.imageUrl
    }));
    res.json({
      totalVotes,
      results: results.sort((a, b) => b.votes - a.votes)
    });
  } catch (error) {
    console.error("Error fetching election results:", error);
    res.status(500).json({ message: "Error fetching results" });
  }
};
var getSettings = async (req, res) => {
  try {
    let settings = await Settings_default.findOne();
    if (!settings) {
      settings = await Settings_default.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Error fetching settings" });
  }
};
function convertToAbsoluteTargetTime(inputStr) {
  if (!inputStr || !inputStr.trim()) return "";
  const trimmed = inputStr.trim().toLowerCase();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return new Date(Date.now() + parseFloat(trimmed) * 3600 * 1e3).toISOString();
  }
  const hourMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
  if (hourMatch) {
    return new Date(Date.now() + parseFloat(hourMatch[1]) * 3600 * 1e3).toISOString();
  }
  const minMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
  if (minMatch) {
    return new Date(Date.now() + parseFloat(minMatch[1]) * 60 * 1e3).toISOString();
  }
  const parsed = new Date(inputStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return inputStr;
}
var updateSettings = async (req, res) => {
  try {
    const {
      emailNotificationsEnabled,
      maintenanceMode,
      maintenanceTitle,
      maintenanceMessage,
      estimatedEndTime,
      allowAdminBypass
    } = req.body;
    let settings = await Settings_default.findOne();
    if (!settings) {
      settings = new Settings_default({});
    }
    if (emailNotificationsEnabled !== void 0) {
      settings.emailNotificationsEnabled = emailNotificationsEnabled;
    }
    if (maintenanceMode !== void 0) {
      settings.maintenanceMode = maintenanceMode;
    }
    if (maintenanceTitle !== void 0) {
      settings.maintenanceTitle = maintenanceTitle;
    }
    if (maintenanceMessage !== void 0) {
      settings.maintenanceMessage = maintenanceMessage;
    }
    if (estimatedEndTime !== void 0) {
      settings.estimatedEndTime = convertToAbsoluteTargetTime(estimatedEndTime);
    }
    if (allowAdminBypass !== void 0) {
      settings.allowAdminBypass = allowAdminBypass;
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Error updating settings" });
  }
};
var getPublicSettings = async (req, res) => {
  try {
    let settings = await Settings_default.findOne();
    if (!settings) {
      settings = await Settings_default.create({});
    }
    let finalEstimatedEndTime = settings.estimatedEndTime ?? "";
    if (finalEstimatedEndTime) {
      const parsed = new Date(finalEstimatedEndTime);
      if (isNaN(parsed.getTime())) {
        const trimmed = finalEstimatedEndTime.trim().toLowerCase();
        const baseDate = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
        if (/^\d+(\.\d+)?$/.test(trimmed)) {
          finalEstimatedEndTime = new Date(baseDate + parseFloat(trimmed) * 3600 * 1e3).toISOString();
        } else {
          const hourMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
          if (hourMatch) {
            finalEstimatedEndTime = new Date(baseDate + parseFloat(hourMatch[1]) * 3600 * 1e3).toISOString();
          } else {
            const minMatch = trimmed.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minute|minutes)$/);
            if (minMatch) {
              finalEstimatedEndTime = new Date(baseDate + parseFloat(minMatch[1]) * 60 * 1e3).toISOString();
            }
          }
        }
      }
    }
    res.json({
      maintenanceMode: settings.maintenanceMode ?? false,
      maintenanceTitle: settings.maintenanceTitle ?? "System Under Maintenance",
      maintenanceMessage: settings.maintenanceMessage ?? "Vora is currently undergoing scheduled maintenance to improve system performance and security. Please check back soon.",
      estimatedEndTime: finalEstimatedEndTime,
      allowAdminBypass: settings.allowAdminBypass ?? true
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({ message: "Error fetching public settings" });
  }
};

// server/src/controllers/electionController.ts
var import_mongoose7 = __toESM(require("mongoose"));
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var getPublicElectionResults = async (req, res) => {
  try {
    const { electionId } = req.query;
    let election;
    if (electionId) {
      election = await Election_default.findById(electionId);
    } else {
      election = await Election_default.findOne({ status: "active" });
      if (!election) {
        election = await Election_default.findOne({ status: "completed" }).sort({ endDate: -1 });
      }
    }
    if (!election || !election.resultsPublished) {
      return res.status(403).json({ message: "Results not published yet or election not found" });
    }
    const candidates = await Candidate_default.find({ electionId: election._id });
    const totalVotes = candidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0) + (election.abstainCount || 0);
    const COLORS = [
      "#0EA5E9",
      // Ocean Blue
      "#F97316",
      // Orange
      "#8B5CF6",
      // Violet
      "#10B981",
      // Emerald
      "#F43F5E",
      // Rose
      "#EAB308",
      // Yellow
      "#6366F1",
      // Indigo
      "#EC4899",
      // Pink
      "#14B8A6",
      // Teal
      "#F59E0B"
      // Amber
    ];
    const results = candidates.map((candidate, index) => ({
      name: candidate.name,
      party: candidate.party,
      votes: candidate.voteCount,
      color: COLORS[index % COLORS.length],
      // Cycle through colors
      imageUrl: candidate.imageUrl
    }));
    if (election.abstainCount && election.abstainCount > 0) {
      results.push({
        name: "Abstain",
        party: "N/A",
        votes: election.abstainCount,
        color: "#64748b",
        // Slate-500 for neutral
        imageUrl: void 0
      });
    }
    results.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    res.json({
      title: election.title,
      publishedAt: election.publishedAt,
      totalVotes,
      winner: (() => {
        if (results.length === 0 || results[0].votes === 0) return null;
        const firstVotes = results[0].votes;
        const tiedCandidates = results.filter((r) => r.votes === firstVotes);
        return tiedCandidates.length === 1 ? tiedCandidates[0] : null;
      })(),
      results,
      isTie: results.length > 0 && results[0].votes > 0 && results.filter((r) => r.votes === results[0].votes).length > 1
    });
  } catch (error) {
    console.error("Error fetching public results:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
var getElectionConfig = async (req, res) => {
  try {
    let election = await Election_default.findOne({ status: "active" });
    if (!election) {
      const anyElection = await Election_default.findOne();
      if (!anyElection) {
        return res.status(404).json({ message: "No elections configured. Please start your first election." });
      }
      election = await Election_default.findOne().sort({ createdAt: -1 });
    }
    res.json(election);
  } catch (error) {
    console.error("Error fetching election config:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
var updateElectionConfig = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }
    let election = await Election_default.findOne({ status: "active" });
    if (election) {
      const wasFirstSetup = !election.startDate;
      election.title = title || election.title;
      election.description = description || election.description;
      election.startDate = startDate || election.startDate;
      election.endDate = endDate || election.endDate;
      const updatedElection = await election.save();
      const voters = await User_default.find({ role: "voter" /* VOTER */ }).select("name email");
      const notifications = voters.map((voter) => ({
        user: voter._id,
        type: "info",
        title: "Election Update",
        message: `Election information has been updated: ${title || election.title}`
      }));
      if (notifications.length > 0) {
        await Notification_default.insertMany(notifications);
      }
      const COOLDOWN_MS = 60 * 1e3;
      const canSendEmail = !election.lastEmailSentAt || (/* @__PURE__ */ new Date()).getTime() - new Date(election.lastEmailSentAt).getTime() > COOLDOWN_MS;
      if (canSendEmail) {
        election.lastEmailSentAt = /* @__PURE__ */ new Date();
        await election.save();
        const emailSubject = wasFirstSetup ? `\u{1F4E2} Election Announced: ${election.title}` : `\u{1F4E2} Election Updated: ${election.title}`;
        const startFormatted = new Date(election.startDate).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
        const endFormatted = new Date(election.endDate).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
        const frontendUrl = process.env.FRONTEND_URL || "https://vora-network.vercel.app";
        Promise.allSettled(
          voters.map(
            (voter) => sendEmail({
              to: voter.email,
              subject: emailSubject,
              html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 12px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <img src="${frontendUrl}/logo.png" alt="Logo" style="height: 48px; object-fit: contain;" />
                                </div>
                                <h2 style="color: #0F766E; text-align: center; margin-bottom: 4px;">${emailSubject}</h2>
                                <p style="text-align: center; color: #6b7280; margin-bottom: 24px;">You have a new update about the upcoming election.</p>
                                <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                                    <p style="margin: 0 0 8px;"><strong>Election:</strong> ${title || election.title}</p>
                                    <p style="margin: 0 0 8px; color: #374151;">${description || election.description}</p>
                                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />
                                    <p style="margin: 0 0 6px;">\u{1F5D3}\uFE0F <strong>Voting Opens:</strong> ${startFormatted}</p>
                                    <p style="margin: 0;">\u{1F512} <strong>Voting Closes:</strong> ${endFormatted}</p>
                                </div>
                                <p>Hi <strong>${voter.name}</strong>, make sure you are verified and ready to cast your vote before the deadline.</p>
                                <div style="text-align: center; margin: 28px 0;">
                                    <a href="${frontendUrl}/login" style="background-color: #0F766E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Sign In to Vote</a>
                                </div>
                                <p style="font-size: 11px; color: #9ca3af; text-align: center;">This is an automated notification from the Voting System.</p>
                            </div>
                        `
            }).catch((err) => console.error(`Email failed for ${voter.email}:`, err))
          )
        ).then((results) => {
          const failed = results.filter((r) => r.status === "rejected").length;
          if (failed > 0) console.warn(`\u26A0\uFE0F ${failed} election-update emails failed to send.`);
          else console.log(`\u2705 Election update emails sent to ${voters.length} voters.`);
        });
      } else {
        console.log("\u{1F4EC} Skipping duplicate election update email (Cooldown active)");
      }
      res.json(updatedElection);
    } else {
      const newElection = await Election_default.create({
        title,
        description,
        startDate,
        endDate
      });
      res.json(newElection);
    }
  } catch (error) {
    console.error("Error updating election config:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
var togglePublishResults = async (req, res) => {
  try {
    const { publish, electionId } = req.body;
    let election;
    if (electionId) {
      election = await Election_default.findById(electionId);
    } else {
      election = await Election_default.findOne({ status: "active" });
    }
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    const alreadyPublished = election.resultsPublished;
    election.resultsPublished = publish;
    if (publish) {
      election.publishedAt = /* @__PURE__ */ new Date();
      if (election.status === "active") {
        election.status = "completed";
      }
    } else {
      election.publishedAt = void 0;
    }
    await election.save();
    if (publish && !alreadyPublished) {
      const voters = await User_default.find({ role: "voter" /* VOTER */ }).select("name email");
      const notifications = voters.map((voter) => ({
        user: voter._id,
        type: "success",
        title: "Results Published",
        message: `Results for ${election.title} have been published!`
      }));
      if (notifications.length > 0) {
        await Notification_default.insertMany(notifications);
      }
      const candidates = await Candidate_default.find({ electionId: election._id }).sort({ voteCount: -1 });
      const totalVotes = candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0) + (election.abstainCount || 0);
      const topCandidate = candidates[0];
      const isTie = candidates.length > 1 && topCandidate?.voteCount === candidates[1]?.voteCount;
      const winnerLine = candidates.length === 0 ? "No candidate data available." : isTie ? "\u{1F91D} It's a tie! Check the results page for full details." : `\u{1F3C6} <strong>${topCandidate.name}</strong> (${topCandidate.party}) leads with <strong>${topCandidate.voteCount}</strong> votes.`;
      const frontendUrl = process.env.FRONTEND_URL || "https://vora-network.vercel.app";
      Promise.allSettled(
        voters.map(
          (voter) => sendEmail({
            to: voter.email,
            subject: `\u{1F389} Election Results Are Live: ${election.title}`,
            html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #1a1a1a; border: 1px solid #e5e7eb; border-radius: 12px;">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <img src="${frontendUrl}/logo.png" alt="Logo" style="height: 48px; object-fit: contain;" />
                                </div>
                                <div style="background: linear-gradient(135deg, #0F766E, #0d9488); border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 20px;">
                                    <h2 style="color: white; margin: 0 0 4px;">\u{1F389} Results Are Live!</h2>
                                    <p style="color: #ccfbf1; margin: 0; font-size: 14px;">${election.title}</p>
                                </div>
                                <p>Hi <strong>${voter.name}</strong>,</p>
                                <p>The election results have officially been published. Thank you for participating!</p>
                                <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                                    <p style="margin: 0 0 8px; font-size: 15px;">${winnerLine}</p>
                                    <p style="margin: 0; color: #6b7280; font-size: 13px;">Total votes cast: <strong>${totalVotes}</strong></p>
                                </div>
                                <div style="text-align: center; margin: 28px 0;">
                                    <a href="${frontendUrl}/login" style="background-color: #0F766E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">Sign In to View Results</a>
                                </div>
                                <p style="font-size: 11px; color: #9ca3af; text-align: center;">This is an automated notification from the Voting System.</p>
                            </div>
                        `
          }).catch((err) => console.error(`Results email failed for ${voter.email}:`, err))
        )
      ).then((results) => {
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) console.warn(`\u26A0\uFE0F ${failed} results emails failed to send.`);
        else console.log(`\u2705 Results published emails sent to ${voters.length} voters.`);
      });
    }
    res.json({
      message: `Results ${publish ? "published" : "unpublished"} successfully`,
      resultsPublished: election.resultsPublished,
      publishedAt: election.publishedAt
    });
  } catch (error) {
    console.error("Error toggling publish state:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
var emergencyStopElection = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required to confirm this action" });
    }
    const user = await User_default.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await import_bcryptjs2.default.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password. Action denied." });
    }
    let election = await Election_default.findOne({ status: "active" });
    if (!election) {
      return res.status(404).json({ message: "No active election found to stop." });
    }
    election.endDate = /* @__PURE__ */ new Date();
    await election.save();
    res.json({
      message: "Election has been stopped successfully.",
      election
    });
  } catch (error) {
    console.error("Error stopping election:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
var getElectionHistory = async (req, res) => {
  try {
    const elections = await Election_default.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
var startNewElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate, password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required to start a new election session" });
    }
    const user = await User_default.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "Admin user not found. Please log in again." });
    }
    const isMatch = await import_bcryptjs2.default.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin password." });
    }
    let session;
    try {
      session = await import_mongoose7.default.startSession();
      session.startTransaction();
    } catch (sessionError) {
      console.warn("\u26A0\uFE0F Transactions not supported or session failed. Proceeding without transaction.");
      session = null;
    }
    try {
      await Election_default.updateMany(
        { status: "active" },
        { status: "completed" },
        session ? { session } : {}
      );
      await User_default.updateMany(
        {},
        {
          $set: { hasVoted: false },
          $unset: { voteTransactionHash: "", votedAt: "" }
        },
        session ? { session } : {}
      );
      const newElectionDocs = await Election_default.create([{
        title,
        description,
        startDate,
        endDate,
        status: "active"
      }], session ? { session } : {});
      const newElection = newElectionDocs[0];
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      res.json({
        message: "New election session started successfully.",
        election: newElection
      });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error starting new election:", error);
    res.status(500).json({
      message: error.message || "Server Error",
      details: error.name === "ValidationError" ? error.errors : void 0
    });
  }
};
var resetElection = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required to confirm this action" });
    }
    const user = await User_default.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: "Admin user not found. Please log in again." });
    }
    const isMatch = await import_bcryptjs2.default.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid admin password." });
    }
    const activeElection = await Election_default.findOne({ status: "active" });
    if (!activeElection) {
      return res.status(404).json({ message: "No active election to reset." });
    }
    let session;
    try {
      session = await import_mongoose7.default.startSession();
      session.startTransaction();
    } catch (sessionError) {
      console.warn("\u26A0\uFE0F Transactions not supported. Proceeding without transaction.");
      session = null;
    }
    try {
      const candidatesToReset = await Candidate_default.find({ electionId: activeElection._id }).select("_id").lean();
      const candidateIds = candidatesToReset.map((c) => c._id.toString());
      await Candidate_default.updateMany(
        { electionId: activeElection._id },
        { voteCount: 0 },
        session ? { session } : {}
      );
      if (contract && candidateIds.length > 0) {
        try {
          console.log(`\u{1F517} Resetting votes for ${candidateIds.length} candidates on blockchain...`);
          const tx = await contract.resetVotes(candidateIds);
          await tx.wait();
          console.log(`\u2705 Blockchain votes reset! Tx: ${tx.hash}`);
        } catch (bcError) {
          console.error("\u26A0\uFE0F Blockchain resetVotes failed:", bcError);
        }
      }
      await User_default.updateMany(
        { votedElections: activeElection._id },
        {
          $pull: {
            votedElections: activeElection._id,
            votingRecords: { electionId: activeElection._id }
          },
          $set: { hasVoted: false },
          $unset: { voteTransactionHash: "", votedAt: "" }
        },
        session ? { session } : {}
      );
      activeElection.abstainCount = 0;
      activeElection.resultsPublished = false;
      activeElection.publishedAt = void 0;
      await activeElection.save(session ? { session } : {});
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      res.json({ message: "Active election data has been reset successfully." });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error resetting election:", error);
    res.status(500).json({
      message: error.message || "Server Error",
      details: error.name === "ValidationError" ? error.errors : void 0
    });
  }
};
var deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election_default.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    let session;
    try {
      session = await import_mongoose7.default.startSession();
      session.startTransaction();
    } catch (sError) {
      session = null;
    }
    try {
      const candidatesToDelete = await Candidate_default.find({ electionId: id }).select("_id").lean();
      const candidateIds = candidatesToDelete.map((c) => c._id.toString());
      await Candidate_default.deleteMany({ electionId: id }, session ? { session } : {});
      if (contract && candidateIds.length > 0) {
        try {
          console.log(`\u{1F517} Removing ${candidateIds.length} candidates from blockchain...`);
          for (const cid of candidateIds) {
            const tx = await contract.removeCandidate(cid);
            await tx.wait();
          }
          console.log(`\u2705 Blockchain candidates removed!`);
        } catch (bcError) {
          console.error("\u26A0\uFE0F Blockchain removeCandidate failed:", bcError);
        }
      }
      await User_default.updateMany(
        { votedElections: id },
        {
          $pull: {
            votedElections: id,
            votingRecords: { electionId: id }
          }
        },
        session ? { session } : {}
      );
      await Election_default.findByIdAndDelete(id, session ? { session } : {});
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      res.json({ message: "Election and all associated data deleted successfully." });
    } catch (error) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw error;
    }
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// server/src/routes/adminRoutes.ts
var router3 = import_express3.default.Router();
router3.get("/voters", protect, admin, getAllVoters);
router3.delete("/voters/:id", protect, admin, deleteVoter);
router3.put("/verify-voter/:id", protect, admin, verifyVoter);
router3.get("/dashboard", protect, admin, getDashboardStats);
router3.get("/results", protect, admin, getElectionResults);
router3.get("/election", protect, admin, getElectionConfig);
router3.put("/election", protect, admin, updateElectionConfig);
router3.put("/election/publish", protect, admin, togglePublishResults);
router3.post("/election/stop", protect, admin, emergencyStopElection);
router3.post("/election/reset", protect, admin, resetElection);
router3.post("/election/new", protect, admin, startNewElection);
router3.get("/elections", protect, admin, getElectionHistory);
router3.delete("/election/:id", protect, admin, deleteElection);
router3.get("/settings", protect, admin, getSettings);
router3.put("/settings", protect, admin, updateSettings);
var adminRoutes_default = router3;

// server/src/routes/candidateRoutes.ts
var import_express4 = __toESM(require("express"));

// server/src/controllers/candidateController.ts
var createCandidate = async (req, res) => {
  try {
    const { name, party, manifesto, imageUrl, electionId } = req.body;
    let targetElectionId = electionId;
    if (!targetElectionId) {
      const activeElection = await Election_default.findOne({ status: "active" });
      if (!activeElection) {
        return res.status(400).json({ message: "No active election to add candidates to." });
      }
      targetElectionId = activeElection._id;
    }
    const candidate = await Candidate_default.create({
      name,
      party,
      manifesto,
      imageUrl,
      electionId: targetElectionId
    });
    res.status(201).json(candidate);
    try {
      if (contract) {
        console.log(`\u{1F517} Adding candidate ${candidate.name} to blockchain...`);
        const tx = await contract.addCandidate(candidate._id.toString(), candidate.name);
        console.log(`\u2705 Candidate added to blockchain! Tx Hash: ${tx.hash}`);
      }
    } catch (bcError) {
      console.error("\u26A0\uFE0F Blockchain sync failed (Add Candidate):", bcError);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var getAllCandidates = async (req, res) => {
  try {
    const { electionId } = req.query;
    let query = {};
    if (electionId) {
      query.electionId = electionId;
    } else {
      const activeElection = await Election_default.findOne({ status: "active" });
      if (activeElection) {
        query.electionId = activeElection._id;
      }
    }
    const candidates = await Candidate_default.find(query).sort({ name: 1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var updateCandidate = async (req, res) => {
  try {
    const { name, party, manifesto, imageUrl } = req.body;
    const candidate = await Candidate_default.findById(req.params.id);
    if (candidate) {
      candidate.name = name || candidate.name;
      candidate.party = party || candidate.party;
      candidate.manifesto = manifesto || candidate.manifesto;
      candidate.imageUrl = imageUrl || candidate.imageUrl;
      const updatedCandidate = await candidate.save();
      res.json(updatedCandidate);
    } else {
      res.status(404).json({ message: "Candidate not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
var deleteCandidate = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const candidate = await Candidate_default.findById(candidateId);
    if (candidate) {
      await candidate.deleteOne();
      res.json({ message: "Candidate removed" });
      if (contract) {
        try {
          console.log(`\u{1F517} Removing candidate ${candidateId} from blockchain...`);
          const tx = await contract.removeCandidate(candidateId);
          await tx.wait();
          console.log(`\u2705 Candidate removed from blockchain!`);
        } catch (bcError) {
          console.error("\u26A0\uFE0F Blockchain sync failed (Remove Candidate):", bcError);
        }
      }
    } else {
      res.status(404).json({ message: "Candidate not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// server/src/routes/candidateRoutes.ts
var router4 = import_express4.default.Router();
router4.route("/").get(protect, getAllCandidates).post(protect, admin, createCandidate);
router4.route("/:id").put(protect, admin, updateCandidate).delete(protect, admin, deleteCandidate);
var candidateRoutes_default = router4;

// server/src/routes/voteRoutes.ts
var import_express5 = __toESM(require("express"));

// server/src/controllers/voteController.ts
var import_mongoose8 = __toESM(require("mongoose"));
var castVote = async (req, res) => {
  const session = await import_mongoose8.default.startSession();
  session.startTransaction();
  try {
    const { candidateId } = req.body;
    const userId = req.user?._id;
    if (!candidateId) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: "Candidate ID is required" });
      return;
    }
    const user = await User_default.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: "User not found" });
      return;
    }
    const activeElection = await Election_default.findOne({ status: "active" }).session(session);
    if (!activeElection) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: "No active election found" });
      return;
    }
    if (user.verificationStatus !== "verified" /* VERIFIED */) {
      await session.abortTransaction();
      session.endSession();
      res.status(403).json({ message: "You must be verified to vote" });
      return;
    }
    const alreadyVoted = user.votedElections.includes(activeElection._id);
    if (alreadyVoted) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: "You have already voted in this election" });
      return;
    }
    if (candidateId === "abstain") {
      activeElection.abstainCount = (activeElection.abstainCount || 0) + 1;
      await activeElection.save({ session });
    } else {
      const candidate = await Candidate_default.findById(candidateId).session(session);
      if (!candidate) {
        await session.abortTransaction();
        session.endSession();
        res.status(404).json({ message: "Candidate not found" });
        return;
      }
      await Candidate_default.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } }, { session });
    }
    user.hasVoted = true;
    user.votedAt = /* @__PURE__ */ new Date();
    user.votedElections.push(activeElection._id);
    user.votingRecords.push({
      electionId: activeElection._id,
      transactionHash: void 0,
      // Will fill after blockchain tx if applicable
      votedAt: /* @__PURE__ */ new Date()
    });
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();
    let transactionHash;
    if (candidateId !== "abstain") {
      try {
        if (!contract) {
          throw new Error("Blockchain not configured");
        }
        const safeCandidateId = String(candidateId).trim();
        console.log(`\u{1F517} Submitting vote for '${safeCandidateId}' (Original: '${candidateId}') to blockchain...`);
        const tx = await contract.vote(safeCandidateId);
        transactionHash = tx.hash;
        console.log(`\u2705 Vote submitted! Tx Hash: ${tx.hash}`);
      } catch (bcError) {
        console.error("\u26A0\uFE0F Blockchain sync failed:", bcError);
        console.log("\u{1F504} Rolling back MongoDB changes...");
        user.hasVoted = false;
        user.votedAt = void 0;
        await user.save();
        await Candidate_default.findByIdAndUpdate(candidateId, { $inc: { voteCount: -1 } });
        return res.status(500).json({
          message: "Blockchain transaction failed. Please try again.",
          error: bcError.message
        });
      }
    } else {
    }
    if (transactionHash) {
      user.voteTransactionHash = transactionHash;
      const record = user.votingRecords.find((r) => r.electionId.toString() === activeElection._id.toString());
      if (record) record.transactionHash = transactionHash;
      await user.save();
    }
    res.status(200).json({ message: "Vote cast successfully", transactionHash });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Vote Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Voting failed. Please try again." });
    }
  }
};
var verifyVoteTransaction = async (req, res) => {
  try {
    const { hash } = req.params;
    if (!wallet || !wallet.provider) {
      res.status(503).json({ message: "Blockchain service unavailable" });
      return;
    }
    const tx = await wallet.provider.getTransaction(hash);
    if (!tx) {
      res.status(404).json({ message: "Transaction not found on chain" });
      return;
    }
    const receipt = await wallet.provider.getTransactionReceipt(hash);
    let timestamp = null;
    if (receipt) {
      const block = await wallet.provider.getBlock(receipt.blockNumber);
      if (block) timestamp = new Date(Number(block.timestamp) * 1e3).toISOString();
    }
    res.json({
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      status: receipt?.status === 1 ? "Confirmed" : "Pending/Failed",
      timestamp
    });
  } catch (error) {
    console.error("Verify Transaction Error:", error);
    res.status(500).json({ message: "Error verifying transaction" });
  }
};

// server/src/routes/voteRoutes.ts
var router5 = import_express5.default.Router();
router5.post("/", protect, castVote);
router5.get("/verify/:hash", verifyVoteTransaction);
var voteRoutes_default = router5;

// server/src/routes/electionRoutes.ts
var import_express6 = __toESM(require("express"));
var router6 = import_express6.default.Router();
router6.get("/", getElectionConfig);
router6.get("/results", getPublicElectionResults);
var electionRoutes_default = router6;

// server/src/routes/settingsRoutes.ts
var import_express7 = __toESM(require("express"));
var router7 = import_express7.default.Router();
router7.get("/public", getPublicSettings);
var settingsRoutes_default = router7;

// server/src/index.ts
import_dotenv4.default.config();
var app = (0, import_express8.default)();
var PORT = process.env.PORT || 5e3;
app.use(async (req, res, next) => {
  try {
    await db_default();
    next();
  } catch (err) {
    console.error("Database connection failed for request:", req.path);
    res.status(503).json({ message: "Database connecting, please try again in a few seconds" });
  }
});
var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "https://vora-network.vercel.app",
  "https://vora-voting.vercel.app",
  "https://vora-system.vercel.app",
  "https://vora.vercel.app",
  "http://localhost",
  "http://10.0.2.2"
];
app.use((0, import_cors.default)({
  origin: (origin, callback) => {
    const isLocalNetwork = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin || "");
    if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin) || isLocalNetwork) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(import_express8.default.json());
app.use(import_express8.default.urlencoded({ extended: true }));
app.use((0, import_cookie_parser.default)());
app.set("trust proxy", 1);
app.use("/api/auth", authRoutes_default);
app.use("/api/uploads", uploadRoutes_default);
app.use("/api/admin", adminRoutes_default);
app.use("/api/candidates", candidateRoutes_default);
app.use("/api/vote", voteRoutes_default);
app.use("/api/election", electionRoutes_default);
app.use("/api/settings", settingsRoutes_default);
app.get("/api", (req, res) => {
  res.send("Voting System API is running");
});
app.use((err, req, res, next) => {
  console.error("SERVER ERROR REQ:", req.path, "ERR:", err);
  if (!res.headersSent) {
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : void 0
    });
  }
});
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  db_default().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error("\u274C Failed to connect to MongoDB. Server not started.", err.message);
    process.exit(1);
  });
}
var src_default = app;

// api/index.ts
var api_default = src_default;
/*! Bundled license information:

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

vary/index.js:
  (*!
   * vary
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

cookie-parser/index.js:
  (*!
   * cookie-parser
   * Copyright(c) 2014 TJ Holowaychuk
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
