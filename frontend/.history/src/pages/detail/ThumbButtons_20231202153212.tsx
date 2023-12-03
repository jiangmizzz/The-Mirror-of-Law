// ThumbButtons.tsx：点赞/踩 子功能组件
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
    const isUserLoggedIn = true; // Replace with your actual login check

    if (!isUserLoggedIn) {
      // Redirect to login page if not logged in
      message.warning('请先登录！');
      // Replace '/login' with your actual login page path
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
      // Cancel the previous like or dislike
      isLike ? setLikes(likes - 1) : setDislikes(dislikes - 1);
    } else {
      // Toggle like or dislike
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
