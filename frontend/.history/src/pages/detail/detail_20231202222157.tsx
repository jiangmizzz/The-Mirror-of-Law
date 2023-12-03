// DetailPage.tsx
import React, { useState } from 'react';
import {
  Card,
  Typography,
  Divider,
  FloatButton,
  Tooltip,
  Drawer,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  CustomerServiceOutlined,
  SmileOutlined,
  BulbTwoTone,
} from '@ant-design/icons';
import ThumbButtons from './componet/ThumbButtons.tsx';
import RelatedLinks from './componet/RelatedLinks.tsx';
import AI_ICON from '../../assets/icon/AIicon';
import './detail.css';

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
  const [ifAi, setAi] = useState<boolean>(false);

  return (
    <div>
      <Card
        style={{
          marginTop: '20px',
          width: '800px',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
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
              来源：{source}
            </Typography.Text>
          </div>
          <Space>
            <BulbTwoTone twoToneColor="#7464FA" />
            <a href={data.link} target="_blank" rel="noopener noreferrer">
              查看原文
            </a>
          </Space>
        </div>

        <Divider />

        <Typography.Paragraph>{content}</Typography.Paragraph>

        <Divider />

        <Typography.Title level={5}>您对这篇文档的评价</Typography.Title>
        <ThumbButtons
          initialLikes={feedbackCnt.likes}
          initialDislikes={feedbackCnt.dislikes}
        />

        <Divider />
        {<RelatedLinks />}
      </Card>

      {/* 悬浮按钮 */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ right: 24 }}
        icon={<CustomerServiceOutlined />}
        badge={{ dot: true }}
      >
        <Tooltip title="快乐特效开启" placement="right" color="#7464FA">
          <FloatButton badge={{ dot: true }} icon={<SmileOutlined />} />
        </Tooltip>
        <Tooltip title="回到首页" placement="right" color="#7464FA">
          <FloatButton icon={<ArrowLeftOutlined />} />
        </Tooltip>
        <Tooltip title="AI总结" placement="right" color="#7464FA">
          <FloatButton
            badge={{ dot: true }}
            icon={<AI_ICON />}
            onClick={() => setAi(true)}
          />
        </Tooltip>
        <Drawer
          title="AI智能文档总结"
          placement="right"
          onClose={() => setAi(false)}
          open={ifAi}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
      </FloatButton.Group>

      {/* 回到顶部按钮 */}
      <FloatButton.BackTop />
    </div>
  );
};

export default DetailPage;
