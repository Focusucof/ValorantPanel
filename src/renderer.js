const { ipcRenderer } = require('electron');
ipcRenderer.on("message", (event, data) => {
    console.log(event, data);

    var name = document.getElementById("name");
    name.innerHTML = data.user[0].GameName + "#" + data.user[0].TagLine;

    var rank = document.getElementById("rank");
    rank.innerHTML = data.rankInfo.rank;

    if(data.leaderboardPlace != "") {
        rank.innerHTML += " #" + data.leaderboardPlace;
    }

    var elo = document.getElementById("elo");
    elo.innerHTML = "ELO: " + data.rankInfo.elo;
});

