// ThumbButtons.tsx
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';

interface ThumbButtonsProps {
  initialLikes: number;
  initialDislikes: number;
}

const ThumbButtons: React.FC<ThumbButtonsProps> = ({
  initialLikes,
  initialDislikes,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userLiked, setUserLiked] = useState<boolean | null>(null); // true for liked, false for disliked, null for no action

  const handleThumbClick = (isLike: boolean) => {
    // Simulate the login check
    const isUserLoggedIn = true; // 替换为实际的登录检查

    if (!isUserLoggedIn) {
      // 如果未登录，重定向到登录页面
      message.warning('请先登录！');
      // 替换 '/login' 为实际的登录页面路径
      window.location.href = '/login';
      return;
    }

    if (userLiked === null) {
      if (isLike) {
        setLikes(likes + 1);
      } else {
        setDislikes(dislikes + 1);
      }
    } else if ((userLiked && !isLike) || (!userLiked && isLike)) {
      // 取消前一个点赞或点踩
      isLike ? setLikes(likes - 1) : setDislikes(dislikes - 1);
    } else {
      // 切换点赞或点踩
      isLike ? setLikes(likes + 1) : setDislikes(dislikes + 1);
    }

    setUserLiked(isLike);
  };

  return (
    <div>
      <Button
        type={userLiked === true ? 'primary' : 'default'}
        icon={<LikeOutlined />}
        onClick={() => handleThumbClick(true)}
      >
        {likes}
      </Button>
      <Button
        type={userLiked === false ? 'primary' : 'default'}
        icon={<DislikeOutlined />}
        onClick={() => handleThumbClick(false)}
      >
        {dislikes}
      </Button>
    </div>
  );
};

export default ThumbButtons;
