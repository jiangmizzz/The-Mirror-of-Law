import {
  Space,
  Button,
  Divider,
  Card,
  Tooltip,
  Spin,
  Skeleton,
  message,
  Empty,
} from "antd";
import { StarTwoTone, InfoCircleOutlined } from "@ant-design/icons";
// import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import "./search.css";
import SearchBox from "../../components/SearchBox/SearchBox";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/main-logo.svg";
import useSWR from "swr";
import { getFetcher } from "../../utils";
import { useUserStore } from "../../stores/userStore";

export default function SearchPage() {
  interface RecommendData {
    type: number;
    title: string;
    id: string;
  }

  interface RecommendDataList {
    map(
      arg0: (
        item: RecommendData,
        index: number
      ) => import("react/jsx-runtime").JSX.Element
    ): React.ReactNode;
    data: RecommendData[];
  }

  // mock 数据
  const recommendData = [
    {
      title: "中华人民共和国刑法",
      id: "55a694310a454ac288b713535b7bbf38",
      type: 0,
    },
    {
      title: "中华人民共和国预防未成年人犯罪法",
      id: "47bc55c7f60447ba91dc604d362a5b53",
      type: 0,
    },
    {
      title: "中华人民共和国国务院组织法",
      id: "878a83633bf243d98fdf2ee2371dc2e5",
      type: 0,
    },
    {
      title: "伊犁哈萨克自治州施行《中华人民共和国婚姻法》补充规定",
      id: "a1e5f05ca5764f519eb871e7d40a4363",
      type: 0,
    },
  ];

  const initialRecommendList: RecommendDataList = {
    data: recommendData,
    map: function (
      callback: (item: RecommendData, index: number) => React.ReactNode
    ): React.ReactNode {
      return this.data.map(callback);
    },
  };

  //子组件，推送组件
  function Recommend() {
    const [messageApi, contextHolder] = message.useMessage(); // 全局提示
    const [isGetResponse, setIsGetResponse] = useState(false); // 是否已经获取词云图的数据，防止多次请求
    const location = useLocation(); //模拟页面栈
    const navigate = useNavigate(); //导航到其他页面
    const userStore = useUserStore(); //全局用户状态管理器
    // const [recommendList, setRecommendList] = useState<
    //   { title: string; id: number }[]
    // >([]); //推荐链接列表
    const [recommendList, setRecommendList] =
      useState<RecommendDataList | null>(
        userStore.ifLogin ? null : initialRecommendList
      ); //推荐链接列表(根据用户是否登录来决定初始化的内容)
    console.log("RecommendDataList Data:", recommendList);

    const { data, error, isLoading } = useSWR<RecommendDataList>(() => {
      //   if (isGetResponse || !userStore.ifLogin) {
      //     // 设置条件过滤多余请求（未登录时使用假数据）
      //     return false;
      //   }
      if (isGetResponse) {
        // 设置条件过滤多余请求（未登录时使用假数据）
        return false;
      }
      return "/personal/recommends";
      //   return false;
    }, getFetcher);
    console.log("RecommendDataList Data:", data);

    useEffect(() => {
      //   if (userStore.ifLogin) {
      //     // 当数据变化时，更新 recommendList
      //     if (data) {
      //       setRecommendList(data);
      //       setIsGetResponse(true);
      //     }
      //   }
      // 当数据变化时，更新 recommendList
      if (data) {
        setRecommendList(data);
        setIsGetResponse(true);
      }
    }, [data, userStore.ifLogin]);

    // 当获取获取词云图数据失败时，显示错误信息
    useEffect(() => {
      if (error) {
        console.error("Failed to fetch word-cloud data:", error);
        message.error("获取个性推荐列表失败！");
      }
    }, [error]);

    // 显示正在加载的message
    const showLoading = () => {
      messageApi.open({
        type: "loading",
        content: "数据加载中...",
        duration: 0,
      });
      // Dismiss manually and asynchronously
      setTimeout(messageApi.destroy, 2500);
    };

    // 在加载状态下显示 loading 界面
    if (isLoading) {
      // 调用showLoading()函数来显示加载状态
      showLoading();
      return (
        <div className="empty-box">
          {contextHolder}
          <Card
            className="related-links-box"
            style={{ justifyContent: "center" }}
          >
            <div className="related-links-line"></div>
            <div className="related-links-head">
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
            <div className="empty-box">
              <Spin>
                <Skeleton active />
              </Spin>
            </div>
          </Card>
        </div>
      );
    }

    if (!recommendList) {
      return (
        <div className="empty-box">
          <Card
            className="related-links-box"
            style={{ justifyContent: "center" }}
          >
            <div className="related-links-line"></div>
            <div className="related-links-head">
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
            <div className="empty-box">
              <Empty description="暂无数据" />
            </div>
          </Card>
        </div>
      );
    }

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
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                  onClick={() => {
                    navigate(`/detail/${item.id}/${item.type}`, {
                      state: { previousLocation: location.pathname },
                    });
                  }}
                >
                  {index +
                    1 +
                    ". " +
                    (item.title.length > 40
                      ? item.title.substring(0, 40) + "..."
                      : item.title)}
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
