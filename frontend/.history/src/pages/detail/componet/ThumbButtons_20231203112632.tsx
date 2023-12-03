// ThumbButtons.tsx： 点赞和点踩 子功能组件
import React, { useState } from 'react';
import { Button, message, Space, Rate } from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import './ThumbButtons.css';
import axios from 'axios';
import FavoriteButton from './favorite';

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
  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  // 处理用户的点击行为
  const handleThumbClick = (isLike: boolean) => {
    // TODO: 判断用户是否登录
    const isUserLoggedIn = true;

    if (!isUserLoggedIn) {
      // 如果未登录，重定向到登录页面
      message.warning('请先登录！');
      // 跳转到登录界面（TODO: /login 界面还未设计）
      window.location.href = '/login';
      return;
    }

    // 构建请求数据
    const requestData = {
      id: id, // 从父组件传递的文档id
      feedback: isLike, // true-点赞，false-点踩
    };

    // TODO: 还要处理向后端发请求更新数据的逻辑
    if (userLiked === null) {
      // 用户还未点赞或者踩
      if (isLike) {
        setLikes(likes + 1);
        setUserLiked(true);
      } else {
        setDislikes(dislikes + 1);
        setUserLiked(false);
      }
    } else {
      // 用户已经点赞/踩
      if ((isLike && userLiked) || (!isLike && !userLiked)) {
        // 取消前一个点赞或点踩
        isLike ? setLikes(likes - 1) : setDislikes(dislikes - 1);
        setUserLiked(null); // 重新变为未点赞/踩的状态
      } else {
        // 切换点赞或点踩
        if (isLike) {
          setLikes(likes + 1);
          setDislikes(dislikes - 1);
          setUserLiked(true);
        } else {
          setLikes(likes - 1);
          setDislikes(dislikes + 1);
          setUserLiked(false);
        }
      }
    }
  };

  return (
    <div>
      <Space size={'large'}>
        <Button
          className="thumb-button"
          type={userLiked === true ? 'primary' : 'default'}
          icon={<LikeOutlined />}
          onClick={() => handleThumbClick(true)}
        >
          {likes}
        </Button>
        <Button
          className="thumb-button"
          type={userLiked === false ? 'primary' : 'default'}
          icon={<DislikeOutlined />}
          onClick={() => handleThumbClick(false)}
        >
          {dislikes}
        </Button>

        {<FavoriteButton />}

        <Space>
          <Rate
            defaultValue={4}
            character={({ index }: { index: number }) => index + 1}
          />
          <br />
          <Rate
            defaultValue={4}
            character={({ index }: { index: number }) => customIcons[index + 1]}
          />
        </Space>
      </Space>
    </div>
  );
};

export default ThumbButtons;
