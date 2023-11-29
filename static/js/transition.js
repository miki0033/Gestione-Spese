const page = [];
page[0] = document.getElementById("page1");
page[1] = document.getElementById("page2");
page[2] = document.getElementById("page3");
page[3] = document.getElementById("page4");
const link = [];
link[0] = document.getElementById("link1");
link[1] = document.getElementById("link2");
link[2] = document.getElementById("link3");
link[3] = document.getElementById("link4");

const btnUp = document.querySelector(".pageup");
const btnDown = document.querySelector(".pagedown");
//FUNCTION
function pageUp() {
  let nPage = Number(btnUp.id);

  if (nPage > 1) {
    //tolgo la visualizzazione alla pagina attuale
    page[nPage - 1].style.display = "none";
    link[nPage - 1].classList.remove("active");
    nPage -= 1;
    btnUp.id = nPage;
    btnDown.id = nPage;
    btnDisplay(nPage);
    //visualizzo l'altra pag
    page[nPage - 1].style.display = "block";
    link[nPage - 1].classList.add("active");
  } else {
    return;
  }
}

function pageDown() {
  let nPage = Number(btnDown.id);

  if (nPage < 5) {
    //tolgo la visualizzazione alla pagina attuale
    page[nPage - 1].style.display = "none";
    link[nPage - 1].classList.remove("active");
    nPage += 1;
    btnUp.id = nPage;
    btnDown.id = nPage;
    btnDisplay(nPage);
    //visualizzo l'altra pag
    page[nPage - 1].style.display = "block";
    link[nPage - 1].classList.add("active");
  } else {
    return;
  }
}
function btnDisplay(page) {
  if (page === 1) {
    btnUp.style.display = "none";
  } else {
    btnUp.style.display = "block";
  }
  if (page === 4) {
    btnDown.style.display = "none";
  } else {
    btnDown.style.display = "block";
  }
}

function goToPage(nPage) {
  let actPage = btnUp.id;
  //operazioni sulla pagina attuale
  page[actPage - 1].style.display = "none";
  link[actPage - 1].classList.remove("active");
  //visualizzo l'altra pag
  btnUp.id = nPage;
  btnDown.id = nPage;
  btnDisplay(nPage);
  page[nPage - 1].style.display = "block";
  link[nPage - 1].classList.add("active");
}
//EVENT LISTENER
btnUp.addEventListener("click", pageUp);
btnDown.addEventListener("click", pageDown);
link[0].addEventListener("click", () => {
  goToPage(1);
});
link[1].addEventListener("click", () => {
  goToPage(2);
});
link[2].addEventListener("click", () => {
  goToPage(3);
});
link[3].addEventListener("click", () => {
  goToPage(4);
});
