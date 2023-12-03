// DetailPage.tsx
import React, { useState } from 'react';
import { Card, Button, Typography, Divider, message } from 'antd';
import ThumbButtons from './ThumbButtons'; // Adjust the path accordingly
import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';

interface DetailPageProps {
  data: {
    title: string;
    source: string;
    publishTime: string;
    feedbackCnt: {
      likes: number;
      dislikes: number;
    };
    content: string;
    resultType: number;
    link: string;
  };
}

const DetailPage: React.FC<DetailPageProps> = ({ data }) => {
  const { title, source, publishTime, feedbackCnt, content } = data;
  const [userLiked, setUserLiked] = useState<boolean | null>(null);

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
      // Initial like or dislike
      isLike ? setUserLiked(true) : setUserLiked(false);
    } else if ((userLiked && !isLike) || (!userLiked && isLike)) {
      // Cancel the previous like or dislike
      setUserLiked(null);
    } else {
      // Toggle like or dislike
      isLike ? setUserLiked(true) : setUserLiked(false);
    }
  };

  return (
    <Card>
      <Typography.Title level={2} style={{ textAlign: 'center' }}>
        {title}
      </Typography.Title>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <Typography.Text>{publishTime}</Typography.Text>
          <Typography.Text type="secondary" style={{ marginLeft: '8px' }}>
            {source}
          </Typography.Text>
        </div>

        <Button
          type="primary"
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          查看原文
        </Button>
      </div>

      <Divider />

      <Typography.Paragraph>{content}</Typography.Paragraph>

      <Divider />

      <Typography.Title level={4}>点赞和点踩</Typography.Title>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <ThumbButtons
          initialLikes={feedbackCnt.likes}
          initialDislikes={feedbackCnt.dislikes}
          userLiked={userLiked}
          onThumbClick={handleThumbClick}
        />
      </div>
    </Card>
  );
};

export default DetailPage;
