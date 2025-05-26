(function (workerScript) {
  console.log(workerScript, "workerScript");

  /**
 * 这一部分的功能等价于使用一个单独的外部脚本文件作为 Worker 脚本。但由于在某些场景（如动态生成脚本或跨域限制）中，直接加载外部文件可能存在限制，所以我们将脚本内容转化为一个 Blob 对象。
  然后通过 URL.createObjectURL 方法生成一个临时 URL，并使用 Worker 构造函数创建一个 Worker 对象来加载该脚本。

为什么使用 Blob？
  在动态生成代码的场景中，无法提前创建独立的文件（worker.js），因此可以将脚本作为字符串嵌入，用 Blob 封装成一个二进制数据。
  Blob 生成的动态 URL 比传统文件更加灵活，不需要实际的文件路径。
 */

  if (!/MSIE 10/i.test(navigator.userAgent)) {
    try {
      var blob = new Blob([
        "\
var fakeIdToId = {};\
self.onmessage = function (event) {\
	var data = event.data,\
		name = data.name,\
		fakeId = data.fakeId,\
		time;\
	if(data.hasOwnProperty('time')) {\
		time = data.time;\
	}\
	switch (name) {\
		case 'setInterval':\
			fakeIdToId[fakeId] = setInterval(function () {\
				self.postMessage({fakeId: fakeId});\
			}, time);\
			break;\
		case 'clearInterval':\
			if (fakeIdToId.hasOwnProperty (fakeId)) {\
				clearInterval(fakeIdToId[fakeId]);\
				delete fakeIdToId[fakeId];\
			}\
			break;\
		case 'setTimeout':\
			fakeIdToId[fakeId] = setTimeout(function () {\
				self.postMessage({fakeId: fakeId});\
				if (fakeIdToId.hasOwnProperty (fakeId)) {\
					delete fakeIdToId[fakeId];\
				}\
			}, time);\
			break;\
		case 'clearTimeout':\
			if (fakeIdToId.hasOwnProperty (fakeId)) {\
				clearTimeout(fakeIdToId[fakeId]);\
				delete fakeIdToId[fakeId];\
			}\
			break;\
	}\
}\
",
      ]);
      // Obtain a blob URL reference to our worker 'file'.
      workerScript = window.URL.createObjectURL(blob);
    } catch (error) {
      /* Blob is not supported, use external script instead */
    }
  }

  // 这一部分是 HackTimer.js 的核心代码，
  var worker,
    fakeIdToCallback = {},
    lastFakeId = 0,
    // 32位有符号整数的最大值 设置一个最大值 防止内存泄漏 当然这并不是js中的最大值，虽然 JavaScript 可以处理更大的整数，但在这种情况下，使用 31 位的范围已经足够满足需求，
    maxFakeId = 0x7fffffff, // 2 ^ 31 - 1, 31 bit, positive values of signed 32 bit integer
    logPrefix = "HackTimer.js by puta: ";

  if (typeof Worker !== "undefined") {
    // 生成一个不重复的id
    function getFakeId() {
      do {
        if (lastFakeId == maxFakeId) {
          lastFakeId = 0;
        } else {
          lastFakeId++;
        }
      } while (fakeIdToCallback.hasOwnProperty(lastFakeId));
      return lastFakeId;
    }

    try {
      worker = new Worker(workerScript);

      // setInterval
      window.setInterval = function (callback, time /* , parameters */) {
        var fakeId = getFakeId();
        fakeIdToCallback[fakeId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2),
        };
        worker.postMessage({
          name: "setInterval",
          fakeId: fakeId,
          time: time,
        });
        return fakeId;
      };
      window.clearInterval = function (fakeId) {
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          delete fakeIdToCallback[fakeId];
          worker.postMessage({
            name: "clearInterval",
            fakeId: fakeId,
          });
        }
      };

      // setTimeout
      window.setTimeout = function (callback, time /* , parameters */) {
        var fakeId = getFakeId();
        fakeIdToCallback[fakeId] = {
          callback: callback,
          parameters: Array.prototype.slice.call(arguments, 2),
          isTimeout: true,
        };
        worker.postMessage({
          name: "setTimeout",
          fakeId: fakeId,
          time: time,
        });
        return fakeId;
      };
      window.clearTimeout = function (fakeId) {
        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          delete fakeIdToCallback[fakeId];
          worker.postMessage({
            name: "clearTimeout",
            fakeId: fakeId,
          });
        }
      };

      worker.onmessage = function (event) {
        var data = event.data,
          fakeId = data.fakeId,
          request,
          parameters,
          callback;

        if (fakeIdToCallback.hasOwnProperty(fakeId)) {
          request = fakeIdToCallback[fakeId];
          callback = request.callback;
          parameters = request.parameters;
          if (request.hasOwnProperty("isTimeout") && request.isTimeout) {
            delete fakeIdToCallback[fakeId];
          }
        }

        if (typeof callback === "string") {
          try {
            callback = new Function(callback);
          } catch (error) {
            console.log(
              logPrefix + "Error parsing callback code string: ",
              error
            );
          }
        }

        if (typeof callback === "function") {
          callback.apply(window, parameters);
        }
      };
      worker.onerror = function (event) {
        console.log(event);
      };
    } catch (error) {
      console.log(logPrefix + "Initialisation failed");
      console.error(error);
    }
  } else {
    console.log(
      logPrefix + "Initialisation failed - HTML5 Web Worker is not supported"
    );
  }
})("HackTimerWorker.js");
