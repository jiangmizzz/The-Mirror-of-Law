// ThumbButtons.tsx： 点赞和点踩 子功能组件
import React, { useState } from 'react';
import { Button, message, Space, Rate } from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import './ThumbButtons.css';
import axios from 'axios';
import FavoriteButton from './favorite';

// Props 接口
interface ThumbButtonsProps {
  id: number; // 从父组件传递的文档id
  initialLikes: number;
  initialDislikes: number;
}

const ThumbButtons: React.FC<ThumbButtonsProps> = ({
  id,
  initialLikes,
  initialDislikes,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  // 记录用户是否点了赞和踩 true：点了赞  false：点了踩  null：无
  const [userLiked, setUserLiked] = useState<boolean | null>(null);
  const customIcons: Record<number, React.ReactNode> = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

  // 处理用户的点击行为
  const handleThumbClick = (isLike: boolean) => {
    // TODO: 判断用户是否登录
    const isUserLoggedIn = true;

    if (!isUserLoggedIn) {
      // 如果未登录，重定向到登录页面
      message.warning('请先登录！');
      // 跳转到登录界面（TODO: /login 界面还未设计）
      window.location.href = '/login';
      return;
    }

    // 构建请求数据
    const requestData = {
      id: id, // 从父组件传递的文档id
      feedback: isLike, // true-点赞，false-点踩
    };

	if (userLiked === null) {
		// 用户还未点赞或者踩
		if (isLike) {
		  setLikes(likes + 1);
		  setUserLiked(true);
		} else {
		  setDislikes(dislikes + 1);
		  setUserLiked(false);
		}
	  } else {
		// 用户已经点赞/踩
		if ((isLike && userLiked) || (!isLike && !userLiked)) {
		  // 取消前一个点赞或点踩
		  isLike ? setLikes(likes - 1) : setDislikes(dislikes - 1);
		  setUserLiked(null); // 重新变为未点赞/踩的状态
		} else {
		  // 切换点赞或点踩
		  if (isLike) {
			setLikes(likes + 1);
			setDislikes(dislikes - 1);
			setUserLiked(true);
		  } else {
			setLikes(likes - 1);
			setDislikes(dislikes + 1);
			setUserLiked(false);
		  }
		}
	  };

	try {
		// 发送 POST 请求
		const response = await axios.post('/api/search/feedback', requestData);
  
		// 处理成功响应
		console.log(response.data); // 根据需要处理后端返回的数据
  
		// TODO: 到时候要把前面的逻辑块放到这里
  
		message.success('操作成功！');
	  } catch (error: any) {
		// 处理请求错误
		console.error('Error sending feedback:', error);
  
		if (error.response && error.response.status === 401) {
		  // 未登录的错误处理
		  message.error('未登录，请先登录！');
		  window.location.href = '/login';
		} else {
		  message.error('操作失败，请稍后重试！');
		}
	  }
	};
  
    
  };

  return (
    <div>
      <Space size={'large'}>
        <Button
          className="thumb-button"
          type={userLiked === true ? 'primary' : 'default'}
          icon={<LikeOutlined />}
          onClick={() => handleThumbClick(true)}
        >
          {likes}
        </Button>
        <Button
          className="thumb-button"
          type={userLiked === false ? 'primary' : 'default'}
          icon={<DislikeOutlined />}
          onClick={() => handleThumbClick(false)}
        >
          {dislikes}
        </Button>

        {<FavoriteButton />}

        <Space>
          <Rate
            defaultValue={4}
            character={({ index }: { index: number }) => index + 1}
          />
          <br />
          <Rate
            defaultValue={4}
            character={({ index }: { index: number }) => customIcons[index + 1]}
          />
        </Space>
      </Space>
    </div>
  );
};

export default ThumbButtons;
