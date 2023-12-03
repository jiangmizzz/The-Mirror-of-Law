// DetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Divider,
  FloatButton,
  Tooltip,
  Drawer,
  Space,
  Skeleton,
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

const DetailPage: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>({}); // 初始化为空对象
  const [loading, setLoading] = useState(true);

  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: 'loading',
      content: 'Action in progress..',
      duration: 0,
    });
    // Dismiss manually and asynchronously
    setTimeout(messageApi.destroy, 2500);
  };

  useEffect(() => {
    // 在组件加载时发起请求
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/search/detail?id=${id}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // 当 id 变化时重新发起请求

  const { title, source, publishTime, feedbackCnt, content, link } = data;
  const [ifAi, setAi] = useState<boolean>(false);

  // 在加载状态下显示 loading 界面
  if (!loading) {
    return (
      <div>
        {contextHolder}
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
  } else {
    return (
      <div>
        <Skeleton loading={loading} active avatar></Skeleton>
      </div>
    );
  }
};

export default DetailPage;
