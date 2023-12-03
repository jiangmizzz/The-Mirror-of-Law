import React from 'react';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { Rate } from 'antd';

interface StarProps {
  index: number;
}

const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
};

const MyRate: React.FC = () => (
  <>
    <Rate
      defaultValue={2}
      character={(props: StarProps) => <span>{props.index + 1}</span>}
    />
    <br />
    <Rate
      defaultValue={3}
      character={(props: StarProps) => customIcons[props.index + 1]}
    />
  </>
);

export default MyRate;
