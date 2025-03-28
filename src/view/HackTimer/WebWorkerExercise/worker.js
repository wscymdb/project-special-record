let timer;

self.addEventListener("message", (e) => {
  let sum = 0;
  let msg;

  if (e.data === "start") {
    timer = setInterval(() => {
      sum += 1;
      msg = {
        sum,
        text: "编辑中",
      };
      self.postMessage(msg);
    }, 1000);
  } else {
    clearInterval(timer);
  }
});
