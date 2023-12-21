package team.semg04.themirroroflaw.ai;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.gson.Gson;
import lombok.Data;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class SparkModelConnector extends WebSocketListener {
    // 地址与鉴权信息  https://spark-api.xf-yun.com/v1.1/chat   1.5地址  domain参数为general
    // 地址与鉴权信息  https://spark-api.xf-yun.com/v2.1/chat   2.0地址  domain参数为generalv2
    public static final String hostUrl = "https://spark-api.xf-yun.com/v3.1/chat";
    public static String appid;
    public static String apiSecret;
    public static String apiKey;
    public static String totalAnswer=""; // 大模型的答案汇总
    public static  String NewQuestion = "";
    public static final Gson gson = new Gson();
    private Boolean wsCloseFlag;
    private static volatile Boolean totalFlag=true; // 控制提示用户是否输入
    // 构造函数
    public SparkModelConnector() {
        // 个性化参数
        this.wsCloseFlag = false;
    }

    @Value("${spark-model.appid}")
    private void setAppid(String appid_) {
        SparkModelConnector.appid = appid_;
    }

    @Value("${spark-model.apiSecret}")
    private void setApiSecret(String apiSecret_) {
        SparkModelConnector.apiSecret = apiSecret_;
    }

    @Value("${spark-model.apiKey}")
    private void setApiKey(String apiKey_) {
        SparkModelConnector.apiKey = apiKey_;
    }

    public static String getAnswer(String question) throws Exception {
        if(totalFlag){
            totalFlag=false;
            NewQuestion= question;
            // 构建鉴权url
            String authUrl = getAuthUrl(hostUrl, apiKey, apiSecret);
            OkHttpClient client = new OkHttpClient.Builder().build();
            String url = authUrl.replace("http://", "ws://").replace("https://", "wss://");
            Request request = new Request.Builder().url(url).build();
                totalAnswer="";
                WebSocket webSocket = client.newWebSocket(request, new SparkModelConnector());
        }else{
            Thread.sleep(200);
        }
        while (!totalFlag) {
            Thread.onSpinWait();
        }
        return totalAnswer;
    }

    // 线程来发送音频与参数
    class MyThread extends Thread {
        private final WebSocket webSocket;

        public MyThread(WebSocket webSocket) {
            this.webSocket = webSocket;
        }

        public void run() {
            try {
                JSONObject requestJson=new JSONObject();

                JSONObject header=new JSONObject();  // header参数
                header.put("app_id",appid);
                header.put("uid",UUID.randomUUID().toString().substring(0, 10));

                JSONObject parameter=new JSONObject(); // parameter参数
                JSONObject chat=new JSONObject();
                chat.put("domain","generalv3");
                chat.put("temperature",0.5);
                chat.put("max_tokens",4096);
                parameter.put("chat",chat);

                JSONObject payload=new JSONObject(); // payload参数
                JSONObject message=new JSONObject();
                JSONArray text=new JSONArray();

                // 历史问题获取
//                if(historyList.size()>0){
//                    for(RoleContent tempRoleContent:historyList){
//                        text.add(JSON.toJSON(tempRoleContent));
//                    }
//                }

                // 最新问题
                RoleContent roleContent= new RoleContent();
                roleContent.role="user";
                roleContent.content=NewQuestion;
                text.add(JSON.toJSON(roleContent));


                message.put("text",text);
                payload.put("message",message);


                requestJson.put("header",header);
                requestJson.put("parameter",parameter);
                requestJson.put("payload",payload);
                 // System.err.println(requestJson); // 可以打印看每次的传参明细
                webSocket.send(requestJson.toString());
                // 等待服务端返回完毕后关闭
                do {
                    // System.err.println(wsCloseFlag + "---");
                    Thread.sleep(200);
                } while (!wsCloseFlag);
                webSocket.close(1000, "");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onOpen(WebSocket webSocket, Response response) {
        super.onOpen(webSocket, response);
        MyThread myThread = new MyThread(webSocket);
        myThread.start();
    }

    @Override
    public void onMessage(WebSocket webSocket, String text) {
        // System.out.println(userId + "用来区分那个用户的结果" + text);
        JsonParse myJsonParse = gson.fromJson(text, JsonParse.class);
        if (myJsonParse.header.code != 0) {
            System.out.println("发生错误，错误码为：" + myJsonParse.header.code);
            System.out.println("本次请求的sid为：" + myJsonParse.header.sid);
            webSocket.close(1000, "");
        }
        List<Text> textList = myJsonParse.payload.choices.text;
        for (Text temp : textList) {
//            System.out.print(temp.content);
            totalAnswer=totalAnswer+temp.content;
        }
        if (myJsonParse.header.status == 2) {
            // 可以关闭连接，释放资源
            wsCloseFlag = true;
            totalFlag=true;
        }
    }

    @Override
    public void onFailure(WebSocket webSocket, Throwable t, Response response) {
        super.onFailure(webSocket, t, response);
        try {
            if (null != response) {
                int code = response.code();
                System.out.println("onFailure code:" + code);
                System.out.println("onFailure body:" + response.body().string());
                if (101 != code) {
                    System.out.println("connection failed");
                    System.exit(0);
                }
            }
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }


    // 鉴权方法
    public static String getAuthUrl(String hostUrl, String apiKey, String apiSecret) throws Exception {
        URL url = new URL(hostUrl);
        // 时间
        SimpleDateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
        format.setTimeZone(TimeZone.getTimeZone("GMT"));
        String date = format.format(new Date());
        // 拼接
        String preStr = "host: " + url.getHost() + "\n" +
                "date: " + date + "\n" +
                "GET " + url.getPath() + " HTTP/1.1";
        // System.err.println(preStr);
        // SHA256加密
        Mac mac = Mac.getInstance("hmacsha256");
        SecretKeySpec spec = new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "hmacsha256");
        mac.init(spec);

        byte[] hexDigits = mac.doFinal(preStr.getBytes(StandardCharsets.UTF_8));
        // Base64加密
        String sha = Base64.getEncoder().encodeToString(hexDigits);
        // System.err.println(sha);
        // 拼接
        String authorization = String.format("api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"", apiKey, "hmac-sha256", "host date request-line", sha);
        // 拼接地址
        HttpUrl httpUrl = Objects.requireNonNull(HttpUrl.parse("https://" + url.getHost() + url.getPath())).newBuilder().//
                addQueryParameter("authorization", Base64.getEncoder().encodeToString(authorization.getBytes(StandardCharsets.UTF_8))).//
                addQueryParameter("date", date).//
                addQueryParameter("host", url.getHost()).//
                build();

        // System.err.println(httpUrl.toString());
        return httpUrl.toString();
    }

    //返回的json结果拆解
    @Data
    static class JsonParse {
        Header header;
        Payload payload;
    }

    @Data
    static class Header {
        int code;
        int status;
        String sid;
    }

    @Data
    static class Payload {
        Choices choices;
    }

    @Data
    static class Choices {
        List<Text> text;
    }

    @Data
    static class Text {
        String role;
        String content;
    }

    @Data
    static class RoleContent{
        String role;
        String content;
    }
}