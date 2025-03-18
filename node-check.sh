#!/bin/bash

# 定义红色的ANSI转义序列
RED='\033[0;31m'

# 定义重置颜色的ANSI转义序列
NC='\033[0m' # No Color

# 获取当前的Node.js版本
current_version=$(node -v)

# 去掉版本号中的前缀"v"
current_version=${current_version#v}

# 设定最低版本
required_version="18.19.0"

# 比较版本号
if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo  "${RED}Node.js 版本小于 $required_version,脚本退出。${NC}"
    exit 1
else
    exit 0
fi



#  "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" 

# 解析：
# printf '%s\n' "$required_version" "$current_version"：
# printf 是一个格式化输出命令。
# '%s\n' 格式字符串表示每个参数输出为字符串并换行。
# "$required_version" 和 "$current_version" 是两个版本号变量。
# 这行命令会将两个版本号逐行输出。例如，如果 required_version 是 19.18.0 和 current_version 是 19.17.0，输出将是：
# 19.18.0
# 19.17.0


# | sort -V：
# | 是管道符，用于将前一个命令的输出传递给下一个命令。
# sort 是一个排序命令。
# -V 选项用于版本号排序。它会根据版本号的自然顺序进行排序，而不是按字典顺序。
# 对于上面的输出，sort -V 会将其排序为：
# 19.17.0
# 19.18.0

# | head -n1：
# head 命令用于输出文件的开头部分。
# -n1 选项表示只输出第一行。
# 在排序后的结果中，head -n1 会输出 19.17.0。
# [ ... != "$required_version" ]：
# [ 和 ] 是 Shell 中的条件测试符号，等价于 test 命令。
# != 是不等于运算符。
# 这部分代码比较 head -n1 的输出（即排序后的第一个版本号）和 "$required_version"。
# 如果排序后的第一个版本号不等于 required_version，说明 current_version 小于 required_version。

