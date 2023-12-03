// Recommend.tsx: 相关链接组件
import React, { useState, useEffect } from 'react';
import { Card, Space, Button, Divider, Tooltip } from 'antd';
import { StarTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import './RelatedLinks.css';

interface RelatedProps {}

const RelatedLinks: React.FC<RelatedProps> = () => {
  const [relatedList, setRelatedList] = useState<
    { title: string; id: number }[]
  >([]);

  useEffect(() => {
    setRelatedList([
      { title: '中共中央印发《全国干部教育培训规划(2023—2027年)》', id: 1 },
      {
        title:
          '中共中央办公厅、国务院办公厅关于调整应急管理部职责机构编制的通知',
        id: 2,
      },
      {
        title: '中共中央办公厅、国务院办公厅印发《深化集体林权制度改革方案》',
        id: 3,
      },
      {
        title:
          '中共中央办公厅、国务院办公厅关于调整中国人民银行职责机构编制的通知',
        id: 4,
      },
    ]);
  }, []);

  return (
    <Card className="related-links-box" style={{ width: '600px' }}>
      <div className="related-links-line"></div>
      <div className="related-links-head">
        <Space>
          <StarTwoTone twoToneColor="#7464FA" />
          <div style={{ fontSize: '15px' }}>个性化推荐</div>
        </Space>
        <Tooltip
          title="未登录状态下为随机推荐，登录后可实现基于用户兴趣的内容推荐"
          placement="right"
          overlayStyle={{ fontSize: '12px' }}
        >
          <InfoCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
        </Tooltip>
      </div>
      <Divider></Divider>
      <div className="related-links-list">
        {relatedList.map((item, index) => {
          return (
            <Button key={item.id} type="link">
              {index + 1 + '. ' + item.title}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default RelatedLinks;
