import { memo, useEffect, useState } from "react";
import "./hack";

/**
 * 场景：
 * 在编辑页面，用户长时间未操作，自动保存
 * 问题：
 * 当页面失活的时候定时器会处于截流模式，也就是当用户编辑的时候可能去查看别的页面了 这时候定时器就会处于截流模式
 * 对于非活动选项卡，它们会自动限制计时器每 1 秒运行一次，而不管代码中指定的原始延迟是多少。例如，如果代码最初使用setInterval()每 50 毫秒运行一次某些代码，一旦应用程序移至后台选项卡，间隔就会自动变为 1000 毫秒（1 秒），随着时间的推移，时间差距也会慢慢拉大。 然而，一旦重新激活选项卡，原始间隔或延迟就会返回到原始值。
 * https://developer.chrome.com/blog/background_tabs?hl=zh-cn
 * 运行test.html可以查看这个问题
 *
 * 解决：
 * 使用webworker来解决这个问题
 * 但是使用webworker相对于使用setTimeout/setInterval来说，心智负担比较大
 * 所以对setTimeout/setInterval进行劫持(重写) 使得使用简单
 */
export default memo(() => {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    let sum = 0;
    setInterval(() => {
      sum++;

      if (sum >= 10) {
        setMsg("长时间未操作，自动保存");
      } else {
        setMsg(`你已编辑${sum}秒`);
      }
    }, 1000);
  };

  return (
    <div className="">
      <h1>这是一个编辑页</h1>
      <div>{msg}</div>
    </div>
  );
});
