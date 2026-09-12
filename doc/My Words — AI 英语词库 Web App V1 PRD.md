# My Words — AI 英语词库 Web App V1 PRD

## 1. 产品目标

My Words 是一个基于 AI 的个人英语记忆系统。

它不提供固定 CET-4、雅思、托福等词书，而是帮助用户把自己在工作、阅读、新闻、邮件、AI 对话中真正遇到的英语内容沉淀下来，并通过 AI 理解、发音和间隔重复逐渐掌握。

V1 的核心闭环只有：

**遇到英语 → 添加 → AI 制卡 → 保存 → 听 → 复习 → 记住**

---

# 2. V1 成功标准

V1 上线以后，用户应该能够完成：

1. 输入一个英语单词或短语。
2. AI 自动生成学习卡。
3. 保存到个人词库。
4. 查看核心含义、搭配和例句。
5. 点击播放单词和例句。
6. 每天看到待复习单词。
7. 使用 Again / Hard / Good / Easy 完成复习。
8. 手机和电脑均可正常使用。
9. 手机可以添加至桌面。

除此之外的功能都不是 V1 必需功能。

---

# 3. V1 页面结构

底部固定 5 个 Tab：

```text
Today    Words     +     Review     Me
```

页面关系：

```text
                ┌── Word Detail
                │
Today ──────────┤
                │
Words ──────────┘

+ Add
  │
  └── AI Generate
          │
          └── Word Detail

Review
  │
  └── Review Card

Me
```

---

# 4. 页面一：Today

## 页面目标

用户打开 App 后，不需要思考今天做什么。

## 页面原型

```text
────────────────────────

Good evening 👋

Today

┌─────────────────────┐
│ 12 words to review  │
│                     │
│   Start Review →    │
└─────────────────────┘

3 new words this week

────────────────────────

Difficult Words

leverage
facilitate
rollout
stakeholder

────────────────────────

Recently Added

deployment
latency
trade-off

────────────────────────
```

## V1 功能

显示：

- 今日待复习数量
- Start Review
- 最近添加
- Difficult Words

暂时不要：

- 每日打卡动画
- 连续签到
- 积分
- 排行榜
- 学习时长图表

---

# 5. 页面二：Add

这是 V1 最重要的页面。

点击底部：

**+**

进入。

## 默认界面

```text
Add to My Words

┌─────────────────────────┐
│ Word or phrase *        │
│ rollout                 │
└─────────────────────────┘

┌─────────────────────────┐
│ Original context        │
│ Optional, max 500 chars │
└─────────────────────────┘

Source: Other             ▾

             Generate ✨
```

V1 首先支持：

### Word

```text
rollout
```

### Phrase

```text
align with
```

暂时不做整段文章自动取词。

输入规则：

- Word or phrase 必填，长度 1～80 字符。
- Original context 可选，最多 500 字符，仅用于判断词性和当前语境中的含义。
- Source 可选，取值为 `work / reading / news / email / ai_chat / other`，默认 `other`。
- 客户端和服务端都要 trim、执行 Unicode NFKC，并合并连续空格。
- 原始展示文本保留，同时生成小写的 `normalized_term` 用于查重。
- 页面提示用户不要粘贴密码、客户数据或公司机密。

输入完成：

点击：

**Generate**

---

# 6. AI Loading

生成过程中：

```text
Creating your card...

Understanding meaning
Finding common patterns
Creating examples
```

不要使用聊天界面。

AI 应该是后台能力，而不是让用户感觉自己正在和 ChatGPT 聊天。

---

# 7. AI Word Card

例如输入：

**rollout**

页面：

```text
────────────────────────

rollout                 🔊

noun

────────────────────────

CORE MEANING

The process of introducing
something new into actual use
across a market, group or
organization.

────────────────────────

THINK OF IT AS

ready
 ↓
introduced
 ↓
gradually expanded

逐步正式铺开、推广

────────────────────────

COMMON PATTERNS

global rollout

product rollout

phased rollout

rollout plan

────────────────────────

EXAMPLE

The company is preparing for
a global rollout of the service.

🔊

────────────────────────

WORK EXAMPLE

We plan to roll out the new
training program to three more
countries in Q4.

🔊

────────────────────────

RELATED

launch
release
deployment

────────────────────────

Source

Work                 ▾

────────────────────────

        Save Word

────────────────────────
```

