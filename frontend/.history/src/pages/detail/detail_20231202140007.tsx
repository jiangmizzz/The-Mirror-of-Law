import React from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import {
  ArrowLeftOutlined,
  LikeOutlined,
  DislikeOutlined,
} from '@ant-design/icons';

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
  const { title, source, publishTime, feedbackCnt, content, resultType, link } =
    data;

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => {
          // 返回搜索页的逻辑
          // 使用React Router的useNavigate或Link组件
        }}
      >
        返回搜索页
      </Button>

      <Card
        title={title}
        extra={<Typography.Text type="secondary">{source}</Typography.Text>}
      >
        <Space>
          <Typography.Text type="secondary">
            发布时间: {publishTime}
          </Typography.Text>
          <Divider type="vertical" />
          <Space>
            <Button icon={<LikeOutlined />} type="text">
              {feedbackCnt.likes} 赞
            </Button>
            <Button icon={<DislikeOutlined />} type="text">
              {feedbackCnt.dislikes} 踩
            </Button>
          </Space>
        </Space>
        <Divider />
        <Typography.Paragraph>{content}</Typography.Paragraph>
        <Divider />
        <Typography.Text type="secondary">
          文档类型: {resultType === 0 ? '法律法规' : '裁判文书'}
        </Typography.Text>
        <Divider />
        <Button
          type="primary"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          查看原文
        </Button>
      </Card>
    </div>
  );
};

export default DetailPage;
