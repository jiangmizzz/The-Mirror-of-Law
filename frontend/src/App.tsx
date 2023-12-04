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
              <Route path="/detail/:id" element={<DetailPage />} />
              <Route path="/" element={<Navigate to="/search" />} />
            </Routes>
          </Content>
          <Footer
            style={{
              textAlign: 'center',
              //dbq这部分样式我感觉有点太鲜艳了，先注释一下
              // background: "linear-gradient(to bottom right, #8832b7, #7464fa)",
              // color: "white",
            }}
            className="footer"
          >
            The Mirror of Law ©2023 Created by SEM-G04
          </Footer>
        </Layout>
      </ConfigProvider>
    </>
  );
};

export default App;
