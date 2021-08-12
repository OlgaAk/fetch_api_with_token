var w;
let apiData = null;
let fetchTime = null;

function startWorker() {
  if (typeof Worker !== "undefined") {
    if (typeof w == "undefined") {
      w = new Worker("./worker.js");
    }
    w.postMessage({ type: "token", value: getToken() });
    w.onmessage = function (event) {
      console.log(event.data);
      if (event.data.status == "changed") {
        updateUI(event.data.payload, " Changes available!");
        stopWorker();
        fetch(TELEGRAM_URL);
      } else if (event.data.status == "unchanged") {
        document.getElementById("update-time").innerText =
          new Date().toLocaleString("ru-ru") + " No changes";
      }
    };
  } else {
    alert("Sorry! No Web Worker support.");
  }
}

function stopWorker() {
  w.terminate();
  w = undefined;
}

const getToken = () => {
  let input = document.getElementById("token").value;
  if (!input) {
    let savedToken = localStorage.getItem("fetch-app-token");
    if (savedToken) return savedToken;
  } else {
    localStorage.setItem("fetch-app-token", input);
  }
  return input;
};

const getApiData = () => {
  if (!apiData) {
    let data = localStorage.getItem("fetch-app-data");
    if (data) {
      apiData = JSON.parse(data);
    }
  }
  return apiData;
};

const getApiFetchTime = () => {
  if (!fetchTime) {
    let time = localStorage.getItem("fetch-app-time");
    if (time) {
      fetchTime = new Date(JSON.parse(time));
    }
  }
  return fetchTime;
};

const setApiData = (newData) => {
  apiData = newData;
  fetchTime = new Date();
  localStorage.setItem("fetch-app-data", JSON.stringify(newData));
  localStorage.setItem("fetch-app-time", JSON.stringify(new Date()));
};

const fetchInfo = () => {
  const token = getToken();
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
        if (JSON.stringify(data) != JSON.stringify(apiData)) {
          if (apiData == null) {
            updateUI(data);
          } else {
            updateUI(data, " Changes available!");
          }
          setApiData(data);
        } else {
          // if data is the same
          updateStatus();
        }
      }
    })
    .catch((error) => {
      console.log("error " + error);
      document.getElementById("content-box").innerHTML = error.message;
    });
};

const updateUI = (data, changesStatus, time) => {
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
    updateStatus(changesStatus, time);
  });
};

const updateStatus = (changesStatus, time) => {
  let timeString;
  if (time != undefined) {
    timeString = time.toLocaleString("ru-ru");
  } else {
    timeString = new Date().toLocaleString("ru-ru");
  }
  document.getElementById("update-time").innerText =
    timeString + (changesStatus != undefined ? changesStatus : "");
};

const initPage = () => {
  document
    .getElementById("subscribe-button")
    .addEventListener("click", startWorker);
  document
    .getElementById("unsubscribe-button")
    .addEventListener("click", stopWorker);

  document.getElementById("fetch-button").addEventListener("click", fetchInfo);
  let data = getApiData();
  let time = getApiFetchTime();
  if (data && time) {
    updateUI(data, "", time);
  }
};

initPage();
