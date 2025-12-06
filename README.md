# Obsidian Filename Highlighter Plugin

這是一個 Obsidian plugin，會自動讀取當前檔案的檔名，並在文件中高亮顯示所有匹配的文字。

## 功能特色

- 🎨 **自動高亮**：根據檔名自動高亮文件中匹配的文字
- ⚡ **即時更新**：打字時即時更新高亮效果
- 🎯 **效能優化**：只掃描可見範圍（Viewport），不影響效能
- 🌓 **主題適配**：支援 Light 和 Dark 模式
- 📝 **非破壞性**：不會修改檔案內容，只在渲染層顯示效果

## 安裝方式

### 重要：打包說明

我們使用 **esbuild** 配合 `esbuild.config.mjs` 來打包 plugin。**關鍵設定**：

1. **不安裝 CodeMirror 到 node_modules**：
   - `package.json` 中**不包含** `@codemirror/*` 依賴
   - 只透過 `obsidian` 套件提供的 TypeScript types 來開發
   
2. **使用 `external` 排除**：
   - 使用萬用字元 `@codemirror/*` 排除所有 CodeMirror 套件
   - 排除 `obsidian` 和 `electron`（運行時存在）
   
3. **避免多重實例問題**：
   - 確保 CodeMirror 只從 Obsidian 環境載入
   - 不會出現 "multiple instances of @codemirror/state" 錯誤

### 方法一：手動安裝（開發模式）

1. **安裝依賴**：
   ```bash
   npm install
   ```

2. **編譯並打包程式碼**：
   ```bash
   npm run dev    # 開發模式（含 sourcemap）
   # 或
   npm run build  # 生產模式（不含 sourcemap）
   ```
   
   這會使用 `esbuild.config.mjs` 來打包程式碼。

3. **驗證打包結果**：
   - 檢查 `main.js` 的檔案大小（應該只有約 3KB）
   - 打開 `main.js`，搜尋 `@codemirror/view`
   - **正確情況**：應該只看到 `require("@codemirror/view")` 這樣的引用
   - **錯誤情況**：如果看到大量 minified code 或檔案 > 10KB，代表 CodeMirror 被打包了

4. **複製到 Obsidian**：
   - 前往你的 Vault 資料夾：`.obsidian/plugins/`
   - 建立資料夾：`obsidian-filename-highlighter`
   - 複製以下檔案：
     - `main.js` (打包後的檔案)
     - `manifest.json`
     - `styles.css`

5. **啟用 Plugin**：
   - 打開 Obsidian
   - 前往 Settings → Community Plugins
   - 重新載入 plugins (Reload plugins)
   - 開啟 "Filename Highlighter" 開關

### 方法二：開發模式

```bash
npm install
npm run dev
```

每次修改 `src/main.ts` 後，重新執行 `npm run dev` 來更新 `main.js`。

## 使用方式

1. 建立一個檔案，例如 `ability.md`
2. 在文件中輸入任何包含 `ability` 的文字，例如：
   ```
   This readability is good.
   The ability to learn is important.
   ```
3. Plugin 會自動將所有 `ability` 文字高亮顯示（橘色背景 + 紅底線）

## 技術細節

- 使用 **CodeMirror 6** 的 `ViewPlugin` 和 `Decoration` API
- 採用 **非破壞性編輯** 架構，檔案內容保持純淨
- 只掃描可見範圍，確保高效能
- 支援大小寫不敏感匹配

## 自訂樣式

編輯 `styles.css` 可以自訂高亮樣式：

```css
.cm-filename-highlight {
    background-color: rgba(255, 165, 0, 0.4);
    border-bottom: 2px solid #ff4400;
    /* 你的自訂樣式 */
}
```

## 注意事項

- 檔名長度需至少 2 個字元才會觸發高亮（避免單一字元造成全螢幕高亮）
- 高亮效果只在編輯器中顯示，不會寫入檔案
- 支援大小寫不敏感匹配

## 開發

### 開發環境設定

1. **安裝依賴**：
   ```bash
   npm install
   ```

2. **編譯並打包**：
   ```bash
   npm run dev    # 開發模式（含 inline sourcemap）
   # 或
   npm run build  # 生產模式（不含 sourcemap）
   ```
   
   這會執行 `esbuild.config.mjs` 來打包程式碼。

### 打包配置說明

我們使用 `esbuild.config.mjs` 來配置打包。**關鍵原則**：

1. **不要安裝 CodeMirror 到 `devDependencies`**：
   - 如果安裝了 `@codemirror/*` 到 node_modules，esbuild 可能會打包它們
   - 只透過 `obsidian` 套件的 types 來開發
   
2. **使用萬用字元排除**：
   ```javascript
   external: [
       "obsidian",
       "electron",
       "@codemirror/*",  // 萬用字元，排除所有 CodeMirror 套件
       "fs", "path", "url"
   ]
   ```

3. **驗證打包結果**：
   ```bash
   # 檢查檔案大小（應該只有 3KB 左右）
   ls -lh main.js
   
   # 檢查 CodeMirror 引用（應該只有 require，沒有實作碼）
   grep "@codemirror" main.js
   # 正確：var import_view = require("@codemirror/view");
   # 錯誤：看到大量 class 定義或 minified code
   ```

4. **常見問題診斷**：
   - **錯誤**: "multiple instances of @codemirror/state"
   - **原因**: CodeMirror 被打包進 `main.js`，與 Obsidian 內建版本衝突
   - **解決**: 從 `package.json` 移除 `@codemirror/*`，重新打包

## License

MIT

