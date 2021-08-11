const globalToken = null;
const globalData = null;

onmessage = function (e) {
  globalToken = e.data;
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
        if (JSON.stringify(data) === JSON.stringify(globalData)) {
          postMessage({ status: "unchanged" });
        } else {
          postMessage({ status: "changed", payload: data });
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

  setTimeout("timedCount()", 1000 * 60);
}

timedCount();
