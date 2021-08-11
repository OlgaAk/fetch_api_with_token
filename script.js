var w;

function startWorker() {
  if (typeof Worker !== "undefined") {
    if (typeof w == "undefined") {
      w = new Worker("./worker.js");
    }
    w.onmessage = function (event) {
      alert(event.data);
    };
  } else {
    alert("Sorry! No Web Worker support.");
  }
}

function stopWorker() {
  w.terminate();
  w = undefined;
}

document
  .getElementById("subscribe-button")
  .addEventListener("click", startWorker);
document
  .getElementById("unsubscribe-button")
  .addEventListener("click", stopWorker);

const fetchInfo = () => {
  let token = document.getElementById("token").value;
  if (!token) {
    let savedToken = localStorage.getItem("fetch-app-token");
    if (savedToken) token = savedToken;
  } else {
    localStorage.setItem("fetch-app-token", token);
  }

  console.log(token);
  fetch("https://webexapis.com/v1/rooms", {
    headers: new Headers({
      Authorization: "Bearer " + token,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        document.getElementById("content-box").innerHTML = response.statusText;
      }
    })
    .then((data) => {
      if (data) {
        console.log(data);
        document.getElementById("content-box").innerHTML = "";
        data.items.forEach((element) => {
          let outerdiv = document.createElement("div");
          outerdiv.style.marginBottom = "10px";
          outerdiv.style.marginTop = "5px";
          outerdiv.classList.add("card");
          let div = document.createElement("div");
          div.classList.add("card-body");
          for (const property in element) {
            let p = document.createElement("p");
            p.style.margin = 0;
            p.style.fontSize = "0.9em";
            if (property === "lastActivity") {
              let date = new Date(element[property]);
              date = date.toLocaleString("ru-ru");
              p.innerHTML =
                "<b>" +
                property +
                "</b>: " +
                "<span style='color:red'>" +
                date +
                "</span>";
            } else {
              p.innerHTML = "<b>" + property + "</b>: " + element[property];
            }

            div.appendChild(p);
          }
          outerdiv.appendChild(div);
          document.getElementById("content-box").appendChild(outerdiv);
        });
      }
    })
    .catch((error) => {
      console.log("error " + error);
      document.getElementById("content-box").innerHTML = error.message;
    });
};
// 'lastActivity":"[^"]*"'
document.getElementById("fetch-button").addEventListener("click", fetchInfo);