---

# 8. Word Card 数据规则

每张卡只表示一个单词或短语在一个具体语境下的一个核心含义。V1 不在同一卡片中保存多个义项。

每张卡必须包含：

### 必填

- Word
- Entry Type（word / phrase）
- Lemma
- Part of Speech
- Core Meaning
- Chinese Hint
- Mental Model
- Common Collocations
- Common Example
- Personal / Work Example

### 可选

- Related Words
- Confusing Words
- Original Context
- Source

---

# 9. AI 内容原则

AI 不允许只输出：

> rollout = 推出

Core Meaning 必须：

### 先使用英文解释概念

例如：

> The process of introducing something new into actual use across a group, market or organization.

### 再提供中文辅助

例如：

> 正式推出并逐步铺开。

中文的作用：

**帮助理解**

而不是：

**替代英语理解。**

---

# 10. AI 个性化

系统中预设一个：

`user_learning_profile`

例如：

```text
Primary use cases:
- Workplace English
- Technology news
- AI
- Retail
- Training
- International projects

Preferred examples:
- realistic
- professional
- natural spoken/work English

Explanation level:
Intermediate English learner
```

AI 生成例句时优先参考这些背景。

例如：

deployment

优先：

> We completed the deployment of the new devices in Indonesia.

不要优先：

> The military began its deployment.

---

# 11. 保存成功

点击：

**Save Word**

提示：

```text
✓ Added to My Words
```

然后提供：

```text
View Word

Add Another
```

---

# 12. 页面三：My Words

页面：

```text
My Words

Search words...

All    Learning    Difficult    Mastered

────────────────────────

rollout

正式推出、逐步铺开

Work

Next review: Today

────────────────────────

deployment

部署、投入实际使用

Tech

Next review: Tomorrow

────────────────────────

facilitate

帮助某件事情更容易发生

Work

Next review: Sep 15

────────────────────────
```

---

# 13. 搜索

输入：

```text
deploy
```

应该能够找到：

```text
deploy
deployment
```

V1 可以先使用：

- 精确匹配
- prefix
- simple text search

暂时不需要 semantic search。

---

# 14. 单词状态

每个单词拥有：

```text
NEW
LEARNING
MASTERED
```

另外计算一个：

```text
DIFFICULT
```

DIFFICULT 不一定是正式状态。

V1 根据最近复习结果动态判断：

```text
最近 10 次复习中 Again >= 3 次
```

它是计算标签，不作为 `words` 表中的持久化状态。

---

# 15. 页面四：Review

每天进入：

```text
Review

12 words today

Start
```

进入卡片：

```text
────────────────────────

rollout

Can you remember it?




        Show Answer

────────────────────────
```

先强制用户回忆。

不能一开始直接显示答案。

---

# 16. Show Answer

点击之后：

```text
rollout

The process of introducing
something new into actual use...

🔊

Common:

global rollout
phased rollout

Example:

We plan to roll out the new
training program next quarter.

────────────────────────

Again    Hard    Good    Easy

────────────────────────
```

---

# 17. 四个复习按钮

定义：

### Again

完全忘记。

### Hard

想起来一点，但不牢。

### Good

正常记住。

### Easy

非常熟。

复习算法根据结果更新下一次复习时间。

---

# 18. Review Algorithm

V1 直接使用 `ts-fsrs`，不要自行仿写 FSRS，也不要维护固定的 `1 / 3 / 7 / 30` 天规则。

固定参数：

```text
request_retention: 0.9
maximum_interval: 36500
enable_fuzz: true
enable_short_term: false
```

调度规则：

