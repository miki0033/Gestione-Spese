const fetchData = async () => {
  const response = await fetch("/getcategorydata");
  const jsondata = await response.json();
  // arrivano i campi: importo, categoria, data, nota, nome, colore
  return jsondata;
};

createWidget();
async function createWidget() {
  let fetchD = await fetchData();
  console.log(fetchD);
  CategoryPie(fetchD);
}

function CategoryPie(fetchD) {
  var xValues = [];
  let yValues = [];
  let category_color = [];
  let totale = 0;

  fetchD.forEach((element) => {
    //crea l'array con le categorie e quello dei colori
    if (!xValues.includes(element["categoria"])) {
      xValues.push(element["categoria"]);
      category_color.push(element["colore"]);
      yValues.push(0);
    }
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
