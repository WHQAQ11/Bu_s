-- 完整数据库架构（阶段2更新）
-- =====================================

-- 创建用户表
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户统计表
CREATE TABLE user_stats (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  total_divinations INTEGER DEFAULT 0,
  liuyao_count INTEGER DEFAULT 0,
  meihua_count INTEGER DEFAULT 0,
  ai_count INTEGER DEFAULT 0,
  last_divination_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建卦象数据表
CREATE TABLE hexagrams (
  id SERIAL PRIMARY KEY,
  hexagram_key TEXT UNIQUE NOT NULL,     -- 6位二进制字符串
  name TEXT NOT NULL,
  pinyin TEXT,
  number INTEGER NOT NULL,
  guaci_original TEXT,
  guaci_translation TEXT,
  guaci_interpretation TEXT,
  yaoci JSONB,                           -- 爻辞数组
  structure JSONB,                       -- 卦象结构
  source JSONB,                          -- 出处信息
  references JSONB,                      -- 古籍引用
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建占卜记录表（阶段2增强版）
CREATE TABLE divination_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('liuyao', 'meihua', 'ai')),
  question TEXT NOT NULL,
  category TEXT,
  original_hexagram TEXT NOT NULL,
  transformed_hexagram TEXT,
  changing_indexes INTEGER[],
  ben_gua_info JSONB,
  bian_gua_info JSONB,
  ai_interpretation TEXT,
  interpretation_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  ai_request_data JSONB,                  -- AI请求参数
  ai_response_data JSONB,                 -- AI响应数据
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_divination_logs_user_id ON divination_logs(user_id);
CREATE INDEX idx_divination_logs_created_at ON divination_logs(created_at);
CREATE INDEX idx_divination_logs_method ON divination_logs(method);
CREATE INDEX idx_divination_logs_status ON divination_logs(interpretation_status);
CREATE INDEX idx_hexagrams_key ON hexagrams(hexagram_key);
CREATE INDEX idx_hexagrams_name ON hexagrams(name);
CREATE INDEX idx_hexagrams_number ON hexagrams(number);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE divination_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hexagrams ENABLE ROW LEVEL SECURITY;

-- 用户表RLS策略
CREATE POLICY "用户可以查看自己的信息" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的信息" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 用户统计表RLS策略
CREATE POLICY "用户可以查看自己的统计" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的统计" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 占卜记录表RLS策略
CREATE POLICY "用户可以查看自己的占卜记录" ON divination_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的占卜记录" ON divination_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的占卜记录" ON divination_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的占卜记录" ON divination_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 卦象表RLS策略（所有人可读，只有管理员可写）
CREATE POLICY "所有人可以查看卦象信息" ON hexagrams
  FOR SELECT USING (true);

CREATE POLICY "只有管理员可以修改卦象信息" ON hexagrams
  FOR ALL USING (
    -- 这里需要添加管理员检查逻辑
    -- 暂时允许所有认证用户
    auth.role() = 'authenticated'
  );

-- 创建触发器函数：新用户注册时自动创建用户记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);

  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divination_logs_updated_at
  BEFORE UPDATE ON divination_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hexagrams_updated_at
  BEFORE UPDATE ON hexagrams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 创建占卜记录更新统计的触发器函数
CREATE OR REPLACE FUNCTION public.update_divination_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新用户统计信息
  INSERT INTO public.user_stats (user_id, total_divinations, last_divination_date)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_divinations = public.user_stats.total_divinations + 1,
    last_divination_date = NOW(),
    updated_at = NOW();

  -- 根据方法更新对应计数
  IF NEW.method = 'liuyao' THEN
    UPDATE public.user_stats
    SET liuyao_count = liuyao_count + 1, updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.method = 'meihua' THEN
    UPDATE public.user_stats
    SET meihua_count = meihua_count + 1, updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.method = 'ai' THEN
    UPDATE public.user_stats
    SET ai_count = ai_count + 1, updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建占卜记录统计触发器
CREATE TRIGGER update_stats_on_divination
  AFTER INSERT ON divination_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_divination_stats();