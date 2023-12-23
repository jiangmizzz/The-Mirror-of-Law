import React, { useRef, useEffect } from "react";
import mojs from "@mojs/core";

interface FireworksProps {
  isOpen: boolean;
}

const FireworksComponent: React.FC<FireworksProps> = ({ isOpen }) => {
  const burstRef = useRef<any>(null);
  //   const heartBounce = useRef<any>(1);

  useEffect(() => {
    const handleMouseClick = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      // 爆炸特效
      const burst = new mojs.Burst({
        left: clientX,
        top: clientY,
        // radius: { 0: 100 },
        // count: 5,
        // children: {
        //   shape: "circle",
        //   radius: { 6: 0 },
        //   stroke: "white",
        //   strokeWidth: 2,
        //   angle: { 360: 0 },
        //   duration: 1500,
        //   delay: "stagger(0, 150)",
        //   easing: "quad.out",
        // },
        // 爆炸范围
        radius: { 0: 100 },
        // 动画延时函数
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        // 动画延时时间
        duration: 1500,
        // 动画等待时间
        delay: 300,
        // 扩散的粒子配置
        children: {
          duration: 750,
          // 随机数范围爆炸
          radius: { 0: "rand(5,25)" },
          shape: ["circle", "rect", "polygon"],
          // 粒子可选色
          fill: [
            "#1abc9c",
            "#2ecc71",
            "#00cec9",
            "#3498db",
            "#9b59b6",
            "#fdcb6e",
            "#f1c40f",
            "#e67e22",
            "#e74c3c",
            "#e84393",
          ],
          degreeShift: "rand(-90, 90)",
          delay: "stagger(0, 40)",
        },
        // 透明度
        opacity: 0.6,
        // 生成粒子数量
        count: 15,
        // onStart() {
        //     hearted.value = true;
        // },
      });

      // 红晕特效
      const aperture = new mojs.Transit({
        left: clientX,
        top: clientY,
        duration: 750,
        type: "circle",
        radius: { 0: 20 },
        fill: "transparent",
        stroke: "#E05B5B",
        strokeWidth: { 20: 0 },
        opacity: 0.6,
        isRunless: true,
        easing: mojs.easing.bezier(0, 1, 0.5, 1),
      });

      //   const bounce = new mojs.Tween({
      // 	left: clientX,
      //     top: clientY,
      //     duration: 1200,
      //     onUpdate: (progress: number) => {
      //       if (progress > 0.3) {
      //         // elastic 弹性的
      //         heartBounce.value = mojs.easing.elastic.out(1.43 * progress - 0.43);
      //       } else {
      //         heartBounce.value = 0;
      //       }
      //     },
      //   });

      //   const bounce = new mojs.Tween({
      //     duration: 1200,
      //     onUpdate: (progress: number) => {
      //       if (progress > 0.3) {
      //         // elastic 弹性的
      //         heartBounce.value = mojs.easing.elastic.out(1.43 * progress - 0.43);
      //       } else {
      //         heartBounce.value = 0;
      //       }
      //     },
      //   });

      // 播放烟花动效
      burst.play();
      // 播放红晕特效
      aperture.play();
      //   bounce.play();
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
  }, [isOpen]);

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
