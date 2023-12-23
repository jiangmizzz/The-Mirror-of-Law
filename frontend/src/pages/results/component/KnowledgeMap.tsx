import { Button, Card, Divider, Space, Tooltip, Typography } from "antd";
import type { NodeInfo } from "../../../vite-env";
import { RadialTreeGraph } from "@ant-design/graphs";
import {
  MoreOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import "./KnowledgeMap.css";

interface KnowledgeMapProps {
  center: NodeInfo; //中心词条
  desc: string; //对中心词条的描述
  changeDepth: (change: -1 | 1) => void; //更改深度
  searchByNode: (text: string) => void; //使用节点值重新请求
  changeCenter: (text: string) => void; //转换中心节点
}
const { Title } = Typography;
export default function KnowledgeMap(props: KnowledgeMapProps) {
  const data = props.center;
  const themeColor = "#73B3D1";
  const config = {
    //设置合适的宽高
    // width: 500,
    // height: 500,
    data,
    nodeCfg: {
      size: 35,
      type: "circle",
      label: {
        style: {
          fill: "#fff",
        },
      },
      style: {
        fill: themeColor,
        stroke: "#0E1155",
        lineWidth: 2,
        strokeOpacity: 0.45,
        // shadowColor: themeColor,
        // shadowBlur: 25,
      },
      labelCfg: {
        style: {
          fontSize: "12px",
        },
      },
      nodeStateStyles: {
        hover: {
          stroke: themeColor,
          shadowColor: themeColor,
          shadowBlur: 25,
          lineWidth: 2,
          strokeOpacity: 1,
        },
      },
    },
    edgeCfg: {
      style: {
        stroke: themeColor,
        shadowColor: themeColor,
        shadowBlur: 20,
      },
      endArrow: {
        type: "triangle",
        fill: themeColor,
        d: 20,
        size: 8,
      },
      edgeStateStyles: {
        hover: {
          stroke: themeColor,
          lineWidth: 2,
        },
      },
    },
    toolbarCfg: {
      show: true,
      customContent: ({
        toggleFullscreen,
        fullscreen,
      }: {
        toggleFullscreen: () => void;
        fullscreen: boolean;
      }) => {
        return (
          <div className="KnowledgeMap-toolbar" onClick={toggleFullscreen}>
            {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </div>
        );
      },
    },
    behaviors: ["drag-canvas", "zoom-canvas", "drag-node"],
  };
  let startTime = 0;
  let endTime = 0;

  return (
    <Card /*loading={true}*/>
      <Space className="KnowledgeMap-head">
        <Title level={3}>{props.center.value}</Title>
        <Tooltip
          title="知识图谱：自动寻找与搜索内容最贴近的词条节点"
          overlayStyle={{ fontSize: "12px" }}
        >
          <MoreOutlined
            style={{
              fontSize: "1.4em",
              color: "rgba(0, 0, 0, 0.7)",
            }}
          />
        </Tooltip>
      </Space>
      <Divider style={{ margin: "1em 0" }}></Divider>
      <div>{props.desc}</div>
      <div
        style={{
          //   background: "#0E1155",
          marginTop: "1em",
          height: "300px",
        }}
      >
        {
          //@ts-ignore
          <RadialTreeGraph
            style={{ backgroundColor: "#f5f5f5", borderRadius: "5px" }}
            {...config}
            onReady={(graph) => {
              graph.on("node:mousedown", () => {
                startTime = new Date().getTime();
              });
              graph.on("node:mouseup", (evt) => {
                endTime = new Date().getTime();
                const timeOffset: number = endTime - startTime;
                if (timeOffset > 1000) {
                  //长按，触发节点搜索
                  console.log("offset:", timeOffset);
                  props.searchByNode(
                    evt.item?.getModel().label?.toString() ?? ""
                  );
                } else {
                  console.log("offset:", timeOffset);
                  //短按，更换中心节点
                  props.changeCenter(
                    evt.item?.getModel().label?.toString() ?? ""
                  );
                }
                startTime = new Date().getTime();
              });
            }}
          />
        }
      </div>
      <Space direction="vertical" className="KnowledgeMap-tips">
        <div className="KnowledgeMap-tips-title">Tips: </div>
        <Space className="KnowledgeMap-head">
          <div className="KnowledgeMap-tips-text">
            <div>长按节点 - 直接搜索节点文字</div>
            <div>短按节点 - 切换图谱中心节点</div>
          </div>
          <Space>
            <Tooltip title="向外辐射" overlayStyle={{ fontSize: "12px" }}>
              <Button
                size="small"
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={() => props.changeDepth(1)}
              />
            </Tooltip>
            <Tooltip title="向内收缩" overlayStyle={{ fontSize: "12px" }}>
              <Button
                size="small"
                type="primary"
                shape="circle"
                icon={<MinusOutlined />}
                onClick={() => props.changeDepth(-1)}
              />
            </Tooltip>
          </Space>
        </Space>
      </Space>
    </Card>
  );
}
