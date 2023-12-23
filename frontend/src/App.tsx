import React, { useEffect } from "react";
import "./App.css";
import "./assets/reset.css";
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
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  DownOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import SearchPage from "./pages/search/search";
import ResultsPage from "./pages/results/results";
import DetailPage from "./pages/detail/detail";
import { useUserStore } from "./stores/userStore";
import { useState } from "react";
import LogPop from "./components/LogPop/LogPop";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import type { Response } from "./vite-env";
import { getUserInfo, postFetcher } from "./utils";

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useToken } = theme;

const App: React.FC = () => {
  const [, contextHolder] = message.useMessage();
  const userStore = useUserStore(); //全局用户状态管理器
  const [ifPop, setIfPop] = useState<boolean>(false);
  const [popType, setPopType] = useState<
    "login" | "register" | "edit-info" | "edit-password"
  >("login");

  //获取用户信息，放在顶层，以避免子组件重新渲染触发多次请求
  const { data: userData, isLoading: userLoading } = useSWR(
    () => {
      //只在未登录时请求获取数据
      if (userStore.ifLogin) return false;
      return "/user/info";
    },
    getUserInfo,
    {
      //不依赖缓存，防止每次获取的用户信息是同一个
      revalidateOnMount: true,
    }
  );
  //获取数据后进行更新
  useEffect(() => {
    if (!userLoading) {
      //加载完成
      if (userData == -1) {
        //没有登录态
        userStore.logout(); //其实这句没什么用
      } else if (userData) {
        userStore.login(
          userData.id,
          userData.userName,
          userData.email,
          userData.history
        );
      }
    }
  }, [userData]);

  //用户登出的trigger
  const { trigger: logoutTrigger } = useSWRMutation<
    Response<null>,
    Error,
    string,
    null
  >("/user/logout", postFetcher);

  //用户登出
  const logout = async () => {
    const logoutRes = await logoutTrigger(null);
    if (logoutRes.success) {
      //登出成功
      userStore.logout();
      message.success("退出登录成功!");
    } else {
      message.error(
        "退出登录失败!" + logoutRes.errorCode + ": " + logoutRes.errorMessage
      );
    }
  };

  //子组件，用户信息栏
  function UserInfo() {
    const { token } = useToken();
    const contentStyle: React.CSSProperties = {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary,
    };

    const menuStyle: React.CSSProperties = {
      boxShadow: "none",
    };
    const items: MenuProps["items"] = [
      {
        key: "1",
        label: (
          <Space
            align="center"
            onClick={() => {
              setIfPop(true);
              setPopType("edit-info");
            }}
          >
            <UserOutlined />
            <Text>编辑信息</Text>
          </Space>
        ),
      },
      {
        key: "2",
        label: (
          <Space
            align="center"
            onClick={() => {
              setIfPop(true);
              setPopType("edit-password");
            }}
          >
            <SettingOutlined />
            <Text>修改密码</Text>
          </Space>
        ),
      },
    ];

    if (userStore.ifLogin) {
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
                          border: "none",
                        }}
                        onClick={logout}
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
                    backgroundColor: "#7464FA",
                    verticalAlign: "middle",
                  }}
                  size="large"
                  gap={2}
                >
                  {userStore.userName.charAt(0).toUpperCase()}
                </Avatar>
                <Text style={{ color: "#ffffff" }}>{userStore.userName}</Text>
                <DownOutlined style={{ color: "#ffffff" }} />
              </Space>
            </Dropdown>
          </Space>
        </>
      );
    } else {
      return (
        <>
          <Space className="app-user" size="middle">
            <Button
              ghost
              onClick={() => {
                setIfPop(true);
                setPopType("login");
              }}
            >
              登录
            </Button>
            <Button
              ghost
              onClick={() => {
                setIfPop(true);
                setPopType("register");
              }}
            >
              注册
            </Button>
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
            colorPrimary: "#7464FA",
            colorLink: "#7464FA",
            colorInfo: "#7464FA",
          },
          components: {
            Layout: {
              // bodyBg: "#ffffff",
              // footerBg: "#ffffff",
            },
          },
        }}
      >
        {contextHolder}
        {ifPop && <LogPop type={popType} closePop={() => setIfPop(false)} />}
        <Layout style={{ minHeight: "100vh" }}>
          <Header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
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
              <Route path="/detail/:id/:type" element={<DetailPage />} />
              <Route path="/" element={<Navigate to="/search" />} />
            </Routes>
          </Content>
          <Footer
            style={{
              textAlign: "center",
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
