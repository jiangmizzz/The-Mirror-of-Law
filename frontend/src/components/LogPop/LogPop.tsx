import "./LogPop.css";
import { Card, Button, message, Checkbox } from "antd";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  CloseOutlined,
  DoubleLeftOutlined,
} from "@ant-design/icons";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import logo from "../../assets/main-logo.svg";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { postFetcher } from "../../utils";
import { UserInfo } from "../../vite-env";
import type { Response } from "../../vite-env";
import { useUserStore } from "../../stores/userStore";

interface LogPopProps {
  type: "login" | "register" | "edit-info" | "edit-password";
  userName?: string; //userName和email的预设值，用于编辑用户信息
  email?: string;
  closePop: () => void;
}

export default function LogPop(props: LogPopProps) {
  const [, contextHolder] = message.useMessage();
  const useStore = useUserStore();
  const [popType, setPopType] = useState<
    "login" | "register" | "edit-info" | "edit-password"
  >(props.type);
  const [ifRemember, setIfRemember] = useState<boolean>(true);
  //登录的trigger
  const { trigger: loginTrigger, isMutating: isLogining } = useSWRMutation<
    Response<UserInfo>,
    Error,
    string,
    {
      email: string;
      password: string;
      rememberMe: boolean;
    }
  >("/user/login", postFetcher);
  //注册的trigger
  const { trigger: registerTrigger, isMutating: isRegistering } =
    useSWRMutation<
      Response<null>,
      Error,
      string,
      {
        email: string;
        userName: string;
        password: string;
      }
    >("/user/register", postFetcher);

  function submitText(type: string): string {
    switch (type) {
      case "login":
        return "登录";
      case "register":
        return "注册";
      default:
        return "确认修改";
    }
  }

  //TODO:处理不同类的提交事件
  //需要根据提交的类型调用不同的请求
  async function handleSubmit(formValue: Record<string, any>) {
    if (popType == "login") {
      //登录
      const loginRes = await loginTrigger({
        email: formValue.email,
        password: formValue.password,
        rememberMe: ifRemember,
      });
      // console.log(loginRes.data);
      if (loginRes.success) {
        //成功登录，修改当前状态，并关闭窗口
        const data = loginRes.data!;
        useStore.login(data.id, data.userName, data.email, data.history);
        message.success("登录成功!");
        props.closePop();
      } else if (loginRes.errorCode == "1") {
        //密码错误
        message.error("密码错误!");
      } else if (loginRes.errorCode == "2") {
        //邮箱未注册
        message.info("该邮箱号未注册!");
      } else {
        //发生未知错误
        message.error(
          "发生未知错误: " + loginRes.errorCode + ": " + loginRes.errorMessage
        );
        throw new Error(loginRes.errorCode + ": " + loginRes.errorMessage);
      }
    } else if (popType == "register") {
      //注册
      const registerRes = await registerTrigger({
        email: formValue.email,
        userName: formValue.username,
        password: formValue.password,
      });
      if (registerRes.success) {
        //成功注册，跳转到登录窗口
        message.success("注册成功，返回登录页");
        setPopType("login");
      } else if (registerRes.errorCode == "1") {
        //该邮箱已注册
        message.info("该邮箱已注册!");
      } else if (registerRes.errorCode == "2") {
        //用户名已存在
        message.info("该用户名已存在!");
      } else {
        //发生未知错误
        message.error(
          "发生未知错误: " +
            registerRes.errorCode +
            ": " +
            registerRes.errorMessage
        );
        throw new Error(
          registerRes.errorCode + ": " + registerRes.errorMessage
        );
      }
    }
  }

  return (
    <>
      {contextHolder}
      <div className="LogPop-bg">
        <Card className="LogPop-card" bordered={false}>
          <div className="LogPop-header">
            <div>
              {popType == "register" && (
                <Button
                  icon={<DoubleLeftOutlined />}
                  type="link"
                  size="small"
                  onClick={() => setPopType("login")}
                >
                  已有账号，去登录
                </Button>
              )}
            </div>
            <CloseOutlined
              className="LogPop-close"
              style={{ marginLeft: "auto" }}
              onClick={props.closePop}
            />
          </div>
          <LoginForm
            //此处获取表单提交值
            onFinish={handleSubmit}
            className="LogPop-body"
            title={<img src={logo} style={{ height: "3em" }} />}
            subTitle="律镜  —— AI+ 智能法律搜索引擎"
            submitter={{
              searchConfig: { submitText: submitText(popType) },
              render: (props) => {
                return [
                  <div key="submit">
                    <div style={{ height: "0.5em" }}></div>
                    {popType == "login" && (
                      <>
                        <div className="LogPop-body-corner">
                          <Checkbox
                            checked={ifRemember}
                            //是否记住我
                            onChange={(e: CheckboxChangeEvent) => {
                              setIfRemember(e.target.checked);
                            }}
                          >
                            记住我
                          </Checkbox>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => setPopType("register")}
                          >
                            注册新账号
                          </Button>
                        </div>
                        <div style={{ height: "1em" }}></div>
                      </>
                    )}
                    <Button
                      style={{ width: "100%" }}
                      type="primary"
                      size="large"
                      //这里选择的属性可以直接写submit/reset，也可以调用formInstance中的方法
                      onClick={() => props.submit()}
                      //TODO:之后增加多种按钮的‘或’条件判断
                      loading={isLogining || isRegistering}
                    >
                      {submitText(popType)}
                    </Button>
                  </div>,
                ];
              },
            }}
          >
            <ProFormText
              name="email"
              fieldProps={{
                size: "large",
                prefix: <MailOutlined />,
              }}
              placeholder={popType == "register" ? "有效的邮箱号" : "邮箱号"}
              rules={[
                {
                  required: true,
                  message: "请输入正确的邮箱号!",
                  type: "email",
                },
              ]}
            />
            {popType == "register" && (
              <ProFormText
                name="username"
                fieldProps={{
                  size: "large",
                  prefix: <UserOutlined />,
                }}
                placeholder={"用户名 (唯一)"}
                rules={[
                  {
                    required: true,
                    message: "请输入用户名!",
                  },
                ]}
              />
            )}
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: <LockOutlined />,
              }}
              placeholder={"密码"}
              rules={[
                {
                  required: true,
                  message: "请输入密码！",
                },
              ]}
            />
          </LoginForm>
        </Card>
      </div>
    </>
  );
}
