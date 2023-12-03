// DetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Divider,
  FloatButton,
  Tooltip,
  Drawer,
  Space,
  Skeleton,
  message,
  Input,
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  CustomerServiceOutlined,
  SmileOutlined,
  BulbTwoTone,
} from '@ant-design/icons';
import ThumbButtons from './componet/ThumbButtons.tsx';
import RelatedLinks from './componet/RelatedLinks.tsx';
import AI_ICON from '../../assets/icon/AIicon';
import './detail.css';

const { Search } = Input;
const avatar_src = '../../assets/avatar.png';

const DetailPage: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>({}); // 初始化为空对象
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const isFakeData = true;

  // TODO: 加入AI功能后，要修改drawer-search的逻辑
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onSearch = () => {
    // 处理输入框的值，可以根据需要执行其他操作
    console.log('Input Value:', inputValue);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: 'loading',
      content: 'Action in progress..',
      duration: 0,
    });
    // Dismiss manually and asynchronously
    setTimeout(messageApi.destroy, 2500);
  };

  useEffect(() => {
    // 在组件加载时发起请求
    const fetchData = async () => {
      try {
        // 检查是否处于开发环境或测试模式，如果是则返回假数据
        if (isFakeData) {
          const fakeData = {
            title: '中共中央印发《全国干部教育培训规划(2023-2027年)》',
            source: '新华社',
            publishTime: '2023-10-16 19:35',
            feedbackCnt: { likes: 30, dislikes: 2 },
            content:
              '  新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。 通知指出，制定实施《规划》是党中央着眼新时代新征程党的使命任务作出的重要部署。要把深入学习贯彻习近平新时代中国特色社会主义思想作为主题主线，坚持不懈用党的创新理论凝心铸魂、强基固本。要坚持把政治训练贯穿干部成长全周期，教育引导干部树立正确的权力观、政绩观、事业观，提高干部政治判断力、政治领悟力、政治执行力。要围绕贯彻落实党的二十大作出的重大战略部署，分层级分领域分专题开展履职能力培训，提高干部推动高质量发展本领、服务群众本领、防范化解风险本领。要构建完善的干部教育培训体系，发挥好党校（行政学院）干部教育培训主渠道主阵地作用，不断优化教育培训方式方法。要大力弘扬理论联系实际的马克思主义学风，力戒形式主义，勤俭规范办学，努力营造学习之风、朴素之风、清朗之风。..',
            link: 'https://www.gov.cn/zhengce/202310/content_6909454.htm?menuid=104',
          };
          setData(fakeData);
        } else {
          const response = await fetch(`/api/search/detail?id=${id}`);
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // 当 id 变化时重新发起请求

  const { title, source, publishTime, feedbackCnt, content, link } = data;
  const [ifAi, setAi] = useState<boolean>(false);

  // 在加载状态下显示 loading 界面
  return (
    <div>
      {contextHolder}
      {loading ? (
        <Card
          style={{
            marginTop: '20px',
            width: '800px',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Skeleton loading={loading} active avatar paragraph={{ rows: 4 }} />
        </Card>
      ) : (
        <Card
          style={{
            marginTop: '20px',
            width: '800px',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Typography.Title level={2} style={{ textAlign: 'center' }}>
            {title}
          </Typography.Title>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <Typography.Text>{publishTime}</Typography.Text>
              <Typography.Text type="secondary" style={{ marginLeft: '8px' }}>
                来源：{source}
              </Typography.Text>
            </div>
            <Space>
              <BulbTwoTone twoToneColor="#7464FA" />
              <a href={data.link} target="_blank" rel="noopener noreferrer">
                查看原文
              </a>
            </Space>
          </div>

          <Divider />

          <Typography.Paragraph>{content}</Typography.Paragraph>

          <Divider />

          <Typography.Title level={5}>您对这篇文档的评价</Typography.Title>
          <ThumbButtons
            initialLikes={feedbackCnt.likes}
            initialDislikes={feedbackCnt.dislikes}
          />

          <Divider />
          {<RelatedLinks />}
        </Card>
      )}
      {/* 悬浮按钮 */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ right: 24 }}
        icon={<CustomerServiceOutlined />}
        badge={{ dot: true }}
      >
        <Tooltip title="快乐特效开启" placement="right" color="#7464FA">
          <FloatButton badge={{ dot: true }} icon={<SmileOutlined />} />
        </Tooltip>
        <Tooltip title="回到搜索页面" placement="right" color="#7464FA">
          <FloatButton icon={<ArrowLeftOutlined />} />
        </Tooltip>
        <Tooltip title="AI总结" placement="right" color="#7464FA">
          <FloatButton
            badge={{ dot: true }}
            icon={<AI_ICON />}
            onClick={() => setAi(true)}
          />
        </Tooltip>
        <Drawer
          title="AI智能文档总结"
          placement="right"
          onClose={() => setAi(false)}
          open={ifAi}
          footer={
            <div className="drawer-search">
              <div className="drawer-search-avatar">
                {/* TODO: 可以考虑把avatar换成自己的 avatar= */}
                <Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1" />
              </div>
              <Search
                placeholder="input search text"
                value={inputValue}
                onChange={handleInputChange}
                onSearch={onSearch}
                enterButton
              />
            </div>
          }
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <div className="drawer-search">
            {/* TODO: 可以考虑把avatar换成自己的  */}
            <Avatar src="avatar_src" />
            <Search
              placeholder="input search text"
              value={inputValue}
              onChange={handleInputChange}
              style={{ width: '90%', paddingLeft: '5px' }}
              onSearch={onSearch}
              enterButton
            />
          </div>
        </Drawer>
      </FloatButton.Group>

      {/* 回到顶部按钮 */}
      <FloatButton.BackTop />
    </div>
  );
};

export default DetailPage;
