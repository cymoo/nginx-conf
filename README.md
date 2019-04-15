# Nginx指南

## 基本操作

* 测试配置文件：nginx -t

* 关闭 nginx：nginx -s stop

* 重启 nginx：nginx -s reload

* 重新打开日志：nginx -s reopen

## 常见指令

* [location](./directives/http.md)

* [rewrite](./directives/rewrite.md)

* [try_files](./directives/http.md)

* [alias](./directives/http.md)

* [proxy_pass](./directives/proxy.md)

* [log](./directives/core.md)

* [upstream](./directives/upstream.md)

## 常见配置

* [anti-host-spoofing](./no_spoof.conf)

* [目录服务](./files.conf)

* [反向代理](./proxy.conf)

* [负载均衡](./load_balance.conf)

* [单页面（SPA）](./spa.conf)

## 性能优化

* [nginx高并发下的优化](https://segmentfault.com/a/1190000011405320)

* [optimizing nginx for high traffic loads](http://blog.martinfjordvald.com/2011/04/optimizing-nginx-for-high-traffic-loads/)

* [nginx负载均衡高可用](http://www.uml.org.cn/zjjs/201808214.asp)

## 其他

* [nginx基本知识汇总](https://zhuanlan.zhihu.com/p/62264210)
