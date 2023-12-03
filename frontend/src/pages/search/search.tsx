import { Space, Button, Divider, Card, Tooltip } from "antd";
import { StarTwoTone, InfoCircleOutlined } from "@ant-design/icons";
// import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import "./search.css";
import SearchBox from "../../components/SearchBox/SearchBox";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/main-logo.svg";

export default function SearchPage() {
  //子组件，推送组件
  function Recommend() {
    const location = useLocation(); //模拟页面栈
    const navigate = useNavigate(); //导航到其他页面
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
                <Button
                  key={item.id}
                  type="link"
                  onClick={() => {
                    navigate(`/detail/${item.id}`, {
                      state: { previousLocation: location.pathname },
                    });
                  }}
                >
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
      <div>
        <img src={logo} style={{ height: "19em" }} />
      </div>
      {<SearchBox width={500} />}
      {<Recommend />}
    </>
  );
}
