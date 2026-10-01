# 答案之書

一頁可翻的答案之書。先在心裡問完，再讓紙回答。中英對照，外觀可跟隨系統，或固定淺色、深色。

三種讀法：

- **翻書**：布面封面，打開後可以逐頁翻，也可以隨機求一頁。
- **問答**：把問題交給空白，答案以大字落下。
- **抽籤**：從一疊紙裡抽出一張。

句子皆為原創，與任何已出版的《答案之書》無關。同一個問題，不要連問三次。

## 本地運行

```bash
npm install
npm run dev
```

瀏覽器打開 [http://127.0.0.1:47291](http://127.0.0.1:47291)。

## 放到 GitHub 後用網址打開

倉庫名稱請用 `dynamic-answer-book`，並把 `main` 推上去。GitHub Actions 會自動發布到 GitHub Pages。

網址是：

https://simonlo926.github.io/dynamic-answer-book/

第一次要在 GitHub 倉庫的 Settings → Pages → Build and deployment，把 Source 選成 **GitHub Actions**。選好之後若還沒出現網站，到 Actions 把「Deploy to GitHub Pages」再跑一次。

## 答案從哪裡來

正文在 `src/data/corpus/`，一行一則，格式是 `中文 || English`。改完之後執行：

```bash
npm test
```

會檢查重複、過長，以及簡體字，並重新產生 `src/data/answers.ts`。
