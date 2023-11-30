import {
  AutoComplete,
  Input,
  Space,
  Select,
  Button,
  DatePicker,
  Checkbox,
  Divider,
  Card,
  Tooltip,
  Drawer,
} from "antd";
import {
  BulbOutlined,
  StarTwoTone,
  InfoCircleOutlined,
} from "@ant-design/icons";
// import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import "./search.css";
import dayjs from "dayjs";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { CheckboxValueType } from "antd/es/checkbox/Group";
import aiIcon from "../../assets/AI.svg";

const { RangePicker } = DatePicker;

export default function SearchPage() {
  //子组件，搜索组件
  function SearchBox() {
    const resultTypeOptions = [
      "法律法规",
      "裁判文书",
      "期刊论文",
      "法律观点",
      "资讯",
    ];
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
          <div className="search-senior-body">
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

    function handleSearch() {
      console.log("search!", input);
    }
    return (
      <>
        <Space style={{ height: "50px" }}>
          {/* 加投影一直有缝隙，放弃了 */}
          <Tooltip title="AI辅助" overlayStyle={{ fontSize: "12px" }}>
            <img
              src={aiIcon}
              className="search-ai-img"
              onClick={() => setAi(true)}
            />
          </Tooltip>
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
              style={{ width: 500 }}
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
                size="large"
                placeholder="在 Mirror of Law 中搜索"
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
        </Space>

        {ifSenior && <SeniorSearch />}
      </>
    );
  }

  //子组件，推送组件
  function Recommend() {
    const [recommendList, setRecommendList] = useState<
      { title: string; id: number }[]
    >([]); //推荐链接列表

    useEffect(() => {
      setRecommendList([
        { title: "中共中央印发《全国干部教育培训规划(2023—2027年)》", id: 1 },
        {
          title:
            "中共中央办公厅、国务院办公厅关于调整应急管理部职责机构编制的通知",
          id: 2,
        },
        {
          title: "中共中央办公厅、国务院办公厅印发《深化集体林权制度改革方案》",
          id: 3,
        },
        {
          title:
            "中共中央办公厅、国务院办公厅关于调整中国人民银行职责机构编制的通知 ",
          id: 4,
        },
      ]);
    }, []);
    return (
      <>
        <Card className="search-recommend">
          {/* <div style={{ height: "100px" }}></div> */}
          {/* <div >推送列表</div> */}
          <div className="search-recommend-line"></div>
          <div className="search-recommend-head">
            <Space>
              <StarTwoTone twoToneColor="#7464FA" />
              <div style={{ fontSize: "15px" }}>个性化推荐</div>
            </Space>
            <Tooltip
              title="未登录状态下为随机推荐，登录后可实现基于用户兴趣的内容推荐"
              placement="right"
              overlayStyle={{ fontSize: "12px" }}
            >
              <InfoCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
            </Tooltip>
          </div>
          <Divider></Divider>
          <div className="search-recommend-list">
            {recommendList.map((item, index) => {
              return (
                <Button key={item.id} type="link">
                  {index + 1 + ". " + item.title}
                </Button>
              );
            })}
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <div style={{ fontSize: "19em" }}>LOGO</div>
      {<SearchBox />}
      {<Recommend />}
    </>
  );
}
