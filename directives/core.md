# 顶级指令介绍

## pid file (nginx.pid)

* 存储主进程 id 的 file

## use method

* 指定使用的连接处理的方式（epoll, kqueue, ...），通常不需要明确设置，nginx 默认使用最高效的方法

## user user group (nobody nobody)

* 定义工作进程使用的 user 和 group 身份，如果省略 group，nginx 会使用与 user 相同的组名

## error_log file | stderr debug | info | notice | warn | error | crit | alert | emerg

* 第一个参数定义了存放日志的文件，如果设置为特殊的 stderr，nginx 会将日志输出到标准错误
* 第二个参数定了日志级别，按照严重性从轻到重列出
* 设置为某个日志级别会将指定级别和更好级别的日志记录下来，nginx 默认使用 error 级别

## access_log path [format [buffer=size] [gzip[=level]] [flush=time] [if=condition]] | off (access_log logs/access.log combined)

* 该指令位于 ngx_http_log_module 模块中，按照指定的格式写入访问日志，如果没有指定格式，则使用预定义的格式 combined
* 如果使用了 buffer (64K) 或 gzip (1)，写日志将先被缓冲，缓冲区的大小不能超过磁盘文件原子性写入的大小（多少？）
* 日志文件的路径可以包含变量，具体注意事项见 <http://nginx.org/en/docs/http/ngx_http_log_module.html>
* if 参数可以激活条件日志，如果 condition 为 "" 或 "0"，日志就不会被记录，如下：

```nginx.conf
map $status $loggable {
    ~^[23]  0;
    default 1;
}
access_log /path/to/access.log combined if=$loggable;
```

## log_format name [escape=default|json|none] string .. (log_format combined "...")

* 指定日志格式，日志格式允许包含普通变量和只在日志写入时存在的变量，日志变量参考 <http://nginx.org/en/docs/http/ngx_http_log_module.html#log_format>

## worker_processes number | auto (1)

* 定义工作进程的数量

## worker_connections number (512)

* 设置每个工作进程可以打开的最大并发连接数
* 这个数量包含所有连接，比如与后端服务器建立的连接等，而不仅仅是和客户端的连接
* 实际的并发连接数是不能超过打开文件的最大数量限制的，这个可以用 worker_rlimit_nofile 指令修改

## woker_rlimit_nofile number

* 修改工作进程的打开文件的最大值限制（RLIMIT_NOFILE），用于在不重启主进程的情况下增大该限制

## multi_accept on | off (off)

* 关闭时，工作进程一次只会接受一个新连接，否则，工作进程一次会将所有新连接全部接入

## include file | mask

* 将另一个 file，或者匹配指定的 mask 的文件，包含在配置中

## load_module file

* 加载一个动态模块
