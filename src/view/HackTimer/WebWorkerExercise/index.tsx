import { memo, useEffect, useState } from "react";

/**
 * 注意：如果要在这个项目中进行测试 setInterval的降频实验，需要吧HackTimer/index.tsx中引入的hack注释掉
 * 因为hack会劫持setTimeout/setInterval
 */

export default memo(() => {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    // Web Worker 是通过 URL 加载的，而不是通过模块系统（如 ES6 模块或 CommonJS）加载的。这意味着它们需要通过一个相对或绝对的 URL 来访问。

    // 单页面应用中可以使用以下方式引入
    // 1. import.meta 是一个内置在 ES 模块内部的对象，import.meta.url 表示一个模块在浏览器和 Node.js 的绝对路径。该特性属于 es2020 的一部分，webpack5 才支持

    // 2. 直接放到public目录下，然后使用相对路径引入(不推荐)

    const myWork = new Worker(new URL("./worker.js", import.meta.url));
    myWork.postMessage("start");

    myWork.addEventListener("message", (e) => {
      const data = e.data;
      console.log(data);
      setMsg(data.text);

      if (data.sum >= 10) {
        myWork.postMessage("end");
        setMsg("长时间未操作，自动保存");
      }
    });
  };

  return (
    <div className="">
      <h1>这是一个编辑页</h1>
      <div>{msg}</div>
    </div>
  );
});
