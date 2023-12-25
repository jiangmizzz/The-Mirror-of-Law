// Recommend.tsx: 相关链接组件
import React, { useState, useEffect } from "react";
import {
  Card,
  Space,
  Button,
  Divider,
  Tooltip,
  message,
  Spin,
  Empty,
  Skeleton,
} from "antd";
import { StarTwoTone, InfoCircleOutlined } from "@ant-design/icons";
import "./RelatedLinks.css";
import { useNavigate } from "react-router-dom";
import { getFetcher } from "../../../utils";
import useSWR from "swr";

interface RelatedProps {
  id: string; // 从父组件传递的文档id
  type: number; //文档类型，可以再进行规定
}

interface RelatedData {
  title: string;
  id: string;
}

interface RelatedDataList {
  map(
    arg0: (
      item: RelatedData,
      index: number
    ) => import("react/jsx-runtime").JSX.Element
  ): React.ReactNode;
  data: RelatedData[];
}

const RelatedLinks: React.FC<RelatedProps> = ({ id, type }) => {
  const [messageApi, contextHolder] = message.useMessage(); // 全局提示
  const [isGetResponse, setIsGetResponse] = useState(false); // 是否已经获取词云图的数据，防止多次请求
  const navigate = useNavigate(); //导航到其他页面
  const [relatedList, setRelatedList] = useState<RelatedDataList | null>(null);

  const { data, error, isLoading } = useSWR<RelatedDataList>(() => {
    if (isGetResponse) {
      // 设置条件过滤多余请求
      return false;
    }
    return "/search/related?id=" + id + "&type=" + type;
  }, getFetcher);
  console.log("RelatedDataList Data:", data);

  useEffect(() => {
    // 当数据变化时，更新 relatedList
    if (data) {
      setRelatedList(data);
      setIsGetResponse(true);
    }
  }, [data]);

  // 当获取获取相关内容数据失败时，显示错误信息
  useEffect(() => {
    if (error) {
      console.error("Failed to fetch word-cloud data:", error);
      message.error("获取相关推荐列表失败！");
    }
  }, [error]);

  // 显示正在加载的message
  const showLoading = () => {
    messageApi.open({
      type: "loading",
      content: "数据加载中...",
      duration: 0,
    });
    // Dismiss manually and asynchronously
    setTimeout(messageApi.destroy, 2500);
  };

  //   useEffect(() => {
  //     setRelatedList([
  //       { title: "中共中央印发《全国干部教育培训规划(2023—2027年)》", id: 1 },
  //       {
  //         title:
  //           "中共中央办公厅、国务院办公厅关于调整应急管理部职责机构编制的通知",
  //         id: 2,
  //       },
  //       {
  //         title: "中共中央办公厅、国务院办公厅印发《深化集体林权制度改革方案》",
  //         id: 3,
  //       },
  //       {
  //         title:
  //           "中共中央办公厅、国务院办公厅关于调整中国人民银行职责机构编制的通知",
  //         id: 4,
  //       },
  //     ]);
  //   }, []);

  // 在加载状态下显示 loading 界面
  if (isLoading) {
    // 调用showLoading()函数来显示加载状态
    showLoading();
    return (
      <div className="empty-box">
        {contextHolder}
        <Card
          className="related-links-box"
          style={{ justifyContent: "center" }}
        >
          <div className="related-links-line"></div>
          <div className="related-links-head">
            <Space>
              <StarTwoTone twoToneColor="#7464FA" />
              <div style={{ fontSize: "15px" }}>相关推荐</div>
            </Space>
            <Tooltip
              title="根据当前文档的内容推荐相关性高的文档"
              placement="right"
              overlayStyle={{ fontSize: "12px" }}
            >
              <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
            </Tooltip>
          </div>
          <Divider></Divider>
          <div className="empty-box">
            <Spin>
              <Skeleton active />
            </Spin>
          </div>
        </Card>
      </div>
    );
  }

  if (!relatedList) {
    return (
      <div className="empty-box">
        <Card
          className="related-links-box"
          style={{ justifyContent: "center" }}
        >
          <div className="related-links-line"></div>
          <div className="related-links-head">
            <Space>
              <StarTwoTone twoToneColor="#7464FA" />
              <div style={{ fontSize: "15px" }}>相关推荐</div>
            </Space>
            <Tooltip
              title="根据当前文档的内容推荐相关性高的文档"
              placement="right"
              overlayStyle={{ fontSize: "12px" }}
            >
              <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
            </Tooltip>
          </div>
          <Divider></Divider>
          <div className="empty-box">
            <Empty description="暂无数据" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="related-links-box" style={{ justifyContent: "center" }}>
      {contextHolder}
      <div className="related-links-line"></div>
      <div className="related-links-head">
        <Space>
          <StarTwoTone twoToneColor="#7464FA" />
          <div style={{ fontSize: "15px" }}>相关推荐</div>
        </Space>
        <Tooltip
          title="根据当前文档的内容推荐相关性高的文档"
          placement="right"
          overlayStyle={{ fontSize: "12px" }}
        >
          <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
        </Tooltip>
      </div>
      <Divider></Divider>
      <div className="related-links-list">
        {relatedList.map((item, index) => {
          return (
            <Button
              key={item.id}
              type="link"
              onClick={() => {
                navigate(`/detail/${item.id}/type`, {
                  state: { previousLocation: location.pathname },
                });
              }}
            >
              {index + 1 + ". " + item.title}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default RelatedLinks;
