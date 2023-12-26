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
import { useLocation, useNavigate } from "react-router-dom";
import { getFetcher } from "../../../utils";
import useSWR from "swr";

interface RelatedProps {
  id: string; // 从父组件传递的文档id
  type: number; //文档类型，可以再进行规定
  onRelatedLinkClick: (itemId: string, itemType: number) => void; // 定义回调函数的类型
}

interface RelatedData {
  title: string;
  id: string;
  type: number;
}

interface RelatedDataList {
  links: {
    id: string;
    title: string;
    type: number;
  }[];
  total: number;
}

const RelatedLinks: React.FC<RelatedProps> = ({
  id,
  type,
  onRelatedLinkClick,
}) => {
  const [messageApi, contextHolder] = message.useMessage(); // 全局提示
  const [isGetResponse, setIsGetResponse] = useState(false); // 是否已经获取词云图的数据，防止多次请求
  const navigate = useNavigate(); //导航到其他页面
  const location = useLocation(); //模拟页面栈
  const [relatedList, setRelatedList] = useState<RelatedData[]>([]); // 将初始状态设置为空数组

  const {
    data: relatedData,
    error: relatedError,
    isLoading: relatedLoading,
  } = useSWR<RelatedDataList>(() => {
    if (isGetResponse) {
      // 设置条件过滤多余请求
      return false;
    }
    return "/search/related?id=" + id + "&type=" + type;
  }, getFetcher);
  console.log("RelatedDataList Data:", relatedData);

  useEffect(() => {
    if (relatedData) {
      setRelatedList(relatedData.links);
      setIsGetResponse(true);
    }
  }, [relatedData]);

  // 当获取获取相关内容数据失败时，显示错误信息
  useEffect(() => {
    if (relatedError) {
      console.error("Failed to fetch word-cloud data:", relatedError);
      message.error("获取相关推荐列表失败！");
    }
  }, [relatedError]);

  // 显示正在加载的message
  const showLoading = () => {
    messageApi.open({
      type: "loading",
      content: "相关文档列表加载中...",
      duration: 1500,
    });
    // Dismiss manually and asynchronously
    setTimeout(messageApi.destroy, 2500);
  };

  const handleRelatedLinkClick = (itemId: string, itemType: number) => {
    navigate(`/detail/${itemId}/${itemType}`, {
      state: { previousLocation: location.pathname },
    });
    // 调用父组件传递的回调函数，并传递相关信息（让父组件刷新页面）
    onRelatedLinkClick(itemId, itemType);
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
  if (relatedLoading) {
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

  if (!relatedList || relatedList.length === 0) {
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
        {Array.isArray(relatedList) &&
          relatedList.map((item, index) => (
            <Button
              key={item.id}
              type="link"
              onClick={() =>
                handleRelatedLinkClick(
                  item.id,
                  item.type != null ? item.type : 0
                )
              }
            >
              {index + 1 + ". " + item.title}
            </Button>
          ))}
      </div>
    </Card>
  );
};

export default RelatedLinks;
