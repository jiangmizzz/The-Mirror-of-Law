// DetailPage.tsx
import React, { useState } from 'react';
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
  Empty,
  Button,
} from 'antd';
import {
  ArrowLeftOutlined,
  CustomerServiceOutlined,
  SmileOutlined,
  BulbTwoTone,
} from '@ant-design/icons';
import ThumbButtons from './component/ThumbButtons.tsx';
import RelatedLinks from './component/RelatedLinks.tsx';
import AI_ICON from '../../assets/icon/AIicon';
import './detail.css';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { getFetcher } from '../../utils.ts';

const { Search } = Input;
const avatar_src = '../../assets/avatar.svg';

const DetailPage: React.FC = () => {
  const { id } = useParams(); // 根据url来获取params
  //   const [data, setData] = useState<any>({}); // 初始化为空对象
  const [inputValue, setInputValue] = useState('');
  const [messageApi, contextHolder] = message.useMessage(); // 骨架屏，但是貌似还用不了
  const [ifAi, setAi] = useState<boolean>(false); // 是否启用AI辅助功能（打开抽屉）
  const navigate = useNavigate();

  // TODO: 加入AI功能后，要修改drawer-search的逻辑
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  // AI辅助功能的搜索按钮处理事件
  const onSearch = () => {
    // 处理输入框的值
    console.log('Input Value:', inputValue);
  };
  // 打开抽屉（AI辅助功能）
  const showDrawer = () => {
    setAi(true);
  };
  // 关闭抽屉
  const onClose = () => {
    setAi(false);
  };
  // 回到上一个页面
  const goBackToLastPage = () => {
    navigate(-1); // 返回上一页
  };

  // 向后端发起请求获取详情信息的返回体
  interface DetailData {
    title: string;
    source: string;
    publishTime: string; // ISO 8601 时间格式
    feedbackCnt: {
      likes: number;
      dislikes: number;
    };
    content: string;
    resultType: number;
    link: string;
  }
  // 调用SWR hook来获取详情页的数据
  const { data, error, isLoading } = useSWR<DetailData>(
    `/search/detail?id=${id}`,
    getFetcher,
    {
      refreshInterval: 1000,
    }
  );

  // 显示正在加载的message
  const showLoading = () => {
    messageApi.open({
      type: 'loading',
      content: '数据加载中...',
      duration: 0,
    });
    // Dismiss manually and asynchronously
    setTimeout(messageApi.destroy, 2500);
  };

  // 如果有错误，显示错误信息
  if (error) {
    console.error('Failed to fetch data:', error);
    message.error('加载失败！');
  }

  // 在加载状态下显示 loading 界面
  if (isLoading) {
    // 调用showLoading()函数来显示加载状态
    showLoading();
    return (
      <div className="detail-box">
        <Card
          style={{
            marginTop: '20px',
            width: '800px',
            height: '600px',
            // justifyContent: 'center',
            // alignItems: 'center',
            // display: 'flex',
          }}
        >
          <Skeleton
            loading={isLoading}
            active
            avatar
            paragraph={{ rows: 14 }}
          />
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="detail-box">
        <Card
          style={{
            marginTop: '20px',
            width: '800px',
            height: '600px',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Empty description="暂无数据" />;
        </Card>
      </div>
    );
  }

  // 假数据
  //   const data = {
  //     title: '中共中央印发《全国干部教育培训规划(2023-2027年)》',
  //     source: '新华社',
  //     publishTime: '2023-10-16 19:35',
  //     feedbackCnt: { likes: 30, dislikes: 2 },
  //     content:
  //       '  新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。 通知指出，制定实施《规划》是党中央着眼新时代新征程党的使命任务作出的重要部署。要把深入学习贯彻习近平新时代中国特色社会主义思想作为主题主线，坚持不懈用党的创新理论凝心铸魂、强基固本。要坚持把政治训练贯穿干部成长全周期，教育引导干部树立正确的权力观、政绩观、事业观，提高干部政治判断力、政治领悟力、政治执行力。要围绕贯彻落实党的二十大作出的重大战略部署，分层级分领域分专题开展履职能力培训，提高干部推动高质量发展本领、服务群众本领、防范化解风险本领。要构建完善的干部教育培训体系，发挥好党校（行政学院）干部教育培训主渠道主阵地作用，不断优化教育培训方式方法。要大力弘扬理论联系实际的马克思主义学风，力戒形式主义，勤俭规范办学，努力营造学习之风、朴素之风、清朗之风。..',
  //     link: 'https://www.gov.cn/zhengce/202310/content_6909454.htm?menuid=104',
  //   };
  const { title, source, publishTime, feedbackCnt, content, link } = data;
  // 显示调试信息
  console.log(data);

  // 正常显示页面
  return (
    <div className="detail-box">
      {contextHolder}
      {
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
            id={id || ''} // 如果 id 是 undefined，则使用空字符串(TODO)
            initialLikes={feedbackCnt.likes}
            initialDislikes={feedbackCnt.dislikes}
          />

          <Divider />
          {<RelatedLinks />}

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
            <Tooltip title="回到上一页" placement="right" color="#7464FA">
              <FloatButton
                icon={<ArrowLeftOutlined />}
                onClick={goBackToLastPage}
              />
            </Tooltip>
            <Tooltip title="AI总结" placement="right" color="#7464FA">
              <FloatButton
                badge={{ dot: true }}
                icon={<AI_ICON />}
                onClick={showDrawer}
              />
            </Tooltip>
            <Drawer
              title="AI智能文档总结"
              placement="right"
              onClose={onClose}
              open={ifAi}
              closable={false} // 不能通过点击其他区域来关闭抽屉
              maskClosable={false}
              extra={
                <Space>
                  <Button
                    className="drawer-cancle-button"
                    type="primary"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Space>
              }
              className="custom-drawer"
              styles={{
                header: {
                  background: 'linear-gradient( blue, pink)',
                  color: 'white',
                },
              }}
              footer={
                <div className="drawer-search">
                  <div className="drawer-search-avatar">
                    {/* TODO: 可以考虑把avatar换成自己的 avatar= */}
                    <img
                      src={avatar_src}
                      style={{ width: '2em', height: '2em' }}
                    />
                  </div>
                  <Search
                    placeholder="input search text"
                    style={{ width: '90%', paddingLeft: '5px' }}
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
            </Drawer>
          </FloatButton.Group>
        </Card>
      }

      {/* 回到顶部按钮
      <FloatButton.BackTop /> */}
    </div>
  );
};

export default DetailPage;
