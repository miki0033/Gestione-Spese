const select = document.querySelector(".select-color");
console.log({ select });
select.addEventListener("change", (event) => {
  console.log({ select });
  select.style.backgroundColor = select.value;
  /*select.forEach((color) => {
    if (color.selected == true) select.style.backgroundColor = color.value;
  });*/
});
