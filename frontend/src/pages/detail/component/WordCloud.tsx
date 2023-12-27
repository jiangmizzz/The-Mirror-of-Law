import React, { useState, useEffect } from "react";
import { WordCloud } from "@ant-design/plots";
import maskImg from "../../../assets/iconSideChatDoc.png";
import useSWR from "swr";
import { getFetcher } from "../../../utils";
import { Card, Empty, Skeleton, Spin, message } from "antd";

interface WordCloudData {
  name: string;
  value: number;
}

interface WorldCloudDataList {
  data: WordCloudData[];
}

// Props 接口
interface CloudProps {
  id: string; // 从父组件传递的文档id
  type: number; //文档类型，可以再进行规定
}

const WordCloudComponent: React.FC<CloudProps> = ({ id, type }) => {
  const [messageApi, contextHolder] = message.useMessage(); // 全局提示
  const [isGetResponse, setIsGetResponse] = useState(false); // 是否已经获取词云图的数据，防止多次请求
  //   const [wordCloudData, setWordCloudData] = useState(data);

  //   useEffect(() => {
  //     setWordCloudData(data);
  //   }, []);

  const { data, error, isLoading } = useSWR<WorldCloudDataList>(() => {
    if (isGetResponse) {
      // 设置条件过滤多余请求
      return false;
    }
    return "/word-cloud/get?id=" + id + "&type=" + type;
  }, getFetcher);
  console.log("Word Cloud Data:", data);

  const [worldCloudDataList, setWorldCloudDataList] =
    useState<WorldCloudDataList | null>(null);

  useEffect(() => {
    // 当数据变化时，更新 wordCloudData
    if (data) {
      setWorldCloudDataList(data);
      setIsGetResponse(true);
    }
  }, [data]);

  // 当获取获取词云图数据失败时，显示错误信息
  useEffect(() => {
    if (error) {
      console.error("Failed to fetch word-cloud data:", error);
      message.error("获取词云图数据失败！");
    }
  }, [error]);

  // 显示正在加载的message
  const showLoading = () => {
    messageApi.open({
      type: "loading",
      content: "词云图加载中...",
      duration: 0,
    });
    // Dismiss manually and asynchronously
    setTimeout(messageApi.destroy, 2500);
  };

  // 在加载状态下显示 loading 界面
  if (isLoading) {
    // 调用showLoading()函数来显示加载状态
    showLoading();
    return (
      <div className="skeleton-box">
        {contextHolder}
        {/* <Card
          style={{
            marginTop: "20px",
            width: "100%",
            height: "100%",
            // justifyContent: 'center',
            // alignItems: 'center',
            // display: 'flex',
          }}
        >
          <Skeleton loading={isLoading} active avatar paragraph={{ rows: 8 }} />
        </Card> */}
        <Card>
          <Spin spinning={true}>
            <div className="img-loading">
              <Skeleton.Image
                active
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "300px",
                  height: "300px",
                }}
              />
            </div>
          </Spin>
        </Card>
      </div>
    );
  }

  if (!worldCloudDataList) {
    return (
      <div className="empty-box">
        <Card
          style={{
            marginTop: "20px",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Empty description="暂无数据" />
        </Card>
      </div>
    );
  }

  //   const config = getWordCloudConfig(data);

  //   function getDataList(
  //     data: WorldCloudDataList
  //   ): { word: string; weight: number; id: number }[] {
  //     const list = data.data.map((d, index) => ({
  //       word: d.name,
  //       weight: d.value,
  //       id: index,
  //     }));
  //     return list;
  //   }

  const config = {
    data: worldCloudDataList,
    // data: getDataList(worldCloudDataList),
    wordField: "name",
    weightField: "value",
    colorField: "name",
    wordStyle: {
      fontFamily: "Verdana",
      fontSize: [13, 40] as [number, number], // 将 number[] 类型转换为 [number, number]
      rotation: [-Math.PI / 2, Math.PI / 2] as [number, number], // 将 number[] 类型转换为 [number, number]
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
    gridSize: 14,
    imageMask: maskImg, // TODO 图片遮罩功能貌似没有生效？
    random: () => 0.5,
    forceFit: true,
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
