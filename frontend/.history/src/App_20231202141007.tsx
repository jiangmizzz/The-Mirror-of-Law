import React, { useState } from 'react';
import './App.css';
import './assets/reset.css';
import {
  Button,
  ConfigProvider,
  theme,
  Layout,
  Avatar,
  Space,
  Typography,
  Badge,
  Dropdown,
  Divider,
  Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BellOutlined,
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import SearchPage from './pages/search/search';
import ResultsPage from './pages/results/results';
import DetailPage from './pages/detail/detail';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useToken } = theme;
const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <Space align="center">
        <UserOutlined />
        <Text>个人中心</Text>
      </Space>
    ),
  },
  {
    key: '2',
    label: (
      <Space align="center">
        <SettingOutlined />
        <Text>个人设置</Text>
      </Space>
    ),
  },
];

const App: React.FC = () => {
  const [ifLogin, setLogin] = useState<boolean>(false);

  function UserInfo() {
    const { token } = useToken();

    const contentStyle: React.CSSProperties = {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary,
    };

    const menuStyle: React.CSSProperties = {
      boxShadow: 'none',
    };
    if (!ifLogin) {
      return (
        <>
          <Space align="center" className="app-user">
            <Badge dot={true}>
              <Button shape="circle" icon={<BellOutlined />} ghost />
            </Badge>
            <Dropdown
              menu={{ items }}
              placement="bottom"
              dropdownRender={(menu) => (
                <div style={contentStyle}>
                  {React.cloneElement(menu as React.ReactElement, {
                    style: menuStyle,
                  })}
                  <Divider style={{ margin: 0 }} />
                  <Space style={{ padding: 8 }}>
                    <ConfigProvider wave={{ disabled: true }}>
                      <Button
                        icon={<LogoutOutlined />}
                        danger
                        style={{
                          paddingLeft: 8,
                          paddingRight: 8,
                          border: 'none',
                        }}
                      >
                        退出登录
                      </Button>
                    </ConfigProvider>
                  </Space>
                </div>
              )}
            >
              <Space align="center" className="app-user-block">
                <Avatar
                  style={{
                    backgroundColor: '#7464FA',
                    verticalAlign: 'middle',
                  }}
                  size="large"
                  gap={2}
                >
                  {'UserName'.charAt(0)}
                </Avatar>
                <Text style={{ color: '#ffffff' }}>UserName</Text>
                <DownOutlined style={{ color: '#ffffff' }} />
              </Space>
            </Dropdown>
          </Space>
        </>
      );
    } else {
      return (
        <>
          <Space className="app-user" size="middle">
            <Button ghost>登录</Button>
            <Button ghost>注册</Button>
          </Space>
        </>
      );
    }
  }

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#7464FA',
            colorLink: '#7464FA',
            colorInfo: '#7464FA',
          },
          components: {
            Layout: {
              // bodyBg: "#ffffff",
              // footerBg: "#ffffff",
            },
          },
        }}
      >
        <Layout style={{ minHeight: '100vh' }}>
          <Header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* 跳转回搜索页 */}
            <Link to="/search">
              <Tooltip title="回到首页" placement="right" color="#7464FA">
                <div className="app-home">
                  <HomeOutlined className="app-home-icon" />
                </div>
              </Tooltip>
            </Link>
            {<UserInfo />}
          </Header>
          <Content className="app-body">
            {/* 在下面配置路由 */}
            <Routes>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route
                path="/detail"
                element={
                  <DetailPage
                    data={{
                      title: '中共中央印发《全国干部教育培训规划(2023-2027年)》',
                      source: '新华社',
                      publishTime: '2023-10-16 19:35',
                      feedbackCnt: {
                        likes: 30,
                        dislikes: 2,
                      },
                      content: '新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。

					  通知指出，制定实施《规划》是党中央着眼新时代新征程党的使命任务作出的重要部署。要把深入学习贯彻习近平新时代中国特色社会主义思想作为主题主线，坚持不懈用党的创新理论凝心铸魂、强基固本。要坚持把政治训练贯穿干部成长全周期，教育引导干部树立正确的权力观、政绩观、事业观，提高干部政治判断力、政治领悟力、政治执行力。要围绕贯彻落实党的二十大作出的重大战略部署，分层级分领域分专题开展履职能力培训，提高干部推动高质量发展本领、服务群众本领、防范化解风险本领。要构建完善的干部教育培训体系，发挥好党校（行政学院）干部教育培训主渠道主阵地作用，不断优化教育培训方式方法。要大力弘扬理论联系实际的马克思主义学风，力戒形式主义，勤俭规范办学，努力营造学习之风、朴素之风、清朗之风。
					  
					  通知要求，各地区各部门贯彻落实《规划》中的重要情况和建议，要及时报告党中央。
					  
					  《全国干部教育培训规划（2023－2027年）》全文如下。
					  
					  干部教育培训是建设高素质干部队伍的先导性、基础性、战略性工程，在推进中国特色社会主义伟大事业和党的建设新的伟大工程中具有不可替代的重要地位和作用。为培养造就政治过硬、适应新时代要求、具备领导社会主义现代化建设能力的高素质干部队伍，结合干部教育培训工作实际，制定本规划。
					  
					  一、总体要求
					  
					  高举中国特色社会主义伟大旗帜，坚持马克思列宁主义、毛泽东思想、邓小平理论、“三个代表”重要思想、科学发展观，全面贯彻习近平新时代中国特色社会主义思想，深入贯彻习近平总书记关于党的建设的重要思想，深入贯彻党的二十大精神，认真落实新时代党的建设总要求和新时代党的组织路线，深刻领悟“两个确立”的决定性意义，增强“四个意识”、坚定“四个自信”、做到“两个维护”，把深入学习贯彻习近平新时代中国特色社会主义思想作为主题主线，以坚定理想信念宗旨为根本，以提高政治能力为关键，以增强推进中国式现代化建设本领为重点，紧紧围绕新时代新征程党的使命任务，持续深化党的创新理论武装，强化政治训练，加强履职能力培训，深入推进干部教育培训体系改革创新，增强教育培训的时代性、系统性、针对性、有效性，高质量教育培训干部，高水平服务党和国家事业发展，为以中国式现代化全面推进中华民族伟大复兴提供思想政治保证和能力支撑。
					  
					  本规划的主要目标是：党的创新理论武装更加系统深入，用习近平新时代中国特色社会主义思想凝心铸魂取得显著成效，广大干部理想信念更加坚定、思想意志更加统一、行动步调更加一致，对党的创新理论更加笃信笃行，用以指导实践、推动工作更加自觉。政治训练更加扎实有效，广大干部党性更加坚强，作风更加过硬，政治判断力、政治领悟力、政治执行力不断提高，政治纪律和政治规矩意识进一步增强，自觉在政治立场、政治方向、政治原则、政治道路上同以习近平同志为核心的党中央保持高度一致。履职能力培训更加精准管用，广大干部贯彻新发展理念、构建新发展格局、推动高质量发展能力进一步提高，统筹发展和安全的能力不断提升，专业知识和人文综合素养更加完备。干部教育培训体系更加科学健全，培训内容更具时代性系统性，培训方法更具针对性有效性，培训保障更加坚实有力，培训制度更加规范完备，选育管用机制更加协同高效。',
                      resultType: 0,
                      link: '',
                    }}
                  />
                }
              />
              <Route path="/" element={<Navigate to="/search" />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            The Mirror of Law ©2023 Created by SEM-G04
          </Footer>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default App;
