formatDate();
function formatDate() {
  const node_date = document.querySelectorAll(".date");
  var dateArr = Array.prototype.slice.call(node_date);
  dateArr.forEach((p_date) => {
    console.log(p_date);
    data = p_date.innerText;
    dataArr = data.split("-");
    p_date.innerText = dataArr[2] + "/" + dataArr[1] + "/" + dataArr[0]; //formato %d%m%Y
  });
}
