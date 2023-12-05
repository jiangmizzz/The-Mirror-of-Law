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
} from "antd";
import { BulbOutlined } from "@ant-design/icons";
// import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import "./SearchBox.css";
import dayjs from "dayjs";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import aiIcon from "../../assets/AI.svg";
import { useNavigate } from "react-router-dom";
import type { SearchProps } from "../../vite-env";

const { RangePicker } = DatePicker;
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
            <img
              src={aiIcon}
              className="search-ai-img"
              onClick={() => setAi(true)}
            />
          </Tooltip>
        )}
        <Drawer
          title="AI智能关键词提取"
          placement="right"
          onClose={() => setAi(false)}
          open={ifAi}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Drawer>
        <Space.Compact size="large">
          {<SearchType />}
          <AutoComplete
            style={{ width: props.width }}
            //之后编辑为历史搜索记录
            options={[
              { value: "Burns Bay Road" },
              { value: "Downing Street" },
              { value: "Wall Street" },
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
            <img
              src={aiIcon}
              className="search-ai-img"
              onClick={() => setAi(true)}
            />
          </Tooltip>
        )}
      </Space>
      {ifSenior && <SeniorSearch />}
    </>
  );
}
