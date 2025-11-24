// 共享的Session User类型定义
export interface SessionUser {
    id?: string;
    email?: string;
    name?: string | null;
    image?: string | null;
    role?: string;
}
