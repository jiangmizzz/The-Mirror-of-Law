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
                      title:
                        '中共中央印发《全国干部教育培训规划(2023-2027年)》',
                      source: '新华社',
                      publishTime: '2023-10-16 19:35',
                      feedbackCnt: {
                        likes: 30,
                        dislikes: 2,
                      },
                      content:
                        '新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。新华社北京10月16日电 近日，中共中央印发了《全国干部教育培训规划（2023－2027年）》（以下简称《规划》），并发出通知，要求各地区各部门结合实际认真贯彻落实。',
                      resultType: 0,
                      link: 'https://www.gov.cn/zhengce/202310/content_6909454.htm?menuid=104',
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
