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
Object.defineProperty(exports, "__esModule", { value: true });
const LocalRiotClient_1 = require("./LocalRiotClient");
const axios_1 = require("axios");
const ranks_1 = require("./ranks");
const fs = require("fs");
const clientVersion = "release-04.07-shipping-15-699063";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * If game is open refresh data else use cached data
         */
        if (LocalRiotClient_1.default.gameOpen()) {
            /* ======================= USER AUTH ======================== */
            var userDetails = {};
            const localRiotClient = LocalRiotClient_1.default.initFromLockFile();
            yield localRiotClient.getCredentials().then((response) => {
                userDetails = response.data;
            });
            /* ========================================================== */
            const pdRequest = axios_1.default.create({
                baseURL: 'https://pd.na.a.pvp.net/',
                method: 'GET',
                headers: {
                    'X-Riot-Entitlements-JWT': userDetails.token,
                    'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
                    'Authorization': 'Bearer ' + userDetails.accessToken,
                    'X-Riot-ClientVersion': clientVersion
                }
            });
            var user = "";
            user = yield getUserFromID(userDetails.subject, userDetails.accessToken, userDetails.token);
            const rankInfo = yield getRanks(userDetails.subject, pdRequest);
            var leaderboardPlace = "";
            if (rankInfo.rankID >= 21) {
                leaderboardPlace = yield getLeaderboardPlace(userDetails.subject, pdRequest, user.GameName);
            }
            var data = {
                user: user,
                rankInfo: rankInfo,
                leaderboardPlace: leaderboardPlace
            };
            fs.writeFileSync('./data.json', JSON.stringify(data));
            return data;
        }
        else { // return cached data
            return JSON.parse(fs.readFileSync('./data.json').toString());
        }
    });
}
function getRanks(puuid, requestBase) {
    return __awaiter(this, void 0, void 0, function* () {
        var rankID = 0;
        var rank;
        var elo;
        var leaderboardPlace;
        yield requestBase.get(`mmr/v1/players/${puuid}/competitiveupdates?startIndex=0&endIndex=1&queue=competitive`).then(response => {
            rankID = response.data.Matches[0].TierAfterUpdate;
            rank = ranks_1.default[rankID];
            elo = response.data.Matches[0].RankedRatingAfterUpdate;
        });
        return {
            rank: rank,
            rankID: rankID,
            elo: elo
        };
    });
}
function getLeaderboardPlace(puuid, requestBase, gameName) {
    return __awaiter(this, void 0, void 0, function* () {
        var leaderboardPlace;
        yield requestBase.get(`mmr/v1/leaderboards/affinity/na/queue/competitive/season/d929bc38-4ab6-7da4-94f0-ee84f8ac141e?startIndex=0&size=10&query=${gameName}`).then(response => {
            for (let i = 0; i < response.data.Players.length; i++) {
                if (response.data.Players[i].puuid == puuid) {
                    leaderboardPlace = response.data.Players[i].leaderboardRank;
                }
            }
        });
        return leaderboardPlace;
    });
}
function getUserFromID(puuid, accessToken, entitlements) {
    return __awaiter(this, void 0, void 0, function* () {
        var data;
        var options = {
            method: 'PUT',
            url: 'https://pd.na.a.pvp.net/name-service/v2/players',
            headers: { 'Content-Type': 'text/plain' },
            data: '[\n	\"' + puuid + '\"\n]'
        };
        yield axios_1.default.request(options).then((response) => {
            data = response.data;
        });
        return data;
    });
}
exports.default = main;
//# sourceMappingURL=requests.js.map