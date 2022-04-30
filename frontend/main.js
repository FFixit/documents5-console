import "./main.css";

init();

function init() {
  let themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", toggleTheme);

  if (localStorage.getItem("theme") == "light") {
    toggleTheme();
  }

  let form = document.querySelector("div#form>form");
  let hostElement = form.querySelector("#host");
  let portElement = form.querySelector("#port");

  let searchParams = new URLSearchParams(location.search);
  hostElement.value = searchParams.get("hostname") || "localhost";
  portElement.value = parseInt(searchParams.get("port")) || 11000;

  hostElement.form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateSearchParams(hostElement.value, portElement.value);
  });

  window.socket = new WebSocket("ws://" + location.host);

  socket.addEventListener("open", function (event) {
    let searchParams = new URLSearchParams(location.search);

    let connectPackage = {
      action: "connect",
      hostname: searchParams.get("hostname"),
      port: parseInt(searchParams.get("port")),
    };
    socket.send(JSON.stringify(connectPackage));
  });

  socket.addEventListener("message", function (event) {
    let list = document.getElementById("console");
    let data = JSON.parse(event.data);
    if (data.error) {
      console.log(data.error);
      displayError(data.error);
    } else {
      for (const line of data.lines) {
        console.log(line);
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(line));
        list.append(li);
        lolight.el(li);
      }
    }
  });

  function updateSearchParams(host, port) {
    if (window.socket) {
      window.socket.close();
    }

    let newSearchParams = new URLSearchParams();
    newSearchParams.set("hostname", encodeURIComponent(host));
    newSearchParams.set("port", encodeURIComponent(port));

    location.search = newSearchParams.toString();
  }
}

function toggleTheme() {
  let isNowWhite = document
    .querySelector("html")
    .classList.toggle("light-mode");
  if (isNowWhite) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.removeItem("theme");
  }
}

function displayError(error) {
  let errorBox = document.querySelector("#error-box");
  let p = document.createElement("p");
  p.append(document.createTextNode(error));
  errorBox.replaceChildren(p);
  errorBox.classList.remove("invisible");
}
