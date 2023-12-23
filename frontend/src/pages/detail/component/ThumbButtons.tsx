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
import useSWRMutation from "swr";
import { postFetcher } from "../../../utils.ts";
import type { Response } from "../../../vite-env";
import { useUserStore } from "../../../stores/userStore.tsx";

// Props 接口
interface ThumbButtonsProps {
  id: number; // 从父组件传递的文档id
  initialLikes: number;
  initialDislikes: number;
}

const ThumbButtons: React.FC<ThumbButtonsProps> = ({
  id,
  initialLikes,
  initialDislikes,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  // 记录用户是否点了赞和踩 true：点了赞  false：点了踩  null：无
  const [userLiked, setUserLiked] = useState<boolean | null>(null);
  const userStore = useUserStore(); //全局用户状态管理器
  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  const { trigger, isMutating } = useSWRMutation<
    Response<null>, // 返回数据类型
    Error, // 错误类型
    string, //key类型
    //any
    { id: string; feedback: boolean } // 键的类型
  >("/search/feedback", postFetcher);

  // 处理用户的点击行为
  const handleThumbClick = async (isLike: boolean) => {
    // 判断用户是否登录
    if (!userStore.ifLogin) {
      // 如果未登录，弹出消息提示
      message.warning("请先登录！");
      return;
    }

    // 构建请求数据
    const requestData = {
      id: id, // 从父组件传递的文档id
      feedback: isLike, // true-点赞，false-点踩
    };
    // 发送 POST 请求
    try {
      // 发送 POST 请求
      // await trigger(requestData);

      // const response = await axios.post('/api/search/feedback', requestData);
      // 处理成功响应
      //console.log(response.data); // 根据需要处理后端返回的数据

      if (userLiked === null) {
        // 用户还未点赞或者踩
        if (isLike) {
          setLikes(likes + 1);
          setUserLiked(true);
          message.success("点赞成功！");
        } else {
          setDislikes(dislikes + 1);
          setUserLiked(false);
          message.success("点踩成功！");
        }
      } else {
        // 用户已经点赞/踩
        if ((isLike && userLiked) || (!isLike && !userLiked)) {
          // 取消前一个点赞或点踩
          isLike ? setLikes(likes - 1) : setDislikes(dislikes - 1);
          setUserLiked(null); // 重新变为未点赞/踩的状态
          message.success("取消成功！");
        } else {
          // 切换点赞或点踩
          if (isLike) {
            setLikes(likes + 1);
            setDislikes(dislikes - 1);
            setUserLiked(true);
            message.success("点赞成功！");
          } else {
            setLikes(likes - 1);
            setDislikes(dislikes + 1);
            setUserLiked(false);
            message.success("点踩成功！");
          }
        }
      }
    } catch (error: any) {
      // 处理请求错误
      console.error("Error sending feedback:", error);

      if (error.response && error.response.status === 401) {
        // 未登录的错误处理
        message.error("未登录，请先登录！");
        window.location.href = "/login";
      } else {
        message.error("操作失败，请稍后重试！");
      }
    }
  };

  return (
    <div>
      <Space size={"large"}>
        <Button
          className="thumb-button"
          type={userLiked === true ? "primary" : "default"}
          icon={<LikeOutlined />}
          onClick={() => handleThumbClick(true)}
        >
          {likes}
        </Button>
        <Button
          className="thumb-button"
          type={userLiked === false ? "primary" : "default"}
          icon={<DislikeOutlined />}
          onClick={() => handleThumbClick(false)}
        >
          {dislikes}
        </Button>

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
