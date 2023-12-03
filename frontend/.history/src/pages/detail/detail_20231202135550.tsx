import React from 'react';
import { Card, Button } from 'antd';

const DetailPage: React.FC = () => {
  return (
    <div>
      <h1>搜索引擎详情页</h1>
      <Card title="搜索引擎信息">{/* 添加搜索引擎详情信息 */}</Card>
      <Button type="primary">返回搜索页</Button>
    </div>
  );
};

export default DetailPage;
