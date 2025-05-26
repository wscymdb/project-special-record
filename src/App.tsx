import { Route, Routes } from "react-router";
import VirtualListFixedHeight from "./view/VirtualList-FixedHeight";
import "./App.less";
import Home from "./view/Home";
import VirtualListDynamicHeight from "./view/VirtualList-DynamicHeight";
import VirtualListBuffer from "./view/VirtualList-Buffer";
import Page1 from "./view/StorageForm/Page1";
import Page2 from "./view/StorageForm/Page2";
// import Page3 from "./view/StorageForm/Page3";
// import Page4 from "./view/StorageForm/Page4";
import WebWorkerExercise from "./view/HackTimer/WebWorkerExercise";
import HackTimer from "./view/HackTimer";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/virtual-list-fixed-height"
          element={<VirtualListFixedHeight />}
        />
        <Route
          path="/virtual-list-dynamic-height"
          element={<VirtualListDynamicHeight estimatedItemSize={100} />}
        />
        <Route
          path="/virtual-list-dynamic-height-buffer"
          element={<VirtualListBuffer />}
        />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        {/* <Route path="/page3" element={<Page3 />} />
        <Route path="/page4" element={<Page4 />} /> */}
        <Route path="/webworker" element={<WebWorkerExercise />} />
        <Route path="/hack-timer" element={<HackTimer />} />
      </Routes>
    </div>
  );
}

export default App;
