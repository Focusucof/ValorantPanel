"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var fs = require("fs");
var https = require("https");
var LocalRiotClient = /** @class */ (function () {
    function LocalRiotClient(username, password, port) {
        this.username = username;
        this.password = password;
        this.port = port;
        this.authorization = Buffer.from("".concat(username, ":").concat(password)).toString('base64');
        this.axios = axios_1["default"].create({
            baseURL: "https://127.0.0.1:".concat(port),
            headers: {
                Authorization: "Basic ".concat(this.authorization)
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
    }
    LocalRiotClient.initFromLockFile = function () {
        var lockfile = this.parseLockFile();
        if (lockfile) {
            return new LocalRiotClient('riot', lockfile.password, lockfile.port);
        }
        else {
            return false;
        }
    };
    LocalRiotClient.gameOpen = function () {
        var lockfile = this.parseLockFile();
        if (lockfile) {
            return true;
        }
        else {
            return false;
        }
    };
    LocalRiotClient.parseLockFile = function () {
        var path = "".concat(process.env.LOCALAPPDATA, "\\Riot Games\\Riot Client\\Config\\lockfile");
        // read lockfile
        if (fs.existsSync(path)) {
            var lockfileContents = fs.readFileSync(path, 'utf8');
            /**
             * expected lockfile contents
             * name:pid:port:password:https
             */
            var matches = lockfileContents.split(':');
            var name_1 = matches[0];
            var pid = matches[1];
            var port = matches[2];
            var password = matches[3];
            var protocol = matches[4];
            return {
                'raw': lockfileContents,
                'name': name_1,
                'pid': pid,
                'port': port,
                'password': password,
                'protocol': protocol
            };
        }
        // falsy if lockfile doesn't exist
        return;
    };
    LocalRiotClient.prototype.getFriends = function () {
        return this.axios.get('/chat/v4/friends');
    };
    LocalRiotClient.prototype.getSession = function () {
        return this.axios.get("/chat/v1/session");
    };
    LocalRiotClient.prototype.getPresence = function () {
        return this.axios.get('/chat/v4/presences');
    };
    LocalRiotClient.prototype.getHelp = function () {
        return this.axios.get('/help');
    };
    LocalRiotClient.prototype.getCredentials = function () {
        return this.axios.get("/entitlements/v1/token");
    };
    LocalRiotClient.prototype.getServerRegion = function () {
        return this.axios.post("player-affinity/product/v1/token", {
            product: "valorant"
        });
    };
    return LocalRiotClient;
}());
exports["default"] = LocalRiotClient;
//# sourceMappingURL=LocalRiotClient.js.map