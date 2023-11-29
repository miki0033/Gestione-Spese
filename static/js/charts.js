const familyDiv = document.querySelector(".family-charts");
const codice_famiglia = familyDiv.id;
const optionDiv = document.querySelector(".charts-option");

const divPeriod1 = document.getElementById("period-selector1");
const divPeriod2 = document.getElementById("period-selector2");
const divUserSelection = document.querySelector(".user-selector");
const period1 = document.getElementById("period1");
const period2 = document.getElementById("period2");
const label1 = document.getElementById("label1");
const label2 = document.getElementById("label2");
//SELETTORI BOTTONI
const p_daily = document.getElementById("quotidiane");
const p_monthly = document.getElementById("mensili");
const p_period = document.getElementById("periodiche");
const p_category = document.getElementById("tipologie");
const p_confronto = document.getElementById("confronto");

const divDaily = document.querySelector(".dailyChart");
const divMonth = document.querySelector(".monthlyChart");
const divPeriodChart = document.querySelector(".periodChart");
const divCategory = document.querySelector(".categoryChart");
const divConfronto = document.querySelector(".compareChart");

const p_btns = [p_daily, p_monthly, p_period, p_category, p_confronto];
const p_charts = [
  divDaily,
  divMonth,
  divPeriodChart,
  divCategory,
  divConfronto,
];
const act_btns = [true, false, false, false, false];

const checkboxNodeList = document.querySelectorAll(".family-checkbox");
var checkboxArr = Array.prototype.slice.call(checkboxNodeList);
/*da controllare il campo checkBoxArr[i].checked 
e prendere il nome dal campo checkBoxArr[i].defaultValue*/

p_daily.addEventListener("click", () => {
  activeButton(p_daily);
  act_btns.forEach((el, index) => (act_btns[index] = false));
  act_btns[0] = true;
  divPeriod1.style.display = "block";
  divPeriod2.style.display = "none";
  divUserSelection.style.display = "none";
  p_charts.forEach((div) => (div.style.display = "none"));
  p_charts[0].style.display = "block";
  checkForm();
});

p_monthly.addEventListener("click", async () => {
  activeButton(p_monthly);
  act_btns.forEach((el, index) => (act_btns[index] = false));
  act_btns[1] = true;
  divPeriod1.style.display = "block";
  divPeriod2.style.display = "none";
  divUserSelection.style.display = "none";
  p_charts.forEach((div) => (div.style.display = "none"));
  p_charts[1].style.display = "block";
  checkForm();
});
p_period.addEventListener("click", async () => {
  activeButton(p_period);
  act_btns.forEach((el, index) => (act_btns[index] = false));
  act_btns[2] = true;
  divPeriod1.style.display = "block";
  divPeriod2.style.display = "block";
  divUserSelection.style.display = "none";
  p_charts.forEach((div) => (div.style.display = "none"));
  p_charts[2].style.display = "block";
  checkForm();
});
p_category.addEventListener("click", async () => {
  activeButton(p_category);
  act_btns.forEach((el, index) => (act_btns[index] = false));
  act_btns[3] = true;
  divPeriod1.style.display = "block";
  divPeriod2.style.display = "block";
  divUserSelection.style.display = "none";
  p_charts.forEach((div) => (div.style.display = "none"));
  p_charts[3].style.display = "block";
  checkForm();
});

p_confronto.addEventListener("click", async () => {
  activeButton(p_confronto);
  act_btns.forEach((el, index) => (act_btns[index] = false));
  act_btns[4] = true;
  divPeriod1.style.display = "block";
  divPeriod2.style.display = "block";
  divUserSelection.style.display = "flex";
  p_charts.forEach((div) => (div.style.display = "none"));
  p_charts[4].style.display = "block";
  checkForm();
});

period1.addEventListener("change", () => {
  checkForm();
});
period2.addEventListener("change", () => {
  checkForm();
});
divUserSelection.addEventListener("change", () => {
  checkForm();
});

function activeButton(activeBtn) {
  p_btns.forEach((btn) => {
    btn.classList.remove("active-btn");
  });
  activeBtn.classList.add("active-btn");
}

