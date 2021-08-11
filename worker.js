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
        if (!globalData) data = globalData;
        console.log(data, globalData);
        console.log(JSON.stringify(data), JSON.stringify(globalData));
        if (JSON.stringify(data) === JSON.stringify(globalData)) {
          postMessage({ status: "unchanged" });
        } else {
          postMessage({ status: "changed", payload: data });

          globalData = data;
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

  setTimeout("timedCount()", 1000 * 4);
}

timedCount();
