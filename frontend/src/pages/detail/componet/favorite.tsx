// 收藏子组件
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import './favorite.css';

const FavoriteButton = () => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    const action = isFavorite ? '取消收藏' : '收藏';
    message.success(`${action}成功`);
  };

  return (
    <div className="favorite">
      <Button
        type="link"
        value="large"
        icon={<StarOutlined className={isFavorite ? 'star active' : 'star'} />}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? '取消收藏' : '收藏'}
      </Button>
    </div>
  );
};

export default FavoriteButton;
