# 负载均衡指令介绍

## upstream name { ... }

* 定义一组服务器，这些服务器可以监听不同的端口
* 默认情况下，nginx 按加权轮转（round-robin）的方式将请求分发到各服务器
* 以下例子中，每7个请求会通过以下方式分发：5个分给 backend.foo.com，剩下2个分别分给第二和第三个服务器；如果在与服务器通讯的过程中发生错误，请求将重新分发给下一个服务器，直到所有可用的服务器均被尝试；如果所有的服务器均无法正常响应，请求将分发给最后一个备用服务器

```nginx.conf
upstream backend {
    server backend.foo.com weight=5;
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server unix:/tmp/backend;
    server backup.foo.com backup;
}
```

## server address [parameters]

* 定义服务器的地址 address 和其他参数 parameters
* 地址可以是域名或者IP地址，端口是可选的，或者是指定“unix:”前缀的UNIX域套接字的路径
* 如果没有指定端口，就使用80端口，如果一个域名解析到多个 IP，本质上是定义了多个server

可用定义以下的参数

### weight=number

* 设定服务器的权重，默认是1

### max_fails=number

* 设定 nginx 与服务器通信的尝试失败的次数，在 fail_timeout 参数定义的时间段内，如果失败的次数达到此值，nginx 就认为服务器不可用
* 在下一个 fail_timeout 时间段，服务器不会再被尝试；失败的尝试次数默认是1；设为0就会停止统计尝试次数，认为服务器是一直可用的
* 可以通过指令 [proxy_next_upstream](./proxy.md#proxy_next_upstream-error--timeout--invalid_header--http_500--http_502--http_503--http_504--http_404--off-error-timeout) 等来配置什么是失败的尝试。 默认配置时，http_404 状态不被认为是失败的尝试。

### fail_timeout=time

* 统计失败尝试次数的时间段，在这段时间中，服务器失败次数达到指定的尝试次数，服务器就被认为不可用
* 默认情况下，该超时时间为 10s

### backup

* 标记为备用服务器，当主服务器不可用以后，请求会被传给这些服务器

### down

* 标记服务器永久不可用，可以跟 ip_hash  指令一起使用

## ip_hash

* 指定服务器组的负载均衡方法，请求基于客户端的IP地址在服务器间进行分发
* 这种方法可以确保从同一个客户端过来的请求，会被传给同一台服务器，除了当服务器被认为不可用的时候，这些客户端的请求会被传给其他服务器，而且很有可能也是同一台服务器

## leat_conn

* 指定服务器组的负载均衡方法，根据其权重值，将请求发送到活跃连接数最少的那台服务器
* 如果这样的服务器有多台，那就采取有权重的轮转法进行尝试
