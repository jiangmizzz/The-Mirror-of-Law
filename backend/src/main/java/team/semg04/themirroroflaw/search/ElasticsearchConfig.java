package team.semg04.themirroroflaw.search;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;

import javax.annotation.Nonnull;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

@Slf4j
@Configuration
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Value("${spring.elasticsearch.uris}")
    private String elasticsearchHost;

    @Value("${spring.elasticsearch.username}")
    private String elasticsearchUsername;

    @Value("${spring.elasticsearch.password}")
    private String elasticsearchPassword;

    @Override
    @Nonnull
    public ClientConfiguration clientConfiguration() {
        try {
            log.info("Elasticsearch host: " + elasticsearchHost);

            // 绕过证书有效性验证和主机名验证 FIXME: This is a security risk!
            // 这破证书啥都不匹配 烦死了
            SSLContext sslContext = createIgnoreSSLContext();
            HostnameVerifier hostnameVerifier = (hostname, session) -> true;

            return ClientConfiguration.builder()
                    .connectedTo(elasticsearchHost)
                    .usingSsl(sslContext, hostnameVerifier)
                    .withBasicAuth(elasticsearchUsername, elasticsearchPassword)
                    .build();
        } catch (Exception e) {
            log.error("Error while creating Elasticsearch client configuration", e);
            throw new RuntimeException(e);
        }
    }

    private SSLContext createIgnoreSSLContext() throws NoSuchAlgorithmException, KeyManagementException {
        SSLContext sslContext = SSLContext.getInstance("TLS");

        // 创建一个X509TrustManager，用于信任所有证书，绕过证书有效性检查
        X509TrustManager trustManager = new X509TrustManager() {
            @Override
            public void checkClientTrusted(X509Certificate[] x509Certificates, String s) {
            }

            @Override
            public void checkServerTrusted(X509Certificate[] x509Certificates, String s) {
            }

            @Override
            public X509Certificate[] getAcceptedIssuers() {
                return new X509Certificate[0];
            }
        };

        sslContext.init(null, new TrustManager[]{trustManager}, null);
        return sslContext;
    }
}