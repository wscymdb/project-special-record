import { Collapse, CollapseProps, Flex } from "antd";
import { memo } from "react";
import { Link } from "react-router";

const items: CollapseProps["items"] = [
  {
    key: "1",
    label: "虚拟列表",
    children: (
      <Flex vertical>
        <Link to="/virtual-list-fixed-height" target="_blank">
          定高虚拟列表
        </Link>
        <Link to="/virtual-list-dynamic-height" target="_blank">
          动态高度虚拟列表
        </Link>
        <Link to="/virtual-list-dynamic-height-buffer" target="_blank">
          动态高度虚拟列表-解决闪烁问题
        </Link>
      </Flex>
    ),
  },
  {
    key: "2",
    label: "跨标签表单缓存",
    children: (
      <Flex vertical>
        <Link to="/page1" target="_blank">
          页面
        </Link>
      </Flex>
    ),
  },
];

export default memo(() => {
  return (
    <div className="home">
      <Collapse items={items} defaultActiveKey={["1"]} />
    </div>
  );
});
