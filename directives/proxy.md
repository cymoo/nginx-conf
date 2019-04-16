# proxy 指令解释

## proxy_pass URL

* 设置后端服务器的协议和地址，还可以设置可选的URI以定义本地路径和后端服务器的映射关系
* 这条指令可以设置的协议是 http 或 https，而地址既可以使用域名或IP加端口（可选）的形式，也可使用 unix domain socket 路径来定义
* 规则
  * 若 proxy_pass 中不包含路径，则请求的路径原样传递给后端 server
  * 若 proxy_pass 中包含路径，则 location 中的路径被 proxy 中对应的路径替换
  * 若 location 使用了正则，proxy_pass最好不要有路径
  * 若在proxy_pass前使用了rewrite，则proxy_pass无效
* 例子

```nginx.conf
# /foo/bar => /foo/bar
location /foo {
    proxy_buffering off;
    proxy_pass http://127.0.0.1:19000;
}

# /bar/foo => //foo
location /bar {
    proxy_pass http://127.0.0.1:19000/;
}

# /fox/foo/bar => /hello/foo/bar
location /fox {
    proxy_pass http://127.0.0.1:19000/hello;
}
```

## proxy_redirect default | off | redirect replacement (default)

* 设置后端服务器 location 响应头和 refresh 响应头的替换文本
* replacement 可以省略服务器名，redirect 和 replacement 可以包含变量
* 指令支持正则表达式：proxy_redirect ~*/user/([^/]+)/(.+)$ http://$1.example.com/$2
* 可同时定义多个 proxy_redirect 指令；off 可使所有相同配置级别的指令失效

## proxy_intercept_errors on | off (off)

* 当后端服务器的响应状态码大于400时，决定是否直接将响应发送给客户端，亦或将响应转发给 nginx 由 error_page 指令来处理

## proxy_cookie_domain domain replacement (off)

* 设置 Set-Cookie 响应头中的 domain 属性的替换文本，与 proxy_redirect 类似

## proxy_cookie_path path replacement (off)

* 设置 Set-Cookie 响应头中的 path 属性的替换文本，与 proxy_redirect 类似

## proxy_set_header field value (Host $proxy_host; Connection Close)

* 允许重新定义或添加发往后端服务器的请求头；value 可以包含文本、变量或二者组合
* $http_host：请求头中若没携带 Host，则传递给后端服务器的请求不包含该头部；$host：若没携带 Host，则传递的是虚拟主机的主域名
* 当且仅当当前配置级别中没有定义proxy_set_header指令时，会从上面的级别继承配置
* 若请求头值为空，则该头不会传给后端服务器

## proxy_hide_header field

* 指令可以设置额外的响应头，这些响应头也不会发送给客户端。
* nginx默认不会将“Date”、“Server”、“X-Pad”，和“X-Accel-...”响应头发送给客户端。

## proxy_pass_header field

* 允许传送被屏蔽的后端服务器响应头到客户端

## proxy_ignore_headers field ...

* 不处理后端服务器返回的指定响应头，比如 Set-Cookie, X-Accel-Limit-Rate等

## proxy_buffering on | off (on)

* 开启或关闭缓冲后端服务器的响应
* 开启缓冲时，nginx 尽可能快地从被代理的服务器接收响应，再讲它存入 proxy_buffer_size 和 proxy_buffers 指令设置的缓冲区中
* 若响应无法整个纳入内存，则其中一部分将存入磁盘上的临时文件中；proxy_max_temp_file_size 和 proxy_temp_file_write_size 可以控制临时文件的写入
* 当关闭缓冲时，收到响应后，nginx 立即将其同步给客户端
* nginx 不会尝试从被代理服务器读取整个请求，而是将 proxy_buffer_size 指令设置的大小作为一次读取的最大长度

## proxy_buffer_size size (4k|8k)

* 设置缓冲区的大小。nginx 从被代理服务器读取响应时，使用该缓冲区保存响应的开始部分，这部分通常包含了一个小小的响应头

