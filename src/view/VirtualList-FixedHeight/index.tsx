import { memo, useEffect, useState } from 'react';
import './index.less';

const originList = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  value: i + 1,
}));

export default memo((props: any) => {
  const { itemSize = 100, list = originList } = props;

  const [screenHeight, setScreenHeight] = useState(0); // 可见区域高度
  const [visibleData, setvisibleData] = useState([]);
  const [startOffest, setStartOffest] = useState(0);

  const listHeight = list.length * itemSize; // 列表高度 其实是和屏幕高度一样的
  const visibleCount = Math.ceil(screenHeight / itemSize); // 可以看到的数量

  useEffect(() => {
    const clientHeight =
      document.querySelector('.infinite-list-container')?.clientHeight || 0;
    setScreenHeight(clientHeight);

    const newData = list.slice(0, Math.ceil(clientHeight / itemSize));
    setvisibleData(newData);
    console.log(clientHeight, newData);
  }, []);

  const onScroll = (e: any) => {
    const scrollTop = e.target.scrollTop;
    // 滚动多少处以itemSize就可以知道滚动了多少个 向下取整的原因是比如滚动了2个半 如果向上取整的话变成3个那么截取的时候就会导致半个没法显示了
    const start = Math.floor(scrollTop / itemSize);
    const end = start + visibleCount;

    // 计算偏移量 所谓的偏移量就是 比如滚动了2个那么每个30px  所以就需要当前的list移动60px
    const offset = start * itemSize;
    setStartOffest(offset);
    setvisibleData(list.slice(start, end));
  };

  return (
    // 可视区域容器
    <div className="infinite-list-container" onScroll={onScroll}>
      {/* 这是容器里面的占位，高度是总列表高度，用于形成滚动条  */}
      <div
        className="infinite-list-phantom"
        style={{ height: listHeight }}
      ></div>
      {/* 列表项渲染区域 */}
      <div
        className="infinite-list"
        style={{ transform: `translateY(${startOffest}px)` }}
      >
        {visibleData.map((item: any) => (
          <div
            className="infinite-list-item"
            style={{ height: itemSize }}
            key={item.id}
          >
            <span>123</span>
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
});
