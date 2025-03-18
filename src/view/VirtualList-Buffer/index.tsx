import { faker } from "@faker-js/faker";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import "./index.less";

// 二分查找
const binarySearch = (list: Record<string, any>, value: number) => {
  let start = 0;
  let end = list.length - 1;
  let tempIndex = null;

  while (start <= end) {
    let midIndex = Math.floor((start + end) / 2);
    let midValue = list[midIndex].bottom;
    if (midValue === value) {
      return midIndex + 1;
    } else if (midValue < value) {
      start = midIndex + 1;
    } else if (midValue > value) {
      if (tempIndex === null || tempIndex > midIndex) {
        tempIndex = midIndex;
      }
      end = midIndex - 1;
    }
  }
  return tempIndex;
};

// 这里要注意的是id要从0开始
// 因为updateItemsSize的时候会用到id作为index
// 如果id不是从0开始的话会导致index为NaN
// 如果服务端没有id的话我们可以拿到数据之后自己注入一个id
const originList: Record<string, any>[] = Array.from(
  { length: 1050 },
  (_, i) => ({
    id: i,
    value: faker.lorem.sentences(),
  })
);

interface IProps {
  bufferScale?: number; // 缓冲区域数量比例
  estimatedItemSize?: number;
  list?: Record<string, any>[];
}

// 解决白屏闪烁的问题
// 之前动态高度如果滚动过快会导致白屏闪烁
// 通过设置缓冲区的方式来解决。
export default memo((props: IProps) => {
  const {
    estimatedItemSize = 100,
    bufferScale = 0.5,
    list = originList,
  } = props;

  const [screenHeight, setScreenHeight] = useState(0); // 可见区域高度··
  const [phantomHeight, setPhantomHeight] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [offset, setOffset] = useState(0);

  const itemsRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const positions = useRef<Record<string, any>[]>([]);

  // 可以看到的数量
  const visibleCount = useMemo(
    () => Math.ceil(screenHeight / estimatedItemSize),
    [screenHeight, estimatedItemSize]
  );

  // 上方缓冲区域数量
  // 使用min的原因是因为bufferScale * visibleCount可能超出list的长度
  // 所以要取最小值
  // 还以个原因是比如现在滚动了一项 但是期望的缓冲数量是4那么也是不现实的
  // 所以也要取最小值
  const aboveCount = useMemo(
    () => Math.min(start, bufferScale * visibleCount),
    [bufferScale, start, visibleCount]
  );

  // 下方缓冲区域数量
  const belowCount = useMemo(
    () => Math.min(list.length - end, bufferScale * visibleCount),
    [list, end, bufferScale, visibleCount]
  );

  const visibleData = useMemo(() => {
    const startIdx = start - aboveCount;
    const endIdx = end + belowCount;
    return list.slice(startIdx, endIdx);
  }, [list, start, end, aboveCount, belowCount]);

  const initPositions = () => {
    positions.current = list.map((_, index) => ({
      index,
      height: estimatedItemSize,
      top: index * estimatedItemSize,
      bottom: (index + 1) * estimatedItemSize,
    }));
  };

  useEffect(() => {
    setScreenHeight(containerRef.current?.clientHeight || 0);
    initPositions();
  }, []);

  useEffect(() => {
    setStart(0);
    setEnd(visibleCount);
  }, [visibleCount]);

  useEffect(() => {
    updateItemsSize();
    let height = positions.current[positions.current.length - 1].bottom;
    setPhantomHeight(height);

    // 上一版本没有使缓冲区域的时候可以不用在这里调用
    // 引入缓冲区时，情况变得复杂，因为缓冲区会影响到 start 的定义和偏移量的计算。
    setStartOffset(start);
  }, [visibleData, start]);

  // 获取列表的开始索引
  const getStartIndex = (scrollTop = 0) => {
    // let item = positions.current.find(
    //   (item) => item && item.bottom > scrollTop,
    // );
    // return item ? item.index : 0;

    // 引入二分查找优化查找速度 由O(n) -> O(logn)
    return binarySearch(positions.current, scrollTop) || 0;
  };

  const setStartOffset = (start: number) => {
    let startOffset;

    // start可能是缓冲区的值 如果不是缓冲区域的话就会默认设置为0
    // 所以要计算出缓冲区域的第一项目和可见区域的第一项的差值
    // start - aboveCount 表示上缓冲区域的第一项
    // size就是上缓冲区域和可见区域的差值
    if (start >= 1) {
      let size =
        positions.current[start].top -
        (positions.current[start - aboveCount]
          ? positions.current[start - aboveCount].top
          : 0);
      startOffset = positions.current[start - 1].bottom - size;
    } else {
      startOffset = 0;
    }
    setOffset(startOffset);
  };

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
