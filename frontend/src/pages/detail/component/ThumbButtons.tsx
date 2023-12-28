// ThumbButtons.tsx： 点赞和点踩 子功能组件
import React, { useState } from "react";
import { Button, message, Space, Rate } from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import "./ThumbButtons.css";
import FavoriteButton from "./favorite";
import { postFetcher } from "../../../utils.ts";
import type { Response } from "../../../vite-env";
import { useUserStore } from "../../../stores/userStore.tsx";
import useSWRMutation from "swr/mutation";

// Props 接口
interface ThumbButtonsProps {
  id: string; // 从父组件传递的文档id
  initialLikes: number;
  initialDislikes: number;
  resultType: number;
  onFeedbackSuccess: () => void; // 函数类型定义
}

const ThumbButtons: React.FC<ThumbButtonsProps> = ({
  id,
  initialLikes,
  initialDislikes,
  resultType,
  onFeedbackSuccess, // 获取从父组件传递的函数
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const userStore = useUserStore(); //全局用户状态管理器
  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  const { trigger } = useSWRMutation<
    Response<number>, // 返回数据类型
    Error, // 错误类型
    string, //key类型
    {
      id: string;
      type: number;
      feedback: boolean;
    } // 键的类型
  >("/search/feedback", postFetcher);

  // 处理用户的点击行为
  const handleThumbClick = async (isLike: boolean) => {
    let isfeedbacking = false;
    // 判断用户是否登录
    if (!userStore.ifLogin) {
      // 如果未登录，弹出消息提示
      message.warning("请先登录再评价~");
      return;
    } else if (isfeedbacking) {
      message.info("您的操作过于频繁, 请稍后再试~");
      return;
    }

    // 构建请求数据
    const requestData = {
      id: id, // 从父组件传递的文档id
      feedback: isLike, // true-点赞，false-点踩
      type: resultType,
    };

    // 发送 POST 请求
    try {
      // 发送 POST 请求
      const feedbackRes = await trigger(requestData);

      //   const response = await axios.post("/api/search/feedback", requestData);
      // 处理成功响应
      console.log(feedbackRes); // 根据需要处理后端返回的数据
      if (feedbackRes.success) {
        message.open({
          key: "loading",
          type: "loading",
          content: "正在递交用户反馈...",
          duration: 0,
        });
        isfeedbacking = true;
        //数据库更新似乎不及时
        setTimeout(() => {
          message.destroy("loading");
          switch (feedbackRes.data) {
            case 5: // DISLIKE_TO_LIKE
              setLikes(likes + 1);
              setDislikes(dislikes - 1);
              message.success("点赞成功, 感谢喜欢此内容!");
              break;
            case 0: // LIKE
              setLikes(likes + 1);
              message.success("点赞成功, 感谢喜欢此内容!");
              break;
            case 4: //LIKE_TO_DISLIKE
              setDislikes(dislikes + 1);
              setLikes(likes - 1);
              message.success("点踩成功, 感谢您的反馈!");
              break;
            case 1: // DISLIKE
              setDislikes(dislikes + 1);
              message.success("点踩成功, 感谢您的反馈!");
              break;
            case 2: // CANCEL_LIKE
              setLikes(likes - 1);
              message.success("取消点赞成功!");
              break;
            case 3: // CANCEL_DISLIKE
              setDislikes(dislikes - 1);
              message.success("取消点踩成功!");
              break;
            default:
              message.error("后端返回结果有误!");
          }
          userStore.changeLikes(feedbackRes.data!, id);
          isfeedbacking = false;
        }, 1000);
      } else {
        message.error(
          "发生未知错误: " +
            feedbackRes.errorCode +
            ": " +
            feedbackRes.errorMessage
        );
      }
    } catch (error) {
      // 处理请求错误
      console.error("Error sending feedback:", error);
    }
    onFeedbackSuccess();
  };

  return (
    <div>
      <Space size={"large"}>
        <Button
          className="thumb-button"
          type={userStore.likes.indexOf(id) != -1 ? "primary" : "default"}
          icon={<LikeOutlined />}
          onClick={() => handleThumbClick(true)}
        >
          {likes}
        </Button>
        <Button
          className="thumb-button"
          type={userStore.dislikes.indexOf(id) != -1 ? "primary" : "default"}
          icon={<DislikeOutlined />}
          onClick={() => handleThumbClick(false)}
        >
          {dislikes}
        </Button>
        {/* <Button
		className="thumb-button"
          type={userStore.likes.indexOf(id) == -1 ? "dashed" : "primary"}
          icon={<LikeOutlined />}
          onClick={() => props.handlefeedback(id, resultType, true)}
        >
          {props.feedbackCnt.likes}
        </Button>
        <Button
		className="thumb-button"
          type={
            userStore.dislikes.indexOf(id) == -1 ? "dashed" : "primary"
          }
          icon={<DislikeOutlined />}
          onClick={() =>
            props.handlefeedback(id, resultType, false)
          }
        >
          {props.feedbackCnt.dislikes}
        </Button> */}

        {<FavoriteButton />}

        <Space>
          <Rate
            defaultValue={4}
            //@ts-ignore
            character={({ index }: { index: number }) => index + 1}
          />
          <br />
          <Rate
            defaultValue={4}
            //@ts-ignore
            character={({ index }: { index: number }) => customIcons[index + 1]}
          />
        </Space>
      </Space>
    </div>
  );
};

export default ThumbButtons;
