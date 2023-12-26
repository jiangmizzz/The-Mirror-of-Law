from selenium import webdriver #4.15.2
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from elasticsearch import Elasticsearch # 8.11.0
import warnings  
import time

warnings.filterwarnings("ignore")

class OpinionCrawler():
    def __init__(self):
        options = webdriver.ChromeOptions()
        options.add_experimental_option(
            'excludeSwitches', ['enable-logging'])
        # 创建 WebDriver 对象，指明使用chrome浏览器驱动
        self.browser = webdriver.Chrome(service=Service('./chromedriver.exe'), options=options)
        self.browser.set_page_load_timeout(1)
        self.browser.maximize_window()
        self.wait = WebDriverWait(self.browser, 1)

    def getListUrl(self, num):
        return f"https://www.fayuan.cn/guandian/list{num}.html"

    def crawl(self, startPage, endPage):
        for i in range(startPage, endPage):
            listUrl = self.getListUrl(i)
            try:
                self.browser.get(listUrl)
            except:
                self.handleAntiCrawler()
                self.browser.get(listUrl)
            linkElements = self.wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, 'l-news--item')))
            for linkElement in linkElements:
                title = linkElement.find_element(By.CLASS_NAME, 'l-news--title').text
                info = linkElement.find_element(By.CLASS_NAME, 'l-news--info').text.split('\n')
                url = linkElement.find_element(By.TAG_NAME, 'a').get_attribute('href')
                author = info[0]
                source = info[1]
                date = info[2]
                self.browser.execute_script("arguments[0].scrollIntoView();", linkElement)
                time.sleep(1)
                linkElement.find_element(By.TAG_NAME, 'a').click()
                handles = self.browser.window_handles
                self.browser.switch_to.window(handles[1])
                try:
                    content = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'wen_box'))).text
                except:    
                    self.handleAntiCrawler()
                    content = self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'wen_box'))).text
                time.sleep(1)
                self.browser.close()
                self.browser.switch_to.window(handles[0])
                opinionDocument = OpinionDocument(title=title, author=author, source=source, date=date, url=url, content=content)
                opinionDocument.index()

    def handleAntiCrawler(self):
        try:
            btn = self.browser.find_element(By.CLASS_NAME, 'geetest_btn_click')
            btn.click()
            time.sleep(1)
        except:
            return            

class OpinionDocument():
    def __init__(self, title, author, source, date, url, content):
        self.title = title
        self.author = author
        self.source = source
        self.date = date 
        self.url = url
        self.type = 2
        self.content = content
        self.like = 0
        self.dislike = 0
    
    def index(self):
        document = vars(self)
        try:
            es.index(index=index, document=document, id=self.url.split('/')[-1].split('.')[0])
            pass
        except:
            return
        
if __name__ == "__main__":
    es = Elasticsearch("https://ES服务器ip:9200",http_auth=('ES用户名', 'ES密码'), timeout=20, verify_certs=False)
    index = 'opinions'
    crawler = OpinionCrawler()
    crawler.crawl(42, 100)
