import React, { useState, useEffect } from "react";
import { WordCloud } from "@ant-design/plots";
import maskImg from "../../../assets/iconSideChatDoc.png";
import useSWR from "swr";
import { getFetcher } from "../../../utils";
import { Card, Empty, Skeleton, message } from "antd";

// 示例数据
const data = [
  { value: 10, name: "Java" },

  { value: 8, name: "Docker" },
  { value: 8, name: "Mysql" },
  { value: 8, name: "SpringBoot" },
  { value: 8, name: "SpringCloud" },
  { value: 8, name: "Go" },
  { value: 8, name: "Css" },
  { value: 8, name: "JavaScript" },

  { value: 6, name: "Grammar" },
  { value: 6, name: "Graphics" },
  { value: 6, name: "Graph" },
  { value: 6, name: "Hierarchy" },
  { value: 6, name: "Labeling" },
  { value: 6, name: "Layout" },
  { value: 6, name: "Quantitative" },
  { value: 6, name: "Relation" },
  { value: 6, name: "Statistics" },
  { value: 6, name: "可视化" },
  { value: 6, name: "数据" },
  { value: 6, name: "数据可视化" },

  { value: 4, name: "流量统计" },
  { value: 4, name: "联系人管理" },
  { value: 4, name: "Canvas" },
  { value: 4, name: "Chart" },
  { value: 4, name: "DAG" },
  { value: 4, name: "DG" },
  { value: 4, name: "Facet" },
  { value: 4, name: "Geo" },
  { value: 4, name: "Line" },
  { value: 4, name: "MindMap" },
  { value: 4, name: "Pie" },
  { value: 4, name: "Pizza Chart" },
  { value: 4, name: "Punch Card" },
  { value: 4, name: "SVG" },
  { value: 4, name: "Sunburst" },
  { value: 4, name: "Tree" },
  { value: 4, name: "UML" },

  { value: 3, name: "Chart" },
  { value: 3, name: "View" },
  { value: 3, name: "Geom" },
  { value: 3, name: "Connector" },
  { value: 3, name: "Transform" },
  { value: 3, name: "Util" },
  { value: 3, name: "DomUtil" },
  { value: 3, name: "MatrixUtil" },
  { value: 3, name: "PathUtil" },
  { value: 3, name: "G" },
  { value: 3, name: "2D" },
  { value: 3, name: "3D" },
  { value: 3, name: "Line" },
  { value: 3, name: "Area" },
  { value: 3, name: "Interval" },
  { value: 3, name: "Schema" },
  { value: 3, name: "Edge" },
  { value: 3, name: "Polygon" },
  { value: 3, name: "Heatmap" },
  { value: 3, name: "Render" },
  { value: 3, name: "Tooltip" },
  { value: 3, name: "Axis" },
  { value: 3, name: "Guide" },
  { value: 3, name: "Coord" },
  { value: 3, name: "Legend" },
  { value: 3, name: "Path" },
  { value: 3, name: "Helix" },
  { value: 3, name: "Theta" },
  { value: 3, name: "Rect" },
  { value: 3, name: "Polar" },
  { value: 3, name: "Dsv" },
  { value: 3, name: "Csv" },
  { value: 3, name: "Tsv" },
  { value: 3, name: "GeoJSON" },
  { value: 3, name: "TopoJSON" },
  { value: 3, name: "Filter" },
  { value: 3, name: "Map" },
  { value: 3, name: "Pick" },
  { value: 3, name: "Rename" },
  { value: 3, name: "Filter" },
  { value: 3, name: "Map" },
  { value: 3, name: "Pick" },
  { value: 3, name: "Rename" },
  { value: 3, name: "Reverse" },
  { value: 3, name: "sort" },
  { value: 3, name: "Subset" },
  { value: 3, name: "Partition" },
  { value: 3, name: "Imputation" },
  { value: 3, name: "Fold" },
  { value: 3, name: "Aggregate" },
  { value: 3, name: "Proportion" },
  { value: 3, name: "Histogram" },
  { value: 3, name: "Quantile" },
  { value: 3, name: "Treemap" },
  { value: 3, name: "Hexagon" },
  { value: 3, name: "Binning" },
  { value: 3, name: "kernel" },
  { value: 3, name: "Regression" },
  { value: 3, name: "Density" },
  { value: 3, name: "Sankey" },
  { value: 3, name: "Voronoi" },
  { value: 3, name: "Projection" },
  { value: 3, name: "Centroid" },
  { value: 3, name: "H5" },
  { value: 3, name: "Mobile" },

  { value: 3, name: "K线图" },
  { value: 3, name: "关系图" },
  { value: 3, name: "烛形图" },
  { value: 3, name: "股票图" },
  { value: 3, name: "直方图" },
  { value: 3, name: "金字塔图" },
  { value: 3, name: "分面" },
  { value: 3, name: "南丁格尔玫瑰图" },
  { value: 3, name: "饼图" },
  { value: 3, name: "线图" },
  { value: 3, name: "点图" },
  { value: 3, name: "散点图" },
  { value: 3, name: "子弹图" },
  { value: 3, name: "柱状图" },
  { value: 3, name: "仪表盘" },
  { value: 3, name: "气泡图" },
  { value: 3, name: "漏斗图" },
  { value: 3, name: "热力图" },
  { value: 3, name: "玉玦图" },
  { value: 3, name: "直方图" },
  { value: 3, name: "矩形树图" },
  { value: 3, name: "箱形图" },
  { value: 3, name: "色块图" },
  { value: 3, name: "螺旋图" },
  { value: 3, name: "词云" },
  { value: 3, name: "词云图" },
  { value: 3, name: "雷达图" },
  { value: 3, name: "面积图" },
  { value: 3, name: "马赛克图" },
  { value: 3, name: "盒须图" },
  { value: 3, name: "坐标轴" },

  { value: 3, name: "" },

  { value: 3, name: "Jacques Bertin" },
  { value: 3, name: "Leland Wilkinson" },
  { value: 3, name: "William Playfair" },

  { value: 3, name: "关联" },
  { value: 3, name: "分布" },
  { value: 3, name: "区间" },
  { value: 3, name: "占比" },
  { value: 3, name: "地图" },
  { value: 3, name: "时间" },
  { value: 3, name: "比较" },
  { value: 3, name: "流程" },
  { value: 3, name: "趋势" },

  { value: 2, name: "亦叶" },
  { value: 2, name: "再飞" },
  { value: 2, name: "完白" },
  { value: 2, name: "巴思" },
  { value: 2, name: "王琣浩" },
  { value: 2, name: "御术" },
  { value: 2, name: "有田" },
  { value: 2, name: "沉鱼" },
  { value: 2, name: "玉伯" },
  { value: 2, name: "画康" },
  { value: 2, name: "祯逸" },
  { value: 2, name: "绝云" },
  { value: 2, name: "罗宪" },
  { value: 2, name: "陆沉" },
  { value: 2, name: "顾倾" },

  { value: 2, name: "首页" },
  { value: 2, name: "GPL" },
  { value: 2, name: "PAI" },
  { value: 2, name: "SPSS" },
  { value: 2, name: "SYSTAT" },
  { value: 2, name: "Tableau" },
  { value: 2, name: "D3" },
  { value: 2, name: "Vega" },
  { value: 2, name: "统计图表" },
];

interface WordCloudData {
  name: string;
  value: number;
}

// Props 接口
interface CloudProps {
  id: number; // 从父组件传递的文档id
  type: string; //文档类型，可以再进行规定
}

const WordCloudComponent: React.FC<CloudProps> = ({ id, type }) => {
  const [messageApi, contextHolder] = message.useMessage(); // 全局提示
  const [wordCloudData, setWordCloudData] = useState(data);

  useEffect(() => {
    setWordCloudData(data);
  }, []);

  //   const { data, error, isLoading } = useSWR<WordCloudData[]>(
  //     `/word-cloud/get?id=${id}&type=${type}`,
  //     getFetcher
  //   );
  //   console.log("Word Cloud Data:" + data);

  //   const [wordCloudData, setWordCloudData] = useState<WordCloudData[] | undefined>(undefined);

  //   useEffect(() => {
  //     // 当数据变化时，更新 wordCloudData
  //     if (data) {
  //       setWordCloudData(data);
  //     }

  //   // 当获取 AI 摘要失败时，显示错误信息
  //   if (error) {
  //     console.error("Failed to fetch AI summary:", error);
  //     message.error("获取 AI 摘要失败！");
  //   }

  //   // 显示正在加载的message
  //   const showLoading = () => {
  //     messageApi.open({
  //       type: "loading",
  //       content: "数据加载中...",
  //       duration: 0,
  //     });
  //     // Dismiss manually and asynchronously
  //     setTimeout(messageApi.destroy, 2500);
  //   };

  //   // 在加载状态下显示 loading 界面
  //   if (isLoading) {
  //     // 调用showLoading()函数来显示加载状态
  //     showLoading();
  //     return (
  //       <div className="skeleton-box">
  //         <Card
  //           style={{
  //             marginTop: "20px",
  //             width: "100%",
  //             height: "100%",
  //             // justifyContent: 'center',
  //             // alignItems: 'center',
  //             // display: 'flex',
  //           }}
  //         >
  //           <Skeleton loading={isLoading} active avatar paragraph={{ rows: 8 }} />
  //         </Card>
  //       </div>
  //     );
  //   }

  //   if (!data) {
  //     return (
  //       <div className="skeleton-box">
  //         <Card
  //           style={{
  //             marginTop: "20px",
  //             width: "100%",
  //             height: "100%",
  //             justifyContent: "center",
  //             alignItems: "center",
  //             display: "flex",
  //           }}
  //         >
  //           <Empty description="暂无数据" />;
  //         </Card>
  //       </div>
  //     );
  //   }

  //   const config = getWordCloudConfig(data);

  function getDataList(
    data: WordCloudData[]
  ): { word: string; weight: number; id: number }[] {
    const list = data.map((d, index) => ({
      word: d.name,
      weight: d.value,
      id: index,
    }));
    return list;
  }

  const config = {
    data: wordCloudData,
    // data: getDataList(data),
    wordField: "name",
    weightField: "value",
    colorField: "name",
    wordStyle: {
      fontFamily: "Verdana",
      fontSize: [8, 32],
      rotation: [-Math.PI / 2, Math.PI / 2],
      rotateRatio: 0.5,
    },
    shape: "cardioid",
    shuffle: false,
    backgroundColor: "#fff",
    tooltip: { visible: true },
    selected: -1,
    active: {
      shadowColor: "#333333",
      shadowBlur: 10,
    },
    gridSize: 8,
    imageMask: maskImg,
    random: () => 0.5,
  };

  return (
    <>
      <div>
        {contextHolder}
        <WordCloud {...config} />
      </div>
    </>
  );
};

export default WordCloudComponent;
