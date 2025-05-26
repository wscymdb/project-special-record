// 在一个 Web Worker 脚本中，self 通常指向全局作用域对象，类似于在浏览器主线程中的 window 对象。在 Worker 中，它代表 Worker 本身。因此，self 是 Worker 脚本的全局上下文，可以用来访问和处理 Worker 的各种功能。
// 换句话说，在 Web Worker 中：
// self 是 Worker 全局作用域对象。
// self 和 this 在 Web Worker 中是等价的。在 Worker 脚本中，self 或 this 表示的是当前 Worker 的上下文。
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
