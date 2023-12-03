// DetailPage.tsx
import React, { useState } from 'react';
import { Card, Typography, Divider, FloatButton, Tooltip, Drawer } from 'antd';
import {
  CommentOutlined,
  CustomerServiceOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import ThumbButtons from './ThumbButtons';
import RelatedLinks from './RelatedLinks';
import ReactDOM from 'react-dom/client';

const AIicon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js', // 在 iconfont.cn 上生成
});

ReactDOM.createRoot(mountNode).render(<AIicon type="AI-icon" />);

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
              来源：{source}
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
        <FloatButton badge={{ dot: true }} />
        <Tooltip title="回到首页" placement="right" color="#7464FA">
          <FloatButton icon={<CommentOutlined />} />
        </Tooltip>
        <Tooltip title="AI总结" color="#7464FA">
          <FloatButton
            icon={<AIicon type={'ai-icon'} />}
            className="search-ai-img"
            onClick={() => setAi(true)}
          />
        </Tooltip>
        <Drawer
          title="AI智能关键词提取"
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