- 保存新词时创建 FSRS 空卡，首次 `due` 为用户本地时间次日 00:00。
- 数据库存储 UTC `timestamptz`，到期条件统一为 `due <= server_now`。
- 评分时间以服务器时间为准。
- 每次评分调用 `scheduler.next(card, now, rating)`。
- 更新 `word_memory` 和写入 `review_history` 必须在同一个事务中完成。
- V1 不允许用户修改 retention、权重或其他算法参数。

产品状态动态计算，不单独保存：

```text
NEW       reps = 0
DIFFICULT 最近 10 次复习中 Again >= 3 次
MASTERED  reps >= 3 且 stability >= 30 天且不是 DIFFICULT
LEARNING  其余情况
```

`DIFFICULT` 是计算标签，不是 FSRS 状态。

---

# 19. 发音

V1 支持两个地方：

## Word

```text
rollout 🔊
```

## Example

```text
The company plans a global rollout.

🔊
```

第一版优先使用浏览器 Speech Synthesis。

设置：

```text
language: en-US
```

提供：

```text
0.75x
1.0x
1.25x
```

默认：

```text
1.0x
```

---

# 20. V1 暂时不做录音

V1：

**只听，不跟读评分。**

原因：

跟读会引入：

- 麦克风权限
- Audio Recording
- Speech-to-Text
- 音频存储
- Pronunciation Assessment
- 更多 UI

容易让第一版规模增加一倍。

但是数据库和前端结构要为后续预留。

---

# 21. 页面五：Me

保持极简。

```text
My Learning

235

Words

────────────────────

86
Mastered

18
Difficult

────────────────────

This Week

42 reviews

────────────────────

Settings

Voice
Playback Speed
AI Settings
Account

────────────────────
```

---

# 22. 数据库

使用：

**Supabase PostgreSQL**

---

## Table：profiles

```sql
id
email
display_name
learning_profile
timezone
voice_name
playback_rate
created_at
updated_at
```

---

## Table：words

```sql
id
user_id

word
normalized_term
entry_type
lemma
part_of_speech

core_meaning
chinese_hint
mental_model

source
original_context
ai_model
prompt_version

created_at
updated_at
```

---

## Table：collocations

```sql
id
word_id
text
sort_order
```

---

## Table：examples

```sql
id
word_id

sentence
example_type

created_at
```

example_type：

```text
common
contextual
```

---

## Table：related_words

```sql
id
word_id

related_word
relationship
```

relationship：

```text
related
confusing
synonym
```

---

## Table：word_memory

```sql
word_id
user_id

difficulty
stability

due
last_review

elapsed_days
scheduled_days
reps
lapses
state
version

created_at
updated_at
```

---

## Table：review_history

```sql
id

user_id
word_id

rating

reviewed_at

previous_due
new_due

previous_state
new_state
previous_stability
new_stability
previous_difficulty
new_difficulty
elapsed_days
scheduled_days
algorithm_version
```

rating：

```text
1 = Again
2 = Hard
3 = Good
4 = Easy
```

数据库约束：

- 主键统一使用 UUID，所有时间字段使用 `timestamptz`。
- `profiles.id` 外键关联 `auth.users.id`。
- `words` 添加唯一约束 `(user_id, normalized_term)`。
- `word_memory.word_id` 直接作为主键，保证一个词条只有一份记忆状态。
- 所有子表通过外键关联词条并使用 `ON DELETE CASCADE`。
- 枚举字段、长度和 `rating 1～4` 使用 enum 或 check constraint。
- 建立 `(user_id, created_at desc)` 与 `(user_id, due)` 索引。
- 使用数据库函数 `save_word_card(...)` 和 `record_review(...)` 保证多表写入原子性。
- 所有公开表启用 RLS；登录用户只能对 `user_id = auth.uid()` 的记录执行允许的操作。
- RLS 必须分别测试匿名用户及登录用户的 select / insert / update / delete。

重复词规则：

- 生成前按 `normalized_term` 查重，已存在时不调用 LLM。
- UI 提供 View Existing、Update Context and Regenerate、Cancel。
- Regenerate 只替换学习内容，不重置已有记忆进度。
- 并发重复保存由数据库唯一约束兜底，API 返回 `409 Conflict`。
- 删除操作需要二次确认，并级联删除对应复习数据。

