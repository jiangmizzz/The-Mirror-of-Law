// 收藏子组件
import { useState } from "react";
import { Button, message } from "antd";
import { StarOutlined } from "@ant-design/icons";
import { useUserStore } from "../../../stores/userStore.tsx";
import "./favorite.css";

const FavoriteButton = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const userStore = useUserStore(); //全局用户状态管理器

  const handleFavoriteClick = () => {
    // 判断用户是否登录
    if (!userStore.ifLogin) {
      // 如果未登录，弹出消息提示
      message.warning("请先登录！");
      return;
    }
    setIsFavorite(!isFavorite);
    const action = isFavorite ? "取消收藏" : "收藏";
    message.success(`${action}成功`);
  };

  return (
    <div className="favorite">
      <Button
        type="link"
        value="large"
        icon={<StarOutlined className={isFavorite ? "star active" : "star"} />}
        onClick={handleFavoriteClick}
      >
        {isFavorite ? "取消收藏" : "收藏"}
      </Button>
    </div>
  );
};

export default FavoriteButton;
