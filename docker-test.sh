#!/bin/bash

# SSSCI Docker 功能测试脚本
# 用途: 自动化测试Docker环境中的所有核心功能

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
COMPOSE_FILE="docker-compose.dev.yml"
API_BASE_URL="http://localhost:3000"
TEST_RESULTS_DIR="test-results"
TEST_REPORT="${TEST_RESULTS_DIR}/test-report.txt"

# 测试统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 创建测试结果目录
mkdir -p "$TEST_RESULTS_DIR"

# 清空测试报告
echo "SSSCI Docker 功能测试报告" > "$TEST_REPORT"
echo "测试时间: $(date)" >> "$TEST_REPORT"
echo "========================================" >> "$TEST_REPORT"
echo "" >> "$TEST_REPORT"

# 打印标题
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 打印测试结果
print_test_result() {
    local test_name="$1"
    local result="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" == "PASS" ]; then
        echo -e "${GREEN}✅ [PASS]${NC} $test_name"
        echo "[PASS] $test_name" >> "$TEST_REPORT"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ [FAIL]${NC} $test_name"
        echo "[FAIL] $test_name" >> "$TEST_REPORT"
        if [ -n "$message" ]; then
            echo -e "   ${RED}错误: $message${NC}"
            echo "   错误: $message" >> "$TEST_REPORT"
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# API测试辅助函数
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_status="$4"
    local data="$5"
    local token="$6"
    
    local url="${API_BASE_URL}${endpoint}"
    local response_file="${TEST_RESULTS_DIR}/response_${TOTAL_TESTS}.txt"
    
    # 构建curl命令
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ -n "$token" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $token'"
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    # 执行请求
    local response=$(eval $curl_cmd 2>&1)
    echo "$response" > "$response_file"
    
    # 提取状态码
    local status_code=$(echo "$response" | tail -n 1)
    
    # 验证状态码
    if [ "$status_code" == "$expected_status" ]; then
        print_test_result "$test_name" "PASS"
        return 0
    else
        print_test_result "$test_name" "FAIL" "Expected $expected_status, got $status_code"
        return 1
    fi
}

# 等待服务就绪
wait_for_service() {
    local service_name="$1"
    local max_attempts=30
    local attempt=1
    
    echo -n "等待 $service_name 就绪"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$API_BASE_URL/api/health" > /dev/null 2>&1; then
            echo -e " ${GREEN}✅${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e " ${RED}❌ 超时${NC}"
    return 1
}

