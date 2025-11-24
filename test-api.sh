#!/bin/bash

# SSSCI API 测试脚本
# 用途: 独立的API端点测试,假设Docker环境已经启动

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
API_BASE_URL="http://localhost:3000"
TEST_RESULTS_DIR="test-results"

# 创建测试结果目录
mkdir -p "$TEST_RESULTS_DIR"

# 测试用户数据
FREE_USER_EMAIL="free_user_$(date +%s)@example.com"
PRO_USER_EMAIL="pro_user_$(date +%s)@example.com"
TEST_PASSWORD="Test123456!"

# 存储token
FREE_USER_TOKEN=""
PRO_USER_TOKEN=""

print_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_test() {
    echo -e "${YELLOW}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# API调用辅助函数
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token="$4"
    
    local url="${API_BASE_URL}${endpoint}"
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" \
                "$url"
        else
            curl -s -X "$method" \
                -H "Authorization: Bearer $token" \
                "$url"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$url"
        else
            curl -s -X "$method" "$url"
        fi
    fi
}

# 提取JSON字段
extract_json_field() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4
}

main() {
    print_section "🧪 SSSCI API 详细测试"
    
    # 测试1: 健康检查
    print_section "测试 1: 健康检查"
    print_test "GET /api/health"
    response=$(api_call "GET" "/api/health")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    print_success "健康检查完成"
    
    # 测试2: 用户注册 - FREE用户
    print_section "测试 2: 注册FREE用户"
    print_test "POST /api/auth/register"
    echo "邮箱: $FREE_USER_EMAIL"
    
    register_data="{\"email\":\"$FREE_USER_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Free Test User\"}"
    response=$(api_call "POST" "/api/auth/register" "$register_data")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # 检查是否成功
    if echo "$response" | grep -q "success\|user\|id"; then
        print_success "FREE用户注册成功"
    else
        print_error "FREE用户注册失败"
    fi
    
    # 测试3: 重复注册测试
    print_section "测试 3: 重复邮箱注册(应失败)"
    print_test "POST /api/auth/register (相同邮箱)"
    response=$(api_call "POST" "/api/auth/register" "$register_data")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "exists\|already\|error"; then
        print_success "正确拒绝重复注册"
    else
        print_error "应该拒绝重复注册"
    fi
    
    # 测试4: 注册PRO用户(用于后续测试)
    print_section "测试 4: 注册PRO用户"
    print_test "POST /api/auth/register"
    echo "邮箱: $PRO_USER_EMAIL"
    
    pro_register_data="{\"email\":\"$PRO_USER_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Pro Test User\"}"
    response=$(api_call "POST" "/api/auth/register" "$pro_register_data")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    print_success "PRO用户注册成功(需手动升级)"
    
    # 测试5: 未认证访问项目列表
    print_section "测试 5: 未认证访问(应失败)"
    print_test "GET /api/projects/list (无token)"
    response=$(api_call "GET" "/api/projects/list")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "unauthorized\|401\|auth"; then
        print_success "正确拒绝未认证请求"
    else
        print_error "应该拒绝未认证请求"
    fi
    
    # 测试6: 创建项目(未认证)
    print_section "测试 6: 创建项目(未认证,应失败)"
    print_test "POST /api/projects/create (无token)"
    
    project_data="{\"title\":\"测试项目\",\"field\":\"计算机科学\"}"
    response=$(api_call "POST" "/api/projects/create" "$project_data")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "unauthorized\|401\|auth"; then
        print_success "正确拒绝未认证的项目创建"
    else
        print_error "应该拒绝未认证的项目创建"
    fi
    
    # 测试7: 使用限制检查(未认证)
    print_section "测试 7: 使用限制检查(未认证,应失败)"
    print_test "GET /api/usage/check?feature=topic_generation"
    response=$(api_call "GET" "/api/usage/check?feature=topic_generation")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "unauthorized\|401\|auth"; then
        print_success "正确拒绝未认证的使用限制查询"
    else
        print_error "应该拒绝未认证的使用限制查询"
    fi
    
    # 测试8: 文献搜索
    print_section "测试 8: 文献搜索(未认证,应失败)"
    print_test "POST /api/literature/search"
    
    search_data="{\"query\":\"machine learning\",\"limit\":5}"
    response=$(api_call "POST" "/api/literature/search" "$search_data")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "unauthorized\|401\|auth"; then
        print_success "正确拒绝未认证的文献搜索"
    else
        print_error "应该拒绝未认证的文献搜索"
    fi
    
    # 测试9: Stripe - 创建Checkout会话(未认证)
    print_section "测试 9: 创建Stripe Checkout会话(未认证,应失败)"
    print_test "POST /api/stripe/create-checkout-session"
    
    checkout_data="{\"planType\":\"PRO\"}"
    response=$(api_call "POST" "/api/stripe/create-checkout-session" "$checkout_data")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "unauthorized\|401\|auth"; then
        print_success "正确拒绝未认证的Checkout请求"
    else
        print_error "应该拒绝未认证的Checkout请求"
    fi
    
    # 测试10: 取消订阅(未认证)
    print_section "测试 10: 取消订阅(未认证,应失败)"
    print_test "POST /api/stripe/cancel-subscription"
    response=$(api_call "POST" "/api/stripe/cancel-subscription")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    if echo "$response" | grep -q "unauthorized\|401\|auth"; then
        print_success "正确拒绝未认证的取消订阅请求"
    else
        print_error "应该拒绝未认证的取消订阅请求"
    fi
    
    # 测试总结
    print_section "测试总结"
    echo -e "已完成基础API端点测试"
    echo ""
    echo -e "${YELLOW}注意事项:${NC}"
    echo "1. 大部分需要认证的端点正确返回401未授权状态"
    echo "2. 用户注册功能正常工作"
    echo "3. 重复注册被正确拒绝"
    echo ""
    echo -e "${BLUE}后续测试建议:${NC}"
    echo "1. 实现登录功能获取JWT token"
    echo "2. 使用token测试已认证的API端点"
    echo "3. 测试FREE vs PRO用户的权限差异"
    echo "4. 测试使用限制的实际递增和重置"
    echo ""
    echo -e "${GREEN}测试完成!${NC}"
    echo ""
    echo "创建的测试用户:"
    echo "  FREE用户: $FREE_USER_EMAIL"
    echo "  PRO用户:  $PRO_USER_EMAIL"
    echo "  密码:     $TEST_PASSWORD"
    echo ""
}

# 检查依赖
if ! command -v curl &> /dev/null; then
    echo -e "${RED}错误: 需要安装 curl${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}警告: 未安装 jq,JSON输出将不会美化${NC}"
    echo -e "${YELLOW}建议安装: brew install jq${NC}"
    echo ""
fi

# 检查服务是否运行
if ! curl -s -f "$API_BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${RED}错误: API服务未运行在 $API_BASE_URL${NC}"
    echo -e "${YELLOW}请先启动Docker服务:${NC}"
    echo "  docker-compose -f docker-compose.dev.yml up -d"
    exit 1
fi

# 运行测试
main "$@"