## proxy_buffers number size (8 4k|8k)

* 为每个连接设置缓冲区的数量为 number，每块缓冲区的大小为 size。这些缓冲区用于保存从被代理的服务器读取的响应
* 每块缓冲区默认等于一个内存页的大小，该值取决于平台

## proxy_busy_buffers_size size (8k|16k)

* 当开启缓冲响应的功能以后，在没有读到全部响应的情况下，写缓冲到达一定大小时，nginx一定会向客户端发送响应，直到缓冲小于此值。这条指令用来设置此值
* 同时，剩余的缓冲区可以用于接收响应，如果需要，一部分内容将缓冲到临时文件
* 该大小默认是proxy_buffer_size和proxy_buffers指令设置单块缓冲大小的两倍

## proxy_request_buffering on | off (on)

* 若开启，在发送 request 给后端服务器之前，nginx 会读取整个 request body；否则 request body 会立即传送给后端服务器
* 若禁用，如果nginx已经开始发送 request body，则该请求无法传递给 upstream 中配置的其他 server

## proxy_limit_rate rate (0)

* 限制从被代理服务器读取响应的速率，单位为 byte/s
* 对单个请求进行限制，且只会在 buffering 开启的时候才生效

## proxy_cache VS proxy_store

* the 'proxy_store' just stores backend's reponses to a defined path; it's totally up to you, what to do with these files after they were stored
* the 'proxy_cache' alone doesn't do anything. But with other proxy_cache_* directives, you can setup a file cache with key, life time etc.

## proxy_cache zone (off)

* 指定用于页面缓冲的共享内存，同一块共享内存可以在多个地方使用，off参数可以取消从上层继承的缓存功能

## proxy_cache_path path [levels=levels] keys_zone=name:size [inactive=time] [max_size=size] ...

* path: 设置缓存的路径
* levels：缓存的层次结构，最多3个层次，每层取值为1或2
* keys_zone：name，共享内存名称，size，大小，1m 可以存储 8k 个键
* inactive：若在 inactive 时间内缓存的数据没有被获取，则该缓存的数据将被移除，默认为 10min
* max_size：缓存的条目数量，如果超出的该值，将使用 LRU 算法进行移除
* 例子：proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=one:10m;

## proxy_cache_key string ($scheme$proxy_host$request_uri)

* 定义如何生成缓存的键

## proxy_cache_methods GET | HEAD | POST ... (GET HEAD)

* 指定具有哪些请求方法的响应将被缓存，GET 与 HEAD 总是被缓冲，但建议扔显式的指明它们

## proxy_cache_bypass string ...

* 定义 nignx 不从缓存读取响应的条件，如果至少一个字符串条件为空而且非 “0”，nginx 就不会从缓存中取响应
* 例子：proxy_cache_pass $cookie_nocache $arg_nocache$arg_comment
* 例子：proxy_cache_pass $http_pragma $http_authorization

## proxy_no_cache

* 定义 nginx 不将响应写入缓存的条件，如果至少一个字符串条件为空而且非 “0”，nginx 就不将响应写入缓存
* 例子：proxy_no_cache $cookie_nocache $arg_nocache$arg_comment
* 例子：proxy_no_cache $http_pragma $http_authorization

## proxy_cache_valid [code ...] time

* 为不同的响应状态码设置不同的缓存时间
* 比如：proxy_cache_valid 200 302 10m 设置状态码200和302响应的缓冲时间为10分钟
* 如果仅仅指定了 time，proxy_cache_valid 5m 那么只有200，300和302的响应会被缓冲
* 如果使用了 any 参数，那么可以缓存任何响应，proxy_cache_valid any 1m

## proxy_cache_use_stale error | timeout | invalid_header | updating | http_500 | http_502 | http_503 | http_504 | http_403 | http_404 | http_429 | off ... (off)

* 如果后端服务器出现状况，nginx 可以使用过期的响应缓存，指令参数与 proxy_next_upstream相同

