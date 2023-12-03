import React from 'react';
import { Rate } from 'antd';
import { StarProps, customIcons } from './myRate';

export const MyRate: React.FC = () => (
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
