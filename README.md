# HSK Learning

Website học tiếng Trung tĩnh, chạy trực tiếp trên GitHub Pages, không cần backend hoặc bước build.

```text
index.html                Trang chủ tổng
HSK1/index.html           HSK 1
HSK2/index.html           HSK 2
HSK3/
  index.html              HSK 3
  data/                   Manifest nguồn và kiểm tra từ vựng bài đọc
  README.md               Ghi chú nội dung HSK 3
HSK4/
  index.html              HSK 4 Thượng và Hạ
  app.js, styles.css      Chức năng và phần giao diện riêng
  data/, assets/          Nội dung học và minh họa
  hsk3-theme.css          CSS dẫn xuất từ HSK 3
  speech.js, README.md    Phát âm riêng HSK 4 và ghi chú
shared/
  css/                    Header và bố cục flashcard dùng chung
  js/                     Điều hướng và phát âm HSK 1–3
scripts/                  Công cụ bảo trì
tests/                   Kiểm thử dữ liệu, giao diện và chức năng
404.html                  Chuyển các địa chỉ khóa học cũ trên GitHub Pages
```

HSK 1–3 giữ nguyên cấu trúc HTML độc lập, dữ liệu học và logic trong từng trang. Việc sắp xếp thư mục không tách lại toàn bộ ứng dụng. Các trang dùng đường dẫn tương đối nên hỗ trợ cả đường dẫn gốc và tiền tố repository trên GitHub Pages.

HSK 4 Thượng đã mở đủ Bài 1–10 với 387 mục từ theo bài, 40 điểm ngữ pháp, 50 bài đọc/250 câu hỏi và 18 dạng luyện tập mỗi bài. Quyển Hạ vẫn Sắp ra mắt. Xem [nội dung, nguồn và kiểm thử HSK 4](HSK4/README.md).

Chạy thử từ gốc repository:

```sh
python -m http.server 8000
```

Mở `http://localhost:8000/index.html`. Trang chủ liên kết đến `HSK1/index.html` đến `HSK4/index.html`. Khóa localStorage và origin giữ nguyên, nên chuyển thư mục không làm mất tiến độ trên cùng website/trình duyệt; tùy chọn giọng HSK 3 vẫn dùng khóa riêng.

Các bookmark `hsk1.html`, `hsk2.html`, `hsk3.html` được trang 404 tùy chỉnh của GitHub Pages chuyển sang thư mục mới, giữ query và hash. Máy chủ tĩnh khác cần cấu hình dùng `404.html` làm trang lỗi để hỗ trợ các địa chỉ cũ này; `python -m http.server` mặc định chỉ phục vụ các địa chỉ mới.

Các lệnh kiểm thử (cần Node.js, Playwright và Chromium):

```sh
node tests/hsk123-compact-games.cjs
node tests/course-navigation.cjs
node tests/hsk3-smoke.cjs
node tests/hsk-speech.cjs
node tests/reading-audio-stop.cjs
node tests/hsk123-reading-ui.cjs
node tests/reading-picker-parity.cjs
node tests/hsk4-content.cjs
node tests/hsk4-upper-content.cjs
node tests/hsk4-upper-browser.cjs
node tests/hsk4-smoke.cjs
node tests/hsk4-exercise-updates.cjs
node tests/hsk4-ui-parity.cjs
```

Cập nhật CSS dẫn xuất của HSK 4 khi giao diện HSK 3 thay đổi: `python scripts/sync-hsk3-theme.py`.

HSK 1–3 dùng chung `shared/css/hsk-game-compact.css` cho các game: đề 32px, đáp án 23px, giãn dòng 1.45; khung 20px trên máy tính và 16px trên điện thoại, khoảng cách đáp án 10px. CSS chỉ áp dụng trong màn hình luyện tập, giữ nguyên màu chủ đề, nội dung và tiến độ.

Bài đọc HSK 1–3 dùng `shared/js/hsk-reading-ui.js` và `shared/css/hsk-reading-ui.css` để trình bày một khung theo HSK 4, pinyin dạng ruby và hộp tra từ cạnh từ được chọn. Các bộ dữ liệu, chấm điểm và tiến độ vẫn do từng khóa quản lý.
