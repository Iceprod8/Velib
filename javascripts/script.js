const request = require('request');

// fonction pour le darkMode
const root = document.querySelector(':root');
document.querySelector("input[type='checkbox']#dark-toggle").addEventListener('click', function () {
  root.classList.toggle('dark-mode');
});

const disponibiliteStationsUrl = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=-1&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes&facet=arrondissement';

const arrondissements = {};

// Récupération des données de disponibilité des stations
request.get(disponibiliteStationsUrl, (err, response, body) => {
  if (err) {
    console.error(err);
    return;
  }

  const disponibilites = JSON.parse(body);
  disponibilites.records.forEach(disponibilite => {
    const idStation = disponibilite.fields.stationcode;
    const commune = disponibilite.fields.nom_arrondissement_communes
    const nomStation = disponibilite.fields.name;
    const nbVelosTotal = disponibilite.fields.capacity;
    const nbVelosMecanique = disponibilite.fields.mechanical;
    const nbVelosElectrique = disponibilite.fields.ebike;
    const bornePayment = disponibilite.fields.is_renting;

    let arrondissement = 0
    if (commune === "Paris") {
      arrondissement = idStation.substring(0, 2)
    } else {
      const id = parseInt(idStation.substring(0, 2))
      if( id >= 90){
        arrondissement = 92
      } else if (id >= 50) {
        arrondissement = 95
      } else if (id >= 40) {
        arrondissement = 94
      } else if (id >= 30) {
        arrondissement = 93
      } else if (id >= 20) {
        arrondissement = 92
      }
    }

    if (!arrondissements[arrondissement]) {
      arrondissements[arrondissement] = [];
    }

    arrondissements[arrondissement].push({
      ville: commune,
      nom: nomStation,
      nbVelosTotal: nbVelosTotal,
      nbVelosMecanique: nbVelosMecanique,
      nbVelosElectrique: nbVelosElectrique,
      bornePayment: bornePayment,
    });
  });
});
