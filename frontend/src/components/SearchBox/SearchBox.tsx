import {
  AutoComplete,
  Input,
  Space,
  Select,
  Button,
  DatePicker,
  Checkbox,
  Tooltip,
  Drawer,
  message,
  Avatar,
} from "antd";
import { BulbOutlined, UserOutlined } from "@ant-design/icons";
// import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import "./SearchBox.css";
import dayjs from "dayjs";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import aiIcon from "../../assets/AI.svg";
import { useNavigate } from "react-router-dom";
import type { SearchProps } from "../../vite-env";
import TextArea from "antd/es/input/TextArea";
import AI_avatar from "../../assets/iconSideChatDoc.png";
import useSWR from "swr";
import { getFetcher } from "../../utils.ts";

const { RangePicker } = DatePicker;

// TODO， 没有相应接口，mock数据
async function getAiResponse(userMessage: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`AI 模型的响应：你说的是 "${userMessage}" 吗？`);
    }, 1000);
  });
}

//子组件，搜索组件
export default function SearchBox(props: {
  width: number;
  searchParams?: SearchProps;
}) {
  const resultTypeOptions = [
    "法律法规",
    "裁判文书",
    "期刊论文",
    "法律观点",
    "资讯",
  ];
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate(); //导航到其他页面
  const defaultResultTypes = ["法律法规", "裁判文书"];
  const [searchType, setSearchType] = useState<number>(0); //搜索类型
  const [input, setInput] = useState<string>("");
  const [ifPop, setPop] = useState<boolean>(false);
  const [ifSenior, setSenior] = useState<boolean>(false);
  const [resultTypes, setResultTypes] = //搜索结果类型
    useState<CheckboxValueType[]>(defaultResultTypes);
  const [timeRange, setTimeRange] = useState<string[]>(["", ""]);
  const [updateTime, setUpdateTime] = useState<number>(0); //更新时间
  const [ifAi, setAi] = useState<boolean>(false);
  const [inputValueAI, setInputValueAI] = useState(""); // AI chatbot textarea中的文本（用户输入的信息）

  // 关闭抽屉
  const onClose = () => {
    setFetchAiData(false);
    setAi(false);
  };

  // 聊天消息的状态
  const [chatMessages, setChatMessages] = useState([
    {
      content:
        "你好！我是AI智能助手，我将对搜索框输入的内容进行提取关键词并呈现给你。",
      type: "ai",
    },
  ]);

  // 在 useEffect 中监听 inputValueAI 变化，并在变化后执行 setInputValueAI("")
  useEffect(() => {
    setInputValueAI("");
  }, [chatMessages]);

  // AI 部分
  interface AiExtractResponse {
    res: string;
  }

  const [fetchAiData, setFetchAiData] = useState(false);

  const { data: AIdata, error: AIerror } = useSWR<AiExtractResponse>(
    fetchAiData && input ? `/ai/extract?input=${input}` : null,
    getFetcher
    // {
    //   refreshInterval: 1000,
    // }
  );

  // 在 useEffect 钩子中处理 AI 服务
  useEffect(() => {
    if (fetchAiData && AIdata) {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { content: AIdata.toString(), type: "ai" },
      ]);
    }
  }, [fetchAiData, AIdata]);

  // 处理错误
  useEffect(() => {
    if (AIerror) {
      console.error("Failed to fetch AI summary:", AIerror);
      message.error("获取 AI 摘要失败！");
    }
  }, [AIerror]);

  const handleAIService = () => {
    // 当用户点击抽屉时调用此函数
    console.log("Input value:" + input);
    if (!input) {
      return;
    }
    setFetchAiData(true);
    setAi(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValueAI(e.target.value);
  };

  // 处理用户输入并获取 AI 响应
  const handleUserInput = async () => {
    console.log("Input Value:", inputValueAI);
    const userMessage = inputValueAI.trim();
    // 空消息不做任何处理
    if (userMessage === "") return;

    // 将用户消息添加到聊天中
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { content: userMessage, type: "user" },
    ]);

    // TODO: 将用户消息发送到 AI 模型并获取 AI 响应
    try {
      // 发送用户消息到 AI 模型并获取 AI 响应
      const aiResponse = await getAiResponse(userMessage);

      // 将 AI 响应添加到聊天中
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { content: aiResponse, type: "ai" },
      ]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      message.error("获取 AI 响应失败！");
    }

    // 清除输入
    setInputValueAI("");
  };

  //在result页打开时需要初始化搜索选项
  useEffect(() => {
    //没有接收到的参数默认值为undefined
    if (props.searchParams) {
      // console.log(props.searchParams);
      //批量更新
      setInput(props.searchParams.input);
      setSearchType(props.searchParams.searchType);
      if (props.searchParams.resultTypes) {
        setResultTypes(props.searchParams.resultTypes);
        setSenior(true);
      }
      if (props.searchParams.startTime && props.searchParams.endTime) {
        setTimeRange([
          props.searchParams.startTime,
          props.searchParams.endTime,
        ]);
        setSenior(true);
      }
    }
  }, [props.searchParams]);

  //二级子组件，搜索框前缀，指定搜索类型
  function SearchType() {
    return (
      <>
        <Select
          defaultValue={0}
          style={{ width: 110 }}
          className="search-select"
          options={[
            { value: 0, label: "全文搜索" },
            { value: 1, label: "标题搜索" },
            { value: 2, label: "作者搜索" },
            { value: 3, label: "主题搜索" },
          ]}
          value={searchType}
          onChange={(newVal) => {
            setSearchType(newVal);
          }}
        />
      </>
    );
  }
  //二级子组件，高级搜索
  function SeniorSearch() {
    const checkAll = resultTypeOptions.length === resultTypes.length;
    const indeterminate =
      resultTypes.length > 0 && resultTypes.length < resultTypeOptions.length;
    const onChange = (list: CheckboxValueType[]) => {
      setResultTypes(list);
    };
    const onCheckAllChange = (e: CheckboxChangeEvent) => {
      setResultTypes(e.target.checked ? resultTypeOptions : []);
    };
    return (
      <>
        <div
          className={`${"search-senior-body"} ${
            props.width >= 500 ? "search-senior-offset" : ""
          }`}
        >
          <Space>
            <Checkbox
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              全选
            </Checkbox>
            <Checkbox.Group
              options={resultTypeOptions}
              value={resultTypes}
              onChange={onChange}
            />
          </Space>
          <Space>
            <div className="senior-time-text">时间范围：</div>
            <Space.Compact>
              {/* <Card>发布时间</Card> */}
              <div className="senior-time-tag">发布时间</div>
              <RangePicker
                value={
                  timeRange[0] == "" && timeRange[1] == ""
                    ? [null, null]
                    : [dayjs(timeRange[0]), dayjs(timeRange[1])]
                }
                onChange={(...dates) => {
                  // console.log(dates);
                  setTimeRange(dates[1]);
                }}
                allowClear
                // allowEmpty={[true, true]}
              />
            </Space.Compact>
            <Space.Compact>
              <div className="senior-time-tag">更新时间</div>
              <Select
                defaultValue={0}
                style={{ width: 110 }}
                options={[
                  { value: 0, label: "不限" },
                  { value: 1, label: "最近一月" },
                  { value: 2, label: "最近半年" },
                  { value: 3, label: "最近一年" },
                  { value: 4, label: "今年迄今" },
                  { value: 5, label: "上一年度" },
                ]}
                value={updateTime}
                onChange={(newVal) => {
                  setUpdateTime(newVal);
                }}
              />
            </Space.Compact>
          </Space>
        </div>
      </>
    );
  }

  //处理搜索参数，并放进url里跳转到搜索结果页
  function handleSearch() {
    if (input == "") {
      messageApi.open({
        type: "error",
        content: "搜索输入不能为空！",
      });
      return;
    }
    const paramsObj: Record<string, string> = {
      input: input,
      searchType: String(searchType),
    };
    if (ifSenior) {
      //启用高级搜索
      if (resultTypes.length == 0) {
        //提示未选择任一搜索结果
        messageApi.open({
          type: "error",
          content: "请至少选择一项需要的搜索结果类型！",
        });
        return;
      } else {
        paramsObj["resultTypes"] = String(resultTypes);
        if (timeRange[0] != "" && timeRange[1] != "") {
          //选择了时间范围
          paramsObj["startTime"] = timeRange[0];
          paramsObj["endTime"] = timeRange[1];
        }
      }
    }
    const params = new URLSearchParams(paramsObj);
    // console.log("search!", params.toString());
    navigate(`/results?${params}`);
  }
  return (
    <>
      {contextHolder}
      <Space style={{ height: "50px" }}>
        {/* 加投影一直有缝隙，放弃了 */}
        {/* 用一种抽象的方法判断AI图标在不同页面的放置位置 */}
        {props.width >= 500 && (
          <Tooltip title="AI辅助" overlayStyle={{ fontSize: "12px" }}>
            <div onClick={handleAIService}>
              <img src={aiIcon} className="search-ai-img" />
            </div>
          </Tooltip>
        )}
        <Drawer
          title="AI智能文档总结"
          placement="right"
          onClose={onClose}
          open={ifAi}
          maskClosable={false} // 不能通过点击其他区域来关闭抽屉
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
              background: "linear-gradient(blue,#ffccff)",
              color: "white",
            },
            body: {
              background: "#fffafe",
            },
            footer: {
              background: "linear-gradient(#ffccff,#ae8dff)",
            },
          }}
          footer={
            <div className="drawer-search">
              <TextArea
                placeholder="请输入文本"
                autoSize={{ minRows: 2, maxRows: 6 }} // 设置自动调整大小的行数范围
                value={inputValueAI}
                onChange={handleInputChange}
                onPressEnter={handleUserInput} // 处理用户按下 Enter 键发送消息
              />
              <Button type="primary" onClick={handleUserInput}>
                Send
              </Button>
            </div>
          }
        >
          <div className="chat-container">
            {chatMessages.map((message, index) => (
              <div key={index} className="chat-message-box">
                {message.type === "ai" && ( // AI message, 头像放在文本框前
                  <div className="avatar">
                    <img
                      src={AI_avatar}
                      alt="AI Avatar"
                      style={{
                        width: "160%",
                        height: "160%",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                )}
                <div
                  className={`message-content ${
                    message.type === "ai" ? "ai" : "user"
                  }`}
                >
                  {message.content}
                </div>
                {message.type === "user" && ( // user message, 头像放在文本框后
                  <div className="avatar">
                    <Avatar
                      style={{ backgroundColor: "#2e95d3" }}
                      icon={<UserOutlined />}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Drawer>
        <Space.Compact size="large">
          {<SearchType />}
          <AutoComplete
            style={{ width: props.width }}
            //之后编辑为历史搜索记录
            options={[
              { value: "刑法" },
              { value: "国务院" },
              { value: "未成年人保护法" },
            ]}
            size="large"
            open={ifPop}
            onFocus={() => setPop(true)}
            onBlur={() => setPop(false)}
            onSelect={(value: string) => {
              setPop(false);
              setInput(value);
            }}
          >
            {/* 此处添加config疑似会导致input显示异常，故注释 */}
            <Input.Search
              id="inputBox"
              size="large"
              // 因为输入框不能赋初值的bug，为防止显示值与实际值的不一致，使用placehold提示
              placeholder={
                props.searchParams
                  ? props.searchParams.input
                  : "在 Mirror of Law 中搜索"
              }
              // 发现input组件value及defaultValue值无效，疑似为bug
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSearch={handleSearch}
              enterButton
            />
            {/* </ConfigProvider> */}
          </AutoComplete>
        </Space.Compact>
        <Space.Compact direction="vertical">
          <Button
            type="link"
            size="small"
            icon={<BulbOutlined />}
            onClick={() => setSenior(true)}
          >
            高级搜索
          </Button>
          {ifSenior && (
            <Button type="link" size="small" onClick={() => setSenior(false)}>
              收起
            </Button>
          )}
        </Space.Compact>
        {props.width < 500 && (
          <Tooltip title="AI辅助" overlayStyle={{ fontSize: "12px" }}>
            <div onClick={handleAIService}>
              <img src={aiIcon} className="search-ai-img" />
            </div>
          </Tooltip>
        )}
      </Space>
      {ifSenior && <SeniorSearch />}
    </>
  );
}
