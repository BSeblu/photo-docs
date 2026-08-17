import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const workspace = path.join(repoRoot, ".worktrees", "t_106139c2");

// Load the kanban task metadata
const taskFile = path.join(workspace, "task.json");
let taskBody = {};
try {
  taskBody = JSON.parse(fs.readFileSync(taskFile, "utf-8"));
} catch {
  // fallback: read the body from the task db
}

// Read notes from the scratch/postmortem directory if it exists
const postmortemDir = path.join(workspace, ".scratch", "photo-docs", "postmortem");
let notes: string[] = [];
if (fs.existsSync(postmortemDir)) {
  const files = fs.readdirSync(postmortemDir).sort();
  for (const f of files) {
    const content = fs.readFileSync(path.join(postmortemDir, f), "utf-8");
    notes.push(content);
 狙击
}

// Read the PRD for context
const prdFile = path.join(workspace, ".scratch", "photo-docs", "PRD.md");
let prdExcerpt = "";
if (fs.existsSync(prdFile)) {
  const prd = fs.readFileSync(prdFile, "utf-8").split("\n").slice(0, 50).join("\n");
  prdExcerpt = prd;
}

// Read the issue spec
const issueFile = path.join(workspace, ".scratch", "photo-docs", "issues", "22-responsive-layouts-with-shadcn.md");
let issueExcerpt = "";
if (fs.existsSync(issueFile)) {
  issueExcerpt = fs.readFileSync(issueFile, "utf-8");
}

// Build the task body for the todo comment
const taskId = process.env.HERMES_KANBAN_TASK || "t_106139c2";
const title = "Implement responsive layouts with ShadCN UI (smartphone + tablet)";

function stripWhitespace(text: string): string {
  return text.split("\n").map((l) => l.trim()).join(" ").replace(/  +/g, " ").trim();
}

// Format each note as a concise bullet
function formatNotes(notes: string[]): string[] {
  const bullets: string[] = [];
  for (const note of notes) {
    const lines = note.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("---"));
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 200) {
        bullets.push(trimmed);
      }
    }
  }
  return bullets;
}

// The action: create a comment on the task and mark it with the structured summary
const comment = `[项目创建任务] ${title}

## 摘要
创建一个 TODO 评论模板，含结构化元数据；创.io/t_106139c2）棋盘和关联问题跟踪贴纸。

## 经验背景
无先前项目实例（该任务为全新启用）。

## 任务细节
任务 ID: t_106139c2
项目: photo-docs
目标: 移动端优先 ShadCN UI+Tailwind 响应式横屏/竖屏布局（手机 + 平板）

## 关联问题
- 问题 #14: In-camera photo strip and rejection toggle
- 问题 #19: Nextcloud folder navigation and breadcrumbs
- 问题 #5: Responsive design spec (T-shirt sizing)

## 结构化元数据
\`\`\`json
{
  "task_id": "t_106139c2",
  "project": "photo-docs",
  "workspace": "${workspace}",
  "topic": "responsive-layouts-shadcn-ui",
  "tags": ["responsive", "shadcn-ui", "tailwind", "capture-ui", "orientation"],
  "priority": "high"
}
\`\`\`

## 后续步骤
- [ ] 编写 useOrientation hook — 监听窗口 resize + orientationchange 事件
- [ ] 编写 useDebounce hook — 150ms 防抖
- [ ] 构建 CapturePage — 手机竖屏/横屏 + 平板竖屏/横屏 4 种布局
- [ ] 单元测试：响应式布局切换、防抖、方向 hook
- [ ] E2E：Playwright viewport resize + 旋转 + 背景点击防御
SCRIPT;

// Write the task body and structured metadata to a temp output file
const outputPath = path.join(workspace, ".scratch", "photo-docs", "handoff", "create-todo-summary.md");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, comment, "utf-8");

// Also try to post a comment via the KANBAN_COMMENT mechanism if available
// (this script is a one-time helper; the agent does the actual task creation)

console.log("Created TODO comment template at:", outputPath);
console.log("Length:", comment.length, "chars");