---

# 23. 后续预留表

V1 暂时不用，但预留设计。

## pronunciation_records

```sql
id
user_id
word_id
example_id

audio_url

recognized_text

accuracy
fluency
pronunciation

created_at
```

---

# 24. AI API

API：

```text
POST /api/words/generate
```

Request：

```json
{
  "text": "rollout",
  "originalContext": "We are planning a phased rollout next quarter.",
  "source": "work"
}
```

Response：

```json
{
  "word": "rollout",
  "normalizedTerm": "rollout",
  "entryType": "word",
  "lemma": "rollout",
  "partOfSpeech": "noun",

  "coreMeaning":
    "The process of introducing something new into actual use across a market, group or organization.",

  "chineseHint":
    "正式推出并逐步铺开",

  "mentalModel": [
    "prepared",
    "introduced",
    "expanded"
  ],

  "collocations": [
    "global rollout",
    "product rollout",
    "phased rollout",
    "rollout plan"
  ],

  "examples": {
    "common":
      "The company is preparing for a global rollout of the service.",

    "contextual":
      "We plan to roll out the new training program to three more countries in Q4."
  },

  "relatedWords": [
    {
      "word": "launch",
      "relationship": "confusing"
    },
    {
      "word": "deployment",
      "relationship": "related"
    }
  ]
}
```

---

# 25. AI Prompt 原则

System Prompt 应规定：

你不是词典翻译工具。

你的目标是帮助英语学习者真正理解一个英语词或表达的核心概念，并能够在真实工作环境中使用。

要求：

1. Core Meaning 优先使用简单自然英语。
2. 中文只作为辅助。
3. 不使用复杂词汇解释简单词汇。
4. 示例必须自然。
5. 优先生成工作和科技环境中的真实例句。
6. 不要为了显得丰富生成罕见含义。
7. 有 Original Context 时只生成与语境最相关的一个核心含义；没有 Context 时只生成最常见、最符合用户学习方向的一个现代含义。
8. 返回严格 JSON。

---

# 26. 防止 AI 乱输出

生成接口和保存接口都必须执行同一个运行时 Schema Validation。服务器端生成流程：

```text
Authenticate
↓
Validate input
↓
Check duplicate
↓
LLM structured output
↓
Schema validation
↓
Return draft
```

保存流程：

```text
Authenticate
↓
Schema validation again
↓
Database unique check
↓
Transactional save
```

不能将未校验的 AI 输出直接显示或保存。生成接口超时为 20 秒；格式错误或临时模型错误只自动 Retry 一次。AI Key 只能存在服务端，普通日志不得记录完整 Original Context。

如果 AI 返回格式错误：

```text
自动 Retry 一次
```

仍然失败：

```text
Show:
"Unable to generate this card."
```

不要保存错误数据。

---

# 27. 技术栈

前端：

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

后端：

```text
Next.js Server
```

数据库：

```text
Supabase PostgreSQL
```

登录：

```text
Supabase Auth
```

AI：

```text
LLM API
```

部署：

```text
GitHub
↓
Vercel
```

手机：

```text
PWA
```

---

# 28. 项目结构建议

```text
my-words/

app/

  page.tsx

  today/
  words/
  words/[id]/
  add/
  review/
  me/

  api/
    words/
      generate/
      save/
    review/

components/

  word-card/
  review-card/
  audio-button/
  bottom-nav/

lib/

  ai/
  supabase/
  fsrs/
  speech/

types/

  word.ts
  review.ts

prompts/

  generate-word-card.ts
```

---

# 29. 开发阶段

## Phase 1：项目骨架

完成：

- Next.js
- Tailwind
- shadcn/ui
- Bottom Navigation
- Supabase
- Auth

验收：

可以登录并进入首页。

---

# 30. Phase 2：Add Word

完成：

```text
Add
↓
输入 word
↓
AI API
↓
生成 Word Card
```

暂时不用保存。

