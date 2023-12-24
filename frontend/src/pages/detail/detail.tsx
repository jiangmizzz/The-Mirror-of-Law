// DetailPage.tsx
import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Typography,
  Divider,
  FloatButton,
  Tooltip,
  Drawer,
  Space,
  Skeleton,
  message,
  Input,
  Avatar,
  Empty,
  Button,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  SmileOutlined,
  BulbTwoTone,
} from "@ant-design/icons";
import ThumbButtons from "./component/ThumbButtons.tsx";
import RelatedLinks from "./component/RelatedLinks.tsx";
import AI_ICON from "../../assets/icon/AIicon";
import "./detail.css";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { getFetcher } from "../../utils.ts";
const { TextArea } = Input;
import AI_avatar from "../../assets/iconSideChatDoc.png";
import WordCloudComponent from "./component/WordCloud.tsx";
import FireworksComponent from "./component/FireworksComponent.tsx"; // 引入新的子组件
import { useUserStore } from "../../stores/userStore.tsx";

// TODO， 没有相应接口，mock数据
async function getAiResponse(userMessage: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`AI 模型的响应：你说的是 "${userMessage}" 吗？`);
    }, 1000);
  });
}

const DetailPage: React.FC = () => {
  const { id, type } = useParams(); // 根据url来获取params
  //   const [data, setData] = useState<any>({}); // 初始化为空对象
  const [inputValue, setInputValue] = useState(""); // AI chatbot textarea中的文本（用户输入的信息）
  const [messageApi, contextHolder] = message.useMessage(); // 全局提示
  const [ifOpen, setOpen] = useState<boolean>(false); // 是否启用AI辅助功能（打开抽屉）
  const [isOpenFloatTooltip, setIsOpenFloatTooltip] = useState(true);
  const [isFireworksOn, setIsFireworksOn] = useState(true); // 是否开启快乐特效（鼠标点击动效）
  const userStore = useUserStore(); //全局用户状态管理器

  const [detailData, setDetailData] = useState<DetailData | null>(null); // 在 DetailPage 组件中定义一个状态变量用于存储详情数据
  const navigate = useNavigate();

  // AI部分
  interface AiSummaryResponse {
    res: string;
  }

  // 聊天消息的状态
  const [chatMessages, setChatMessages] = useState([
    {
      content:
        "你好！我是AI智能助手，我将帮你对这篇文章进行一个总结，并呈现一份内容概要。",
      type: "ai",
    },
  ]);

  // 在 useEffect 中监听 inputValue 变化，并在变化后执行 setInputValue("")
  useEffect(() => {
    setInputValue("");
  }, [chatMessages]);

  // 是否发起AI请求的开关
  const [fetchAiData, setFetchAiData] = useState(false);
  // 是否已经获取AI返回的数据，防止多次请求
  const [isGetResponse, setIsGetResponse] = useState(false);

  // 使用 useSWR 发送请求
  const { data: AIdata, error: AIerror } = useSWR<AiSummaryResponse>(() => {
    if (!fetchAiData || isGetResponse) {
      // 设置条件防止发送多次请求
      return false;
    }
    return "/ai/summarize?id=" + id + "&type=" + type;
  }, getFetcher);
  console.log("AI summary result:" + AIdata);

  // 当获取 AI 摘要成功时，更新 chatMessages
  useEffect(() => {
    if (fetchAiData && AIdata) {
      setIsGetResponse(true);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { content: AIdata.toString(), type: "ai" },
      ]);
    }
  }, [fetchAiData, AIdata]);

  // 当获取 AI 摘要失败时，显示错误信息
  useEffect(() => {
    if (AIerror) {
      console.error("Failed to fetch AI summary:", AIerror);
      message.error("获取 AI 摘要失败！");
    }
  }, [AIerror]);

  // 处理用户输入并获取 AI 响应
  const handleUserInput = async () => {
    console.log("Input Value:", inputValue);
    const userMessage = inputValue.trim();
    // 空消息不做任何处理
    if (userMessage === "") return;

    // 将用户消息添加到聊天中
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { content: userMessage, type: "user" },
    ]);

    // TODO: 将用户消息发送到 AI 模型并获取 AI 响应
    try {
      // 发送用户消息到 AI 模型并获取 AI 响应
      const aiResponse = await getAiResponse(userMessage);

      // 将 AI 响应添加到聊天中
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { content: aiResponse, type: "ai" },
      ]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      message.error("获取 AI 响应失败！");
    }

    // 清除输入
    setInputValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // 打开抽屉（AI辅助功能）
  const showDrawer = () => {
    setFetchAiData(true);
    setOpen(true);
  };
  // 关闭抽屉
  const onClose = () => {
    setFetchAiData(false);
    setOpen(false);
  };

  // 改变鼠标点击动效的开启状态
  const changeCSS = () => {
    setIsFireworksOn((prevValue) => !prevValue);
    console.log("点击特效开启状态：" + isFireworksOn);
  };

  // 回到上一个页面
  const goBackToLastPage = () => {
    navigate(-1); // 返回上一页
  };
  // 处理回到顶部按钮的点击事件
  const handleBackTopClick = () => {
    // 隐藏 Tooltip
    setIsOpenFloatTooltip(false);
    // 延时重启提示，使得下次还能看到提示
    // setTimeout(() => {
    //   setIsOpenFloatTooltip(true);
    // }, 700);
  };

  // 获取详情数据部分
  // 向后端发起请求获取详情信息的返回体
  interface DetailData {
    title: string;
    source: string;
    publishTime: string; // ISO 8601 时间格式
    feedbackCnt: {
      likes: number;
      dislikes: number;
    };
    content: string;
    resultType: number;
    link: string;
  }

  const [isGetDetail, setIsGetDetail] = useState(false);
  // 调用SWR hook来获取详情页的数据 （判断请求条件）
  const { data, error, isLoading } = useSWR<DetailData>(() => {
    if (isGetDetail) {
      return false;
    }
    return "/search/detail?id=" + id;
  }, getFetcher);

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

  // 如果有错误，显示错误信息
  useEffect(() => {
    if (error) {
      console.error("Failed to fetch data:", error);
      message.error("加载失败！");
    }
  }, [error]);

  // 当获取 详情信息 成功时，更新 isGetDetail 和 detailData
  useEffect(() => {
    if (data) {
      setIsGetDetail(true);
      setDetailData(data); // 更新详情数据
    }
  }, [data]);

  // 在加载状态下显示 loading 界面
  if (isLoading) {
    // 调用showLoading()函数来显示加载状态
    showLoading();
    return (
      <div className="skeleton-box">
        <Card
          style={{
            marginTop: "20px",
            width: "800px",
            height: "600px",
            // justifyContent: 'center',
            // alignItems: 'center',
            // display: 'flex',
          }}
        >
          <Skeleton
            loading={isLoading}
            active
            avatar
            paragraph={{ rows: 14 }}
          />
        </Card>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="skeleton-box">
        <Card
          style={{
            marginTop: "20px",
            width: "800px",
            height: "600px",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Empty description="暂无数据" />;
        </Card>
      </div>
    );
  }

  const { title, source, publishTime, feedbackCnt, content, link } = detailData;
  // 显示调试信息
  console.log(detailData);

  // 正常显示页面
  return (
    <div className="detail-box">
      {/* 鼠标点击动效组件 */}
      <FireworksComponent isOpen={isFireworksOn} />
      <div className="left-box">
        <div className="left-sticky-box">
          <Card>
            {
              <div className="world-cloud">
                <WordCloudComponent id={id} type={type} />
              </div>
            }
          </Card>
          <Card style={{ marginTop: "20px" }}>
            {
              <div className="feedback-box">
                <Typography.Title level={5}>
                  您对这篇文档的评价
                </Typography.Title>
                <ThumbButtons
                  id={id ?? -1} // 如果 id 是 undefined，则使用空字符串(TODO)
                  initialLikes={feedbackCnt.likes}
                  initialDislikes={feedbackCnt.dislikes}
                />
              </div>
            }
          </Card>
        </div>
      </div>
      <div className="right-box">
        {contextHolder}
        {
          <Card
            style={{
              marginTop: "20px",
              width: "800px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <div className="content-box">
              <Typography.Title level={2} style={{ textAlign: "center" }}>
                {title}
              </Typography.Title>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <Typography.Text style={{ fontSize: 15 }}>
                    {publishTime}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ marginLeft: "8px", fontSize: 15 }}
                  >
                    来源：{source}
                  </Typography.Text>
                </div>
                <Space>
                  <BulbTwoTone twoToneColor="#7464FA" />
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    查看原文
                  </a>
                </Space>
              </div>

              <Divider />

              <Typography.Paragraph style={{ fontSize: 16 }}>
                {<div className="content">{content}</div>}
              </Typography.Paragraph>

              <Divider />

              <Typography.Title level={5}>您对这篇文档的评价</Typography.Title>
              <ThumbButtons
                id={id || ""} // 如果 id 是 undefined，则使用空字符串(TODO)
                initialLikes={feedbackCnt.likes}
                initialDislikes={feedbackCnt.dislikes}
              />

              <Divider />
              {<RelatedLinks />}

              {/* 悬浮按钮 */}
              <FloatButton.Group
                trigger="click"
                type="primary"
                style={{ right: 24 }}
                icon={<CustomerServiceOutlined />}
                badge={{ dot: true }}
              >
                <Tooltip
                  title="开启/关闭快乐特效"
                  placement="right"
                  color="#7464FA"
                >
                  <FloatButton
                    badge={{ dot: true }}
                    icon={<SmileOutlined />}
                    onClick={changeCSS}
                  />
                </Tooltip>
                <Tooltip title="回到上一页" placement="right" color="#7464FA">
                  <FloatButton
                    icon={<ArrowLeftOutlined />}
                    onClick={goBackToLastPage}
                  />
                </Tooltip>
                <Tooltip title="AI总结" placement="right" color="#7464FA">
                  <FloatButton
                    badge={{ dot: true }}
                    icon={<AI_ICON />}
                    onClick={showDrawer}
                  />
                </Tooltip>
              </FloatButton.Group>
              <Tooltip
                title="回到顶部"
                placement="right"
                color="#7464FA"
                open={isOpenFloatTooltip}
                defaultOpen={isOpenFloatTooltip}
                onOpenChange={setIsOpenFloatTooltip} // 更新 Tooltip 显隐状态
              >
                {/* 回到顶部按钮 */}
                <FloatButton.BackTop
                  visibilityHeight={200} // 滚动高度达到此参数值才出现 BackTop
                  duration={200} // 回到顶部所需时间（ms）
                  badge={{ dot: true }}
                  onClick={handleBackTopClick} // 绑定点击事件处理函数
                  style={{ right: 100, backgroundColor: "#7464FA" }}
                />
              </Tooltip>
              <Drawer
                title="AI智能文档总结"
                placement="right"
                onClose={onClose}
                open={ifOpen}
                maskClosable={false} // 不能通过点击其他区域来关闭抽屉
                extra={
                  <Space>
                    <Button
                      className="drawer-cancle-button"
                      type="primary"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </Space>
                }
                className="custom-drawer"
                styles={{
                  header: {
                    background: "linear-gradient(blue,#ffccff)",
                    color: "white",
                  },
                  body: {
                    background: "#fffafe",
                  },
                  footer: {
                    background: "linear-gradient(#ffccff,#ae8dff)",
                  },
                }}
                footer={
                  <div className="drawer-search">
                    <TextArea
                      placeholder="请输入文本"
                      autoSize={{ minRows: 2, maxRows: 6 }} // 设置自动调整大小的行数范围
                      value={inputValue}
                      onChange={handleInputChange}
                      onPressEnter={handleUserInput} // 处理用户按下 Enter 键发送消息
                    />
                    <Button type="primary" onClick={handleUserInput}>
                      Send
                    </Button>
                  </div>
                }
              >
                <div className="chat-container">
                  {chatMessages.map((message, index) => (
                    <div key={index} className="chat-message-box">
                      {message.type === "ai" && ( // AI message, 头像放在文本框前
                        <div className="avatar">
                          <img
                            src={AI_avatar}
                            alt="AI Avatar"
                            style={{
                              width: "160%",
                              height: "160%",
                              borderRadius: "50%",
                            }}
                          />
                        </div>
                      )}
                      <div
                        className={`message-content ${
                          message.type === "ai" ? "ai" : "user"
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.type === "user" && ( // user message, 头像放在文本框后
                        <div className="avatar">
                          <Avatar
                            style={{ backgroundColor: "#2e95d3" }}
                            icon={<UserOutlined />}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Drawer>
            </div>
          </Card>
        }
      </div>
    </div>
  );
};

export default DetailPage;