function guardArr() {
  /**Controlla se almeno un campo della checkbox è attivo */
  let flag = false;
  checkboxArr.forEach((element) => {
    if (element.checked) {
      flag = true;
    }
  });
  return flag;
}
async function checkForm() {
  /** se viene riempito il campo period1:
   * spese quotidiane
   * spese mensili
   * se viene riempito period 1 + period 2
   * spese periodiche
   * torta tipologie
   * se viene checcata la checkbox
   * confronto
   */

  let fetchD = await fetchData();
  if (period1.value) {
    if (act_btns[0]) {
      //fetch con i dati giornalieri
      let dailyData = fetchD.filter(
        (record) => formatDateFromDatabase(record.data) == period1.value
      );
      creatHistogram(dailyData, "Somma delle spese giornaliere");
    }
    if (act_btns[1]) {
      //grafico mensile

      let monthlyData = fetchD.filter(
        (record) =>
          extractMonth(formatDateFromDatabase(record.data)) ==
          extractMonth(period1.value)
      );
      MonthHistogram(monthlyData, period1.value);
    }
  }
  if (period1.value && period2.value) {
    if (act_btns[2]) {
      //grafico periodico
      let periodData = fetchD;
      PeriodHistogram(periodData, period1.value, period2.value);
    }

    if (act_btns[3]) {
      //grafico tipologie a torta
      CategoryPie(fetchD, period1.value, period2.value);
    }
  }

  if (period1.value && period2.value && guardArr()) {
    if (act_btns[4]) {
      //TODO: fare grafico confronto
      compareHistogram(fetchD, period1.value, period2.value);
    }
  }
}

//CREAZIONE GRAFICI
const fetchData = async () => {
  const response = await fetch("/getchartsdata/" + codice_famiglia);
  const jsondata = await response.json();
  // arrivano i campi: importo, categoria, data, nota, nome, colore
  return jsondata;
};
function creatHistogram(fetchD, msg) {
  var xValues = [];
  fetchD.forEach((element) => {
    if (!xValues.includes(element["nome"])) {
      xValues.push(element["nome"]);
    }
  });

  var yValues = [];

  xValues.forEach((x) => {
    somma = 0;
    fetchD.forEach((element) => {
      if (x === element["nome"]) {
        somma += Number(element["importo"]);
      }
    });
    yValues.push(somma);
  });

  var barColors = ["red", "yellow", "blue", "green", "orange", "purple"];

  new Chart("dailyChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: msg,
      },
    },
  });
}

function MonthHistogram(fetchD, start) {
  var startDate = new Date(start);
  var xValues = []; //deve essere un array con i giorni del periodo
  startDate.setDate(1);
  let endDateDate = new Date(startDate);
  endDateDate.setMonth(startDate.getMonth() + 1);
  console.log(startDate.getDate(), endDateDate.getDate());
  while (startDate.getTime() !== endDateDate.getTime()) {
    xValues.push(
      startDate.getFullYear() +
        "-" +
        (startDate.getMonth() + 1) +
        "-" +
        startDate.getDate()
    );
    startDate.setDate(startDate.getDate() + 1);
  }

  console.log(startDate.getTime());
  //formattazione data startDate.getDate() + "/" + startDate.getMonth()
  var yValues = [];
  xValues.forEach((x) => {
    somma = 0;
    fetchD.forEach((element) => {
      console.log(
        formatDateAddZero(x),
        formatDateFromDatabase(element["data"])
      );
      if (formatDateAddZero(x) == formatDateFromDatabase(element["data"])) {
        somma += Number(element["importo"]);
      }
    });
    yValues.push(somma);
  });

  var barColors = ["red", "green", "blue", "orange"];
  console.log(xValues, yValues);
  new Chart("monthlyChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: getColors(xValues.length),
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Somma spese familiari mensili",
      },
    },
  });
}

function PeriodHistogram(fetchD, start, end) {
  var xValues = [];
  var startDate = new Date(start);
  var endDateDate = new Date(end);
  while (startDate.getTime() !== endDateDate.getTime()) {
    xValues.push(
      startDate.getFullYear() +
        "-" +
        (startDate.getMonth() + 1) +
        "-" +
        startDate.getDate()
    );
    startDate.setDate(startDate.getDate() + 1);
  }
  var yValues = [];
  xValues.forEach((x) => {
    somma = 0;
    fetchD.forEach((element) => {
      if (formatDateAddZero(x) == formatDateFromDatabase(element["data"])) {
        somma += Number(element["importo"]);
      }
    });
    yValues.push(somma);
  });

  var barColors = ["red", "green", "blue", "orange"];

  new Chart("periodChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: getColors(xValues.length),
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Somma spese familiari del periodo",
      },
    },
  });
}