验收：

输入：

```text
rollout
```

能够看到完整 AI Card。

这是第一阶段最关键里程碑。

---

# 31. Phase 3：My Words

增加：

```text
Save Word
```

完成：

- 保存数据库
- Words List
- Word Detail
- Search

验收：

保存后刷新页面数据仍然存在。

---

# 32. Phase 4：Audio

完成：

- Word 发音
- Sentence 发音
- playback speed

验收：

手机 Chrome / Safari 可以正常播放。

---

# 33. Phase 5：Review

实现：

```text
Today due words
↓
Review
↓
Again / Hard / Good / Easy
↓
Update due date
```

验收：

第二天能够按照复习记录重新出现。

---

# 34. Phase 6：Today

接入真实数据：

```text
Due today
Difficult
Recently Added
```

此时 V1 产品闭环完成。

---

# 35. Phase 7：PWA

完成：

- Manifest
- App Icon
- Home Screen
- Mobile safe area
- PWA display mode

验收：

手机可以：

**Add to Home Screen**

并独立打开。

---

# 36. V1 开发停止线

以下需求即使想到，也先不开发：

- AI Chat
- 发音评分
- 每日文章
- 系统词书
- 图片识词
- 浏览器插件
- 微信登录
- Google 登录
- 排行榜
- 好友
- 游戏
- AI Teacher
- Shadowing
- 成就系统

统一放到：

**Backlog**

---

# 37. V1 最终验收路径

测试用户执行：

### Step 1

打开 App。

### Step 2

点击：

+

### Step 3

输入：

```text
rollout
```

### Step 4

AI 生成学习卡。

### Step 5

点击：

**Save**

### Step 6

进入：

**Words**

能够找到 rollout。

### Step 7

点击 🔊。

能够听到正确发音。

### Step 8

第二天进入：

**Today**

看到：

```text
1 word to review
```

### Step 9

进入 Review。

完成：

```text
Good
```

### Step 10

系统安排下一次复习。

如果整个路径顺畅：

**V1 即视为完成。**

---

# 38. 第一阶段 Codex / Claude Code 开发任务

不要一次性把整个 PRD 丢给 AI 说：

> “帮我全部开发完。”

应该拆任务。

### Task 01

创建 Next.js 项目，配置 Tailwind 和 shadcn/ui，构建移动优先的 5 Tab 页面框架。

### Task 02

连接 Supabase，实现 Email 登录和 Session。

### Task 03

创建数据库 Schema 和 RLS Policy。

### Task 04

先定义 Word Card JSON Schema，再完成 Add 页面和 `/api/words/generate`；所有 AI 输出必须校验通过后才能显示。

### Task 05

完成 Word Card UI，包括 Edit、Regenerate、错误状态和重复词提示。

### Task 06

完成事务化 Save Word，并在保存接口再次执行 Schema Validation。

### Task 07

完成 My Words、Word Detail、Edit Card 和 Delete Word。

### Task 08

完成精确匹配、prefix search 和重复词处理。

### Task 09

完成浏览器 Speech Synthesis。

### Task 10

实现 Review 数据模型和复习算法。

### Task 11

完成 Review UI。

### Task 12

完成 Today Dashboard。

### Task 13

完成 PWA。

### Task 14

进行 Mobile UI 和错误状态测试。

### Task 15

部署到 Vercel。

---

# 39. 开发原则

每完成一个 Task：

```text
Implement
↓
Run
↓
Test
↓
Commit
```

然后再开发下一个。

禁止 AI：

- 无要求增加页面
- 无要求修改数据库模型
- 自动添加复杂动画
- 自动增加新的依赖
- 大规模重构已正常工作的代码

---

# 40. 第一阶段最终状态

最终产品只需要做到：

```text
              My Words

   Add
    ↓
AI Understand
    ↓
  Save
    ↓
 Listen
    ↓
 Review
    ↓
Remember
```

只要这个闭环好用，就已经是一个完整产品。

后续所有 AI、语音和自动化能力，都应该围绕这个闭环增强，而不是改变它。
