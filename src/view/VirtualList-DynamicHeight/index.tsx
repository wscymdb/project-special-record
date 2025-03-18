import { faker } from "@faker-js/faker";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import "./index.less";

const originList: Record<string, any>[] = Array.from(
  { length: 50 },
  (_, i) => ({
    id: i,
    value: faker.lorem.sentences(),
  })
);

interface IProps {
  estimatedItemSize: number; // 预估每个item的高度
  list?: Record<string, any>[];
}

// 解决动态高度的问题
// 在实际渲染之前是很难拿到每一项的真实高度的 所以这里采用预估高度的方式
export default memo((props: IProps) => {
  const { estimatedItemSize = 100, list = originList } = props;

  const [screenHeight, setScreenHeight] = useState(0); // 可见区域高度··
  const [phantomHeight, setPhantomHeight] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [offset, setOffset] = useState(0);

  const itemsRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 维护一个数组 存储每一项的高度和位置信息
  // 渲染前先使用预估高度 等渲染后再更新高度
  // 这样就可以解决动态高度的问题
  const positions = useRef<Record<string, any>[]>([]);

  const visibleCount = useMemo(
    () => Math.ceil(screenHeight / estimatedItemSize),
    [screenHeight, estimatedItemSize]
  ); // 可以看到的数量

  const visibleData = useMemo(() => {
    return list.slice(start, end);
  }, [list, start, end]);

  const initPositions = () => {
    positions.current = list.map((_, index) => ({
      index,
      height: estimatedItemSize,
      top: index * estimatedItemSize,
      bottom: (index + 1) * estimatedItemSize,
    }));
  };

  // 初始化可视区域的高度 和设置预估高度信息
  useEffect(() => {
    setScreenHeight(containerRef.current?.clientHeight || 0);
    initPositions();
  }, []);

  // 当可视区域的数量变化时 重置开始和结束索引
  useEffect(() => {
    setStart(0);
    setEnd(visibleCount);
  }, [visibleCount]);

  // 当数据变化时 更新每一项的高度和位置信息
  // 然后更新占位的高度(之前的高度是预估的高度 现在需要更新为真实的高度)
  useEffect(() => {
    updateItemsSize();
    // updateItemsSize已经更新了每一项的高度和位置信息
    // 所以这里可以直接使用最后一项的bottom作为占位的高度
    let height = positions.current[positions.current.length - 1].bottom;
    setPhantomHeight(height);
  }, [visibleData]);

  // 获取列表的开始索引
  const getStartIndex = (scrollTop = 0) => {
    let item = positions.current.find(
      (item) => item && item.bottom > scrollTop
    );
    return item ? item.index : 0;
  };

  const setStartOffset = (start: number) => {
    const startOffset = start >= 1 ? positions.current[start - 1].bottom : 0;
    setOffset(startOffset);
  };

  // 使用真实dom数据更新每一项的高度和位置信息
  const updateItemsSize = () => {
    itemsRef.current.forEach((node) => {
      const newPositions = positions.current;
      let rect = node.getBoundingClientRect();
      let height = rect.height;
      let index = +node.id.slice();
      let oldHeight = newPositions[index].height;
      let dValue = oldHeight - height;
      if (dValue) {
        newPositions[index].bottom -= dValue;
        newPositions[index].height = height;

        for (let k = index + 1; k < newPositions.length; k++) {
          newPositions[k].top = newPositions[k - 1].bottom;
          newPositions[k].bottom -= dValue;
        }
      }
    });
  };

  const onScroll = (e: any) => {
    const startIndex = getStartIndex(e.target.scrollTop);
    const endIndex = startIndex + visibleCount;
    setStart(startIndex);
    setEnd(endIndex);

    setStartOffset(startIndex);
  };

  return (
    // 可视区域容器
    <div
      ref={containerRef}
      className="infinite-list-container"
      onScroll={onScroll}
    >
      {/* 这是容器里面的占位，高度是总列表高度，用于形成滚动条  */}
      <div
        className="infinite-list-phantom"
        style={{ height: phantomHeight }}
      ></div>
      {/* 列表项渲染区域 */}
      <div
        className="infinite-list"
        style={{ transform: `translateY(${offset}px)` }}
      >
        {visibleData.map((item: any, index) => (
          <div
            className="infinite-list-item"
            key={item.id}
            id={item.id}
            ref={(el) => {
              if (!el) {
                return;
              }
              itemsRef.current[index] = el;
            }}
          >
            <span style={{ color: "red" }}>{item.id + 1}</span>
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
});