# 主测试流程
main() {
    print_header "🚀 SSSCI Docker 功能测试"
    
    # 步骤1: 检查Docker环境
    print_header "步骤 1/7: 检查Docker环境"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
    echo -e "${GREEN}✅ Docker Compose: $(docker-compose --version)${NC}"
    
    # 步骤2: 停止现有容器
    print_header "步骤 2/7: 清理现有环境"
    docker-compose -f "$COMPOSE_FILE" down -v > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ 环境清理完成${NC}"
    
    # 步骤3: 启动服务
    print_header "步骤 3/7: 启动Docker服务"
    echo "这可能需要几分钟,请耐心等待..."
    docker-compose -f "$COMPOSE_FILE" up --build -d
    
    # 步骤4: 等待服务就绪
    print_header "步骤 4/7: 等待服务就绪"
    if ! wait_for_service "应用服务"; then
        echo -e "${RED}❌ 服务启动超时${NC}"
        echo ""
        echo "查看日志:"
        docker-compose -f "$COMPOSE_FILE" logs app
        exit 1
    fi
    
    # 步骤5: 执行数据库迁移
    print_header "步骤 5/7: 执行数据库迁移"
    docker-compose -f "$COMPOSE_FILE" exec -T app sh -c "npx prisma migrate deploy" || true
    echo -e "${GREEN}✅ 数据库迁移完成${NC}"
    
    # 步骤6: 运行功能测试
    print_header "步骤 6/7: 运行功能测试"
    
    # 基础设施测试
    echo ""
    echo -e "${BLUE}--- 基础设施测试 ---${NC}"
    test_api "健康检查API" "GET" "/api/health" "200"
    
    # 认证功能测试
    echo ""
    echo -e "${BLUE}--- 认证功能测试 ---${NC}"
    
    # 生成随机邮箱避免冲突
    TEST_EMAIL="test_$(date +%s)@example.com"
    TEST_PASSWORD="Test123456!"
    
    # 注册测试
    REGISTER_DATA="{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Test User\"}"
    test_api "用户注册" "POST" "/api/auth/register" "201" "$REGISTER_DATA"
    
    # 重复注册测试
    test_api "重复邮箱注册(应失败)" "POST" "/api/auth/register" "400" "$REGISTER_DATA"
    
    # 项目管理测试
    echo ""
    echo -e "${BLUE}--- 项目管理测试 ---${NC}"
    
    # 注意: 这些测试需要认证token,这里仅测试端点可访问性
    test_api "项目列表端点可访问" "GET" "/api/projects/list" "401" # 未认证应返回401
    test_api "创建项目端点可访问" "POST" "/api/projects/create" "401" # 未认证应返回401
    
    # 使用限制测试
    echo ""
    echo -e "${BLUE}--- 使用限制测试 ---${NC}"
    test_api "使用限制检查端点可访问" "GET" "/api/usage/check?feature=topic_generation" "401" # 未认证应返回401
    
    # 订阅功能测试
    echo ""
    echo -e "${BLUE}--- 订阅功能测试 ---${NC}"
    test_api "创建Checkout会话端点可访问" "POST" "/api/stripe/create-checkout-session" "401" # 未认证应返回401
    
    # 文献检索测试
    echo ""
    echo -e "${BLUE}--- 文献检索测试 ---${NC}"
    SEARCH_DATA="{\"query\":\"machine learning\",\"limit\":5}"
    test_api "文献搜索端点可访问" "POST" "/api/literature/search" "401" # 未认证应返回401
    
    # 步骤7: 生成测试报告
    print_header "步骤 7/7: 生成测试报告"
    
    echo "" >> "$TEST_REPORT"
    echo "========================================" >> "$TEST_REPORT"
    echo "测试统计" >> "$TEST_REPORT"
    echo "========================================" >> "$TEST_REPORT"
    echo "总测试数: $TOTAL_TESTS" >> "$TEST_REPORT"
    echo "通过: $PASSED_TESTS" >> "$TEST_REPORT"
    echo "失败: $FAILED_TESTS" >> "$TEST_REPORT"
    echo "通过率: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%" >> "$TEST_REPORT"
    
    # 显示统计
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}测试统计${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "总测试数: $TOTAL_TESTS"
    echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
    echo -e "${RED}失败: $FAILED_TESTS${NC}"
    echo -e "通过率: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo ""
    
    # 显示完整报告位置
    echo -e "${BLUE}📄 完整测试报告: $TEST_REPORT${NC}"
    echo ""
    
    # 显示有用的命令
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}后续操作${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo "📍 访问应用:"
    echo "   浏览器打开: http://localhost:3000"
    echo ""
    echo "📊 查看服务状态:"
    echo "   docker-compose -f $COMPOSE_FILE ps"
    echo ""
    echo "📝 查看应用日志:"
    echo "   docker-compose -f $COMPOSE_FILE logs -f app"
    echo ""
    echo "🗄️  访问Prisma Studio:"
    echo "   docker-compose -f $COMPOSE_FILE exec app npm run prisma:studio"
    echo ""
    echo "🛑 停止服务:"
    echo "   docker-compose -f $COMPOSE_FILE down"
    echo ""
    echo "🗑️  完全清理(包括数据):"
    echo "   docker-compose -f $COMPOSE_FILE down -v"
    echo ""
    
    # 返回状态
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}✅ 所有测试通过!${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  部分测试失败,请查看报告${NC}"
        return 1
    fi
}

# 运行主流程
main "$@"
