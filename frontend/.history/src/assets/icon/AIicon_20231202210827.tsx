// 在iconfont上自定义的icon图标
import { createFromIconfontCN } from '@ant-design/icons';

const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_4356122_wqxbrp3znl.js',
});

const AI_ICON = () => {
  return (
    <div>
      {/* 使用自定义图标 */}
      <MyIcon type="icon-AI" />
    </div>
  );
};

export default AI_ICON;
