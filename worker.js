let globalToken = null;
let globalData = null;

onmessage = function (e) {
  if (e.data.type === "token") globalToken = e.data.value;
};

const fetchData = (token) => {
  fetch("https://webexapis.com/v1/rooms", {
    headers: new Headers({
      Authorization: "Bearer " + token,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        postMessage({ status: "error" });
      }
    })
    .then((data) => {
      if (data) {
        if (!globalData) globalData = data;
        if (JSON.stringify(data) === JSON.stringify(globalData)) {
          postMessage({ status: "unchanged" });
        } else {
          postMessage({ status: "changed", payload: data });

          globalData = data;
          try {
            fetch(process.env.TELEGRAM_URL);
          } catch (error) {
            console.log(error);
          }
        }
      }
    });
};
function timedCount() {
  if (globalToken) {
    fetchData(globalToken);
  } else {
    postMessage({ status: "notoken" });
  }

  setTimeout("timedCount()", 1000 * 60 * 10);
}

timedCount();
