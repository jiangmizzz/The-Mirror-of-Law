// DetailPage.tsx
import React from 'react';
import { Card, Typography, Divider } from 'antd';
import ThumbButtons from './ThumbButtons'; // 根据实际路径调整

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

        <a href={data.link} target="_blank" rel="noopener noreferrer">
          查看原文
        </a>
      </div>

      <Divider />

      <Typography.Paragraph>{content}</Typography.Paragraph>

      <Divider />

      <Typography.Title level={4}>点赞和点踩</Typography.Title>
      <ThumbButtons
        initialLikes={feedbackCnt.likes}
        initialDislikes={feedbackCnt.dislikes}
      />
    </Card>
  );
};

export default DetailPage;