## proxy_store on | off | string (off)

* 开启将文件保存到磁盘上的功能，用于创建静态无更改的本地拷贝
* 如果设置为 on，nginx 将文件保存在 alias 指令或 root 指令设置的路径中，如果设置为 off，nginx 将关闭文件保存的功能
* 保存的文件名也可以使用含变量的 string 参数来指定：proxy_store /data/www$original_uri
* 保存文件的修改时间根据接收到的 Last-Modified 响应头来设置，响应是先写到临时文件，然后进行重命名生成的
* 例子

```nginx.conf
server {
    listen 4096;
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
    location /img/ {
        root /home/jie/desktop/playground/nginx/store;
        error_page 404 = @fetch;
    }
    location @fetch {
        internal;
        proxy_pass http://127.0.0.1:3000;
        proxy_store on;
        proxy_store_access user:rw group:rw all:r;
        proxy_temp_path /home/jie/desktop/playground/nginx/tmp;
        root /home/jie/desktop/playground/nginx/store;
    }
}
```

## proxy_store_access users:permissions ... (user:rw)

* 设置新创建的文件和目录的访问权限，比如：proxy_store_access user:rw group:rw all:r

## proxy_next_upstream error | timeout | invalid_header | http_500 | http_502 | http_503 | http_504 | http_404 | off (error timeout)

* 指定在何种情况下一个失败的请求应该被发送到下一台后端服务器
* error：和后端服务器建立连接时，或者向后端服务器发送请求时，或者从后端服务器接收响应头时，出现错误
* timeout：和后端服务器建立连接时，或者向后端服务器发送请求时，或者从后端服务器接收响应头时，出现超时
* 只有在没有向客户端发送任何数据以前，将请求转给下一台后端服务器才是可行的；如果在传输响应到客户端时出现错误或者超时，这类错误是不可能恢复的

## proxy_next_stream_tries number (0)

* 设置重试次数，0表示不限制，注意重试次数指的是所有请求次数（包括第一次和之后的重试次数之和）
* 在 proxy_next_upstream_timeout 时间内允许 proxy_next_upstream_tries 次重试
* 如果超过其中一个设置，则 ningx 也会结束重试并返回客户端响应（可能是错误码）
* 参考
  1. [nginx 重试引发 http 请求重复执行](https://blog.csdn.net/jackpk/article/details/54632468)
  2. [nginx 超时重试机制及潜在的坑](https://www.dutycode.com/nginx_chongshi_chongfuqingqiu.html)
  3. [nginx 的失败重试及重试潜在的坑](http://www.dczou.com/viemall/603.html)

## proxy_connect_timeout time (60s)

* 设置与后端服务器建立连接的超时时间，注意这个时间不应大于 75s

## proxy_send_timeout time (60s)

* 定义向后端服务器传输请求的超时，此超时指相邻两次写操作之间的最长时间间隔，而不是整个请求传输完成的最长时间
* 如果后端服务器在超时时间段内没有接受到任何数据，连接将被关闭

## proxy_read_timeout time (60s)

* 定义从后端服务器读取响应的超时，此超时指相邻两次读操作之间的最长时间间隔，而不是整个响应传输完成的最长时间
* 如果后端服务器在超时时间段内没有传输任何数据，连接将被关闭

## proxy_http_version 1.0 | 1.1 (1.0)

* 设置代理使用的 HTTP 协议版本，默认使用1.0，而1.1则推荐使用 keep-alive 连接时一起使用（见 upstream 模块）

## 变量

* $proxy_host: name and port of a proxied server as specified in the proxy_pass directive
* $proxy_port: port of a proxied server as specified in the proxy_pass directive, or the protocol’s default port
* $proxy_add_x_forwarded_for:
  * the “X-Forwarded-For” client request header field with the $remote_addr variable appended to it, separated by a comma
  * if the “X-Forwarded-For” field is not present in the client request header, the $proxy_add_x_forwarded_for variable is equal to the $remote_addr variable