function CategoryPie(fetchD, start, end) {
  var xValues = [];
  let yValues = [];
  var periodArr = [];
  let category_color = [];
  let totale = 0;

  var startDate = new Date(start);
  var endDateDate = new Date(end);
  while (startDate.getTime() !== endDateDate.getTime()) {
    periodArr.push(
      startDate.getFullYear() +
        "-" +
        (startDate.getMonth() + 1) +
        "-" +
        startDate.getDate()
    );
    startDate.setDate(startDate.getDate() + 1);
  }

  fetchD.forEach((element) => {
    //crea l'array con le categorie e quello dei colori
    periodArr.forEach((date) => {
      if (formatDateFromDatabase(element["data"]) == formatDateAddZero(date)) {
        if (!xValues.includes(element["categoria"])) {
          xValues.push(element["categoria"]);
          category_color.push(element["colore"]);
          yValues.push(0);
          console.log(
            formatDateFromDatabase(element["data"]),
            formatDateAddZero(date)
          );
        }
      }
    });
  });
  //somma degli importi per categoria
  fetchD.forEach((element) => {
    for (i = 0; i < xValues.length; i++) {
      somma = 0;
      if (xValues[i] == element["categoria"]) {
        yValues[i] += Number(element["importo"]);
        totale += Number(element["importo"]);
      }
    }
  });

  yValues = converIntoPercent(totale, yValues);

  new Chart("categoryChart", {
    type: "pie",
    data: {
      labels: xValues,
      datasets: [
        {
          label: xValues,
          data: yValues,
          backgroundColor: category_color,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Diagramma a Torta Categorie",
        },
      },
    },
  });
}
function compareHistogram(fetchD, start, end) {
  const xValues = [];
  const periodArr = [];
  //filtra il periodo
  var startDate = new Date(start);
  var endDateDate = new Date(end);
  while (startDate.getTime() !== endDateDate.getTime()) {
    periodArr.push(
      startDate.getFullYear() +
        "-" +
        (startDate.getMonth() + 1) +
        "-" +
        startDate.getDate()
    );
    startDate.setDate(startDate.getDate() + 1);
  }
  const usersId = [];
  checkboxArr.forEach((element) => {
    if (element.checked) {
      xValues.push(element.value); //nomi utenti
      usersId.push(element.id); //id utenti
    }
  });

  var yValues = [];
  usersId.forEach((usid) => {
    somma = 0;
    fetchD.forEach((element) => {
      periodArr.forEach((x) => {
        if (formatDateAddZero(x) == formatDateFromDatabase(element["data"])) {
          if (usid == element["id_utente"]) {
            somma += Number(element["importo"]);
          }
        }
      });
    });
    yValues.push(somma);
  });

  console.log(xValues, yValues);
  new Chart("compareChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: getColors(xValues.length),
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Somma spese familiari per utente",
      },
    },
  });
}

const createCharts = async () => {
  var xValues = [];
  let fetchD = await fetchData();

  fetchD.forEach((element) => {
    if (!xValues.includes(element["nome"])) {
      xValues.push(element["nome"]);
    }
  });

  var yValues = [];

  xValues.forEach((x) => {
    somma = 0;
    fetchD.forEach((element) => {
      if (x === element["nome"]) {
        somma += Number(element["importo"]);
      }
    });
    yValues.push(somma);
  });

  var barColors = ["red", "green", "blue", "orange", "brown"];

  new Chart("myChart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: getColors(xValues.length),
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "Somma spese familiari",
      },
    },
  });
};

function formatDateFromDatabase(date) {
  let str = date.split(",");
  str = str[1].split("00:");
  str = str[0].trim();
  str = str.split(" ");
  if (str[1] == "Jan") {
    str[1] = "01";
  } else if (str[1] == "Feb") {
    str[1] = "02";
  } else if (str[1] == "Mar") {
    str[1] = "03";
  } else if (str[1] == "Apr") {
    str[1] = "04";
  } else if (str[1] == "May") {
    str[1] = "05";
  } else if (str[1] == "Jun") {
    str[1] = "06";
  } else if (str[1] == "Jul") {
    str[1] = "07";
  } else if (str[1] == "Aug") {
    str[1] = "08";
  } else if (str[1] == "Sep") {
    str[1] = "09";
  } else if (str[1] == "Oct") {
    str[1] = "10";
  } else if (str[1] == "Nov") {
    str[1] = "11";
  } else if (str[1] == "Dec") {
    str[1] = "12";
  }
  let result = str[2] + "-" + str[1] + "-" + str[0];
  return result;
}
function formatDateAddZero(date) {
  let str = date.split("-");
  for (let i = 1; i < 3; i++) {
    if (Number(str[i]) < 10) {
      str[i] = 0 + str[i];
    }
  }
  result = str[0] + "-" + str[1] + "-" + str[2];
  return result;
}
function extractMonth(date) {
  let str = date.split("-");
  return str[1];
}

function converIntoPercent(tot, arr) {
  let result = [];
  arr.forEach((value) => {
    result.push((value * 100) / tot);
  });
  for (let i = 0; i < result.length; i++) {
    result[i] = result[i].toFixed(2);
  }
  return result;
}

function getColors(num) {
  let barColors = [];
  let colors = ["blue", "red", "green", "yellow", "violet", "orange"];
  for (let i = 0; i < num; i++) {
    //console.log(colors[i % colors.length]);
    barColors.push(colors[i % colors.length]);
  }
  return barColors;
}

checkForm();
