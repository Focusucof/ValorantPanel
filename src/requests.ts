import LocalRiotClient from "./LocalRiotClient";
import axios, { Axios, AxiosInstance } from "axios";
import ranks from "./ranks";
import * as fs from 'fs';

const clientVersion = "release-04.07-shipping-15-699063";

async function main(userDetailsObject) {

    /**
     * If game is open refresh data else use cached data
     */
    /* if(LocalRiotClient.gameOpen()) {
        /* ======================= USER AUTH ======================== 
        var userDetails: any = {};
        const localRiotClient = LocalRiotClient.initFromLockFile();
        await localRiotClient.getCredentials().then((response: any) => {
            console.log(response);
            userDetails = response.data;
        }); */
        /* ========================================================== */

        /* const assistSettings = process.env.APPDATA + '\\Assist\\Settings.json';
        const file: any = fs.readFileSync(assistSettings);
        const jfile = JSON.parse(file);
        const name = fs.readFileSync('config', 'utf8').trim();

        var puuid;
        for(let i = 0; i < jfile.Accounts.length; i++) {
            if(jfile.Accounts[i].Gamename == name) {
                puuid = jfile.Accounts[i].puuid;
            }
        } */

        const puuid = userDetailsObject.puuid;
        const userDetails = userDetailsObject.userDetails;

        console.log(puuid)

        const pdRequest: AxiosInstance = axios.create({
            baseURL: 'https://pd.na.a.pvp.net/',
            method: 'GET',
            headers: {
                'X-Riot-Entitlements-JWT': userDetails.entitlements,
                'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
                'Authorization': userDetails.Authorization,
                'X-Riot-ClientVersion': clientVersion
            }
        });
        var user: any = "";
        user = await getUserFromID(puuid, userDetails.Authorization, userDetails.entitlements);
        const rankInfo = await getRanks(puuid, pdRequest);
        var leaderboardPlace: any = "";
        if(rankInfo.rankID >= 21) {
            leaderboardPlace = await getLeaderboardPlace(puuid, pdRequest, user[0].GameName);
        }
        
        var data = {
            user: user,
            rankInfo: rankInfo,
            leaderboardPlace: leaderboardPlace
        }

        fs.writeFileSync('./data.json', JSON.stringify(data));

        return data;
    /* } else { // return cached data
        return JSON.parse(fs.readFileSync('./data.json').toString());
    } */

}

async function getRanks(puuid: string, requestBase: AxiosInstance) {
    var rankID: number = 0;
    var rank;
    var elo;
    await requestBase.get(`mmr/v1/players/${puuid}/competitiveupdates?startIndex=0&endIndex=1&queue=competitive`).then(response => {
        rankID = response.data.Matches[0].TierAfterUpdate;
        rank = ranks[rankID];
        elo = response.data.Matches[0].RankedRatingAfterUpdate;
        console.log('a')
    });
    return {
        rank: rank,
        rankID: rankID,
        elo: elo
    };
}

async function getLeaderboardPlace(puuid: string, requestBase: AxiosInstance, gameName: string) {
    var leaderboardPlace;
    await requestBase.get(`mmr/v1/leaderboards/affinity/na/queue/competitive/season/d929bc38-4ab6-7da4-94f0-ee84f8ac141e?startIndex=0&size=10&query=${gameName}`).then(response => {
        for(let i = 0; i < response.data.Players.length; i++) {
            if(response.data.Players[i].puuid == puuid) {
                leaderboardPlace = response.data.Players[i].leaderboardRank;
            }
            console.log('b')
        }
    });
    return leaderboardPlace;
}

async function getUserFromID(puuid: string, accessToken: string, entitlements: string) {
    var data;

    var options: any = {
        method: 'PUT',
        url: 'https://pd.na.a.pvp.net/name-service/v2/players',
        headers: { 'Content-Type': 'text/plain' },
        data: '[\n	\"' + puuid + '\"\n]'
    };
      
    await axios.request(options).then((response: any) => {
        data = response.data;
        console.log('c')
    });
    
    return data;
}

export default main;

