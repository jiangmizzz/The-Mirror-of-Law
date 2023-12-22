import React, { useRef, useEffect } from "react";
import mojs from "@mojs/core";

interface FireworksProps {
  isOpen: boolean;
}

const FireworksComponent: React.FC<FireworksProps> = ({ isOpen }) => {
  const burstRef = useRef<any>(null);

  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      const burst = new mojs.Burst({
        left: clientX,
        top: clientY,
        radius: { 0: 100 },
        count: 5,
        children: {
          shape: "circle",
          radius: { 6: 0 },
          stroke: "white",
          strokeWidth: 2,
          angle: { 360: 0 },
          duration: 1500,
          delay: "stagger(0, 150)",
          easing: "quad.out",
        },
      });

      // 播放烟花动效
      burst.play();
      burstRef.current = burst;
      // 在组件卸载时销毁 Mo.js 实例
      return () => {
        burst && burst.destroy();
      };
    };

    // 添加点击事件监听器
    document.addEventListener("click", handleMouseClick);

    // 在组件卸载时移除点击事件监听器
    return () => {
      document.removeEventListener("click", handleMouseClick);
    };
  }, []);

  useEffect(() => {
    // 根据 isOpen 状态播放或停止烟花动效
    if (isOpen) {
      burstRef.current && burstRef.current.replay();
    } else {
      burstRef.current && burstRef.current.stop();
    }
  }, [isOpen, burstRef.current]);

  useEffect(() => {
    // 在组件卸载时停止动效并清除 burstRef.current
    return () => {
      if (burstRef.current) {
        burstRef.current.stop();
        burstRef.current = null;
      }
    };
  }, []);

  return <div />;
};

export default FireworksComponent;
