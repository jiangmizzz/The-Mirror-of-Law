国家法律法规数据库爬虫，需要windows环境，因为涉及了Microsoft Word的格式转换。

安装的python库需要保证elasticsearch==8.11.0，Pillow==9.5.0（其他版本可能也行，适配ddddocr即可）

修改LawCrawler中的host ip以及username和password，设置爬取的类别与页数，即可运行爬取，理论上能绕开包括wzws challenge、验证码在内的所有反爬手段。



