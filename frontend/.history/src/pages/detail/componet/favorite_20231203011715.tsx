import React, { useState } from 'react';
import { Button, message } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import './favorite.css'; // 请替换为你自己的样式文件

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
        icon={<StarOutlined className={isFavorite ? 'star active' : 'star'} />}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? '取消收藏' : '收藏'}
      </Button>
    </div>
  );
};

export default FavoriteButton;
