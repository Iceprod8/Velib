const request = require('request');

// fonction pour le darkMode
const root = document.querySelector(':root');
document.querySelector("input[type='checkbox']#dark-toggle").addEventListener('click', function () {
  root.classList.toggle('dark-mode');
});


/*

    Double Range Slider

*/


const rangeSliderEl = document.querySelector('.range-slider');
const rangeSliderFromEl = document.querySelector('.range-slider-from');
const rangeSliderToEl = document.querySelector('.range-slider-to');

rangeSliderFromEl.addEventListener('input', (e) => {
  if (!(e.target.value > rangeSliderToEl.value)) {
    rangeSliderEl.style.setProperty(
      '--value-a',
      e.target.value
    );
    rangeSliderEl.style.setProperty(
      '--text-value-a',
      JSON.stringify(e.target.value)
    );
    rangeInputFromEl.value = e.target.value;
  } else {
    rangeSliderEl.style.setProperty(
      '--value-a',
      rangeSliderToEl.value
    );
    rangeSliderEl.style.setProperty(
      '--text-value-a',
      JSON.stringify(rangeSliderToEl.value)
    );
    rangeSliderFromEl.value = rangeSliderToEl.value;
  }
});

rangeSliderToEl.addEventListener('input', (e) => {
  if (!(e.target.value < rangeSliderFromEl.value)) {
    rangeSliderEl.style.setProperty(
      '--value-b',
      e.target.value
    );
    rangeSliderEl.style.setProperty(
      '--text-value-b',
      JSON.stringify(e.target.value)
    );
    rangeInputToEl.value = e.target.value;
  } else {
    rangeSliderEl.style.setProperty(
      '--value-a',
      rangeSliderFromEl.value
    );
    rangeSliderEl.style.setProperty(
      '--text-value-a',
      JSON.stringify(rangeSliderFromEl.value)
    );
    rangeSliderToEl.value = rangeSliderFromEl.value;
  }
});


/*

    Recup de la BDD Velib de opendata paris

*/
const disponibiliteStationsUrl = 'https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=-1&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes&facet=arrondissement';

const Allarrondissements = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 92, 93, 94, 95]
const ville = []
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
      if (idStation.length > 4) {
        arrondissement = parseInt(idStation.substring(0, 2))
      } else if (idStation.length === 4) {
        arrondissement = parseInt(idStation.substring(0, 1))
      }
    } else {
      const id = parseInt(idStation.substring(0, 2))
      if (id < 60 && id >= 20) {
        if (id >= 50) {
          arrondissement = 95
        } else if (id >= 40) {
          arrondissement = 94
        } else if (id >= 30) {
          arrondissement = 93
        } else if (id >= 20) {
          arrondissement = 92
        }
      }
    }
    if (ville.includes(commune) === false) {
      ville.push(commune)
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
  ville.sort()
  let listVille = document.getElementById('list-ville-all')
  const listV = ville.map((v) => {
    let affiche = document.createElement('li')
    affiche.classList.add('list-ville')
    affiche.innerHTML = `${v}`
    return affiche
  })
  listV.forEach((item) => {
    if (item !== null) {
      listVille.appendChild(item);
    }
  });
  /*

  Selection avec entre de text et menu deroulant

*/

  const inputField = document.querySelector('.chosen-value');
  const dropdown = document.querySelector('.value-list');
  const dropdownArray = [...document.querySelectorAll('.list-ville')];
  console.log(typeof dropdownArray);
  dropdown.classList.add('open');
  inputField.focus(); // Demo purposes only
  let valueArray = [];
  dropdownArray.forEach(item => {
    valueArray.push(item.textContent);
  });

  const closeDropdown = () => {
    dropdown.classList.remove('open');
  };

  inputField.addEventListener('input', () => {
    dropdown.classList.add('open');
    let inputValue = inputField.value.toLowerCase();
    let valueSubstring;
    if (inputValue.length > 0) {
      for (let j = 0; j < valueArray.length; j++) {
        if (!(inputValue.substring(0, inputValue.length) === valueArray[j].substring(0, inputValue.length).toLowerCase())) {
          dropdownArray[j].classList.add('closed');
        } else {
          dropdownArray[j].classList.remove('closed');
        }
      }
    } else {
      for (let i = 0; i < dropdownArray.length; i++) {
        dropdownArray[i].classList.remove('closed');
      }
    }
  });

  dropdownArray.forEach(item => {
    item.addEventListener('click', evt => {
      inputField.value = item.textContent;
      dropdownArray.forEach(dropdown => {
        dropdown.classList.add('closed');
      });
    });
  });

  inputField.addEventListener('focus', () => {
    inputField.placeholder = 'Type to filter';
    dropdown.classList.add('open');
    dropdownArray.forEach(dropdown => {
      dropdown.classList.remove('closed');
    });
  });

  inputField.addEventListener('blur', () => {
    inputField.placeholder = 'Select state';
    dropdown.classList.remove('open');
  });

  document.addEventListener('click', evt => {
    const isDropdown = dropdown.contains(evt.target);
    const isInput = inputField.contains(evt.target);
    if (!isDropdown && !isInput) {
      dropdown.classList.remove('open');
    }
  });
});

/*

    Affichage vers la page html

*/

let ulAffiche = document.getElementById('affiche-selection')
let selectArr = document.getElementById('arrondisment');
let inputVille = document.getElementById('input-ville')
let button = document.getElementById('button-selection');


function mapSelect(el) {
  const listStation = el.map((sta) => {
    let affiche = document.createElement('li')
    affiche.classList.add('list-station')
    affiche.innerHTML = `<p>${sta.ville},${sta.nom},${sta.nbVelosTotal},${sta.nbVelosMecanique},${sta.nbVelosElectrique},${sta.bornePayment}</p>`
    return affiche
  })
  listStation.forEach((item) => {
    if (item !== null) {
      ulAffiche.appendChild(item);
    }
  });
}

function Select(el) {
  let affiche = document.createElement('li')
  affiche.classList.add('list-station')
  affiche.innerHTML = `<p>${el.ville},${el.nom},${el.nbVelosTotal},${el.nbVelosMecanique},${el.nbVelosElectrique},${el.bornePayment}</p>`
  ulAffiche.appendChild(affiche);
}

button.addEventListener('click', () => {
  ulAffiche.innerHTML = ""
  ca = ''
  if (selectArr.value !== 'All') {
    ca = `${ca}A`
  }
  if (inputVille.value !== '') {
    ca = `${ca}V`
  }
  let select;
  console.log(ca)
  switch (ca) {
    case '':
      for (let i = 0; i < Allarrondissements.length; i++) {
        select = arrondissements[Allarrondissements[i]];
        mapSelect(select)
      }
      break;
    case 'A':
      select = arrondissements[parseInt(selectArr.value)]
      mapSelect(select)
      break;
    case 'V':
      for (let i = 0; i < Allarrondissements.length; i++) {
        select = arrondissements[Allarrondissements[i]];
        select.forEach(element => {
          if (element.ville === inputVille.value) {
            Select(element)
          }
        });
      }
      break;
    case 'AV':
      select = arrondissements[parseInt(selectArr.value)]
      select.forEach(element => {
        if (element.ville === inputVille.value) {
          Select(element)
        }
      });
      break;
  }
})
