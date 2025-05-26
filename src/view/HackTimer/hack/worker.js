// self可以省略 但是不建议 这样可以提高代码的清晰度
var fakeIdToId = {};
self.onmessage = function (event) {
  var data = event.data,
    name = data.name,
    fakeId = data.fakeId,
    time;
  if (data.hasOwnProperty("time")) {
    time = data.time;
  }
  switch (name) {
    case "setInterval":
      fakeIdToId[fakeId] = setInterval(function () {
        slef.postMessage({ fakeId: fakeId });
      }, time);
      break;
    case "clearInterval":
      if (fakeIdToId.hasOwnProperty(fakeId)) {
        clearInterval(fakeIdToId[fakeId]);
        delete fakeIdToId[fakeId];
      }
      break;
    case "setTimeout":
      fakeIdToId[fakeId] = setTimeout(function () {
        self.postMessage({ fakeId: fakeId });
        if (fakeIdToId.hasOwnProperty(fakeId)) {
          delete fakeIdToId[fakeId];
        }
      }, time);
      break;
    case "clearTimeout":
      if (fakeIdToId.hasOwnProperty(fakeId)) {
        clearTimeout(fakeIdToId[fakeId]);
        delete fakeIdToId[fakeId];
      }
      break;
  }
};
