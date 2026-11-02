# HSK 4 — Bài 1 để duyệt

## Phạm vi và khảo sát hệ thống

Đã kiểm tra cấu trúc repository: trang chủ `index.html`, ba trang học `hsk1.html`, `hsk2.html`, `hsk3.html`, ba tài nguyên giao diện/điều hướng dùng chung, bộ phát âm và năm bộ kiểm thử hiện có. Các cấp 1–3 là HTML độc lập, phần lớn CSS, JavaScript và dữ liệu được nhúng trong HTML; không có backend hay bước build. HSK 3 có 18 bài, 36 chủ đề, các tab từ vựng/ngữ pháp/flashcard/trò chơi, bài đọc có tra từ tại vị trí bấm, ôn tập, lịch sử và sao lưu localStorage. Trang chủ trước đây hiển thị HSK 4 là sắp ra mắt.

HSK 4 theo cùng bố cục, luồng học và các dạng luyện tập đang có ở HSK 3. Dữ liệu và engine mới tách file để mở rộng nhiều bài mà không sao chép trò chơi từng bài. Dùng trực tiếp `../hsk-header.css`. `speech.js` kế thừa bộ phát âm `hsk-speech.js`, chỉ đổi khóa giọng đọc thành `hsk4-voice` để không dùng chung tùy chọn các cấp trước. Không sửa HTML, CSS, JavaScript hoặc dữ liệu của HSK 1–3.

Chỉ mở **Bài 1 — 我们来中国学习了**, quyển Thượng. Bài 2–10 chưa mở theo yêu cầu chờ duyệt. Quyển Hạ gồm Bài 11–20 hiển thị **Sắp ra mắt**, chưa có nguồn, không tạo từ vựng/ngữ pháp cho quyển này. Không đánh số lại Bài 11 thành Bài 1.

## Nội dung

- Nguồn: tài liệu người dùng gửi `HSK 4 - Thượng.docx`. Bài 1 trong tài liệu đã có tiếng Việt.
- 40 từ theo đúng thứ tự, gồm Hán tự, pinyin, loại từ, nghĩa Việt, câu ví dụ, pinyin câu và bản dịch. Loại từ được diễn giải sang tiếng Việt; ký hiệu gốc lưu riêng để đối chiếu.
- 4 cấu trúc: 任何; 要是; 随着; 一方面……，另一方面……. Giữ công thức, giải thích và 4 ví dụ gốc.
- Tiêu đề tiếng Việt, pinyin tiêu đề, cách dùng và lưu ý ngữ pháp được bổ sung.
- 40 câu điền từ với bốn đáp án được chọn riêng; 40 câu sắp xếp từ dùng ví dụ nguồn. Các chế độ từ vựng, nghe, dịch và luyện nói dùng đủ 40 mục từ.
- 4 câu trắc nghiệm ngữ pháp; 4 câu sắp xếp và 4 câu viết ngữ pháp dùng bốn ví dụ nguồn, không quảng cáo thành một ngân hàng câu hỏi độc lập lớn hơn thực tế.
- 3 bài đọc bổ sung dài lần lượt 184, 185, 175 ký tự, gồm dấu câu; tổng 12 câu hỏi nội dung, ý chính, suy luận, có đáp án và giải thích Việt.
- Một đề viết đoạn văn và đoạn mẫu có pinyin, bản dịch; tự lưu nháp khi gõ và khôi phục khi tải lại trang.
- Bài tập/bài đọc/lưu ý bổ sung được ghi rõ, không trình bày như trích nguyên văn giáo trình.
- Từ điển tra cứu kế thừa 2.505 mục từ của HSK 3, bổ sung ba cách đọc theo ngữ cảnh trong file riêng cho 还, 只, 得. Không đưa các mục tra cứu này vào danh sách 40 từ mới.
- Bấm từ trong bài đọc để mở nghĩa và pinyin gần vị trí bấm; hỗ trợ bàn phím và đóng bằng Escape.

Pinyin và các khoảng trắng trong ví dụ nguồn được giữ nguyên, bao gồm các chỗ nguồn viết dính âm tiết và dùng ký tự `ɡ`. Không tự sửa nguồn âm thầm. Đây là bản triển khai theo tài liệu cung cấp, chưa phải bản hiệu đính độc lập toàn bộ pinyin của giáo trình.

## Chế độ học

Hán tự → nghĩa; nghĩa → Hán tự; chọn pinyin; nghe chọn chữ; gõ Hán tự; nghe chép chính tả; điền từ; sắp xếp từ; dịch câu; đọc hiểu câu; luyện nói; trắc nghiệm ngữ pháp; sắp xếp câu ngữ pháp; viết câu ngữ pháp; đọc hiểu theo đoạn; viết đoạn văn; ôn tập tổng hợp.

Câu hỏi có đáp án cố định được chấm theo đáp án, bỏ khác biệt dấu câu và khoảng trắng. Dịch câu, đọc hiểu câu tự viết, luyện nói, viết câu ngữ pháp và viết đoạn dùng tự đối chiếu; không chấm đúng theo từ khóa hoặc tuyên bố có AI chấm ngữ nghĩa. Kết quả tự đối chiếu tách khỏi điểm câu chấm tự động.

## Tiến độ và điều hướng

Khóa riêng: `hsk4-quest-v1`, `hsk4-guided-v1-L01`, `hsk4-voice`. Lưu từ đã/chưa thuộc, từ từng sai, lượt luyện tập hoàn thành, tab đã mở, bài đã mở học và bản nháp. Thống kê Thượng/Hạ/tổng chỉ tính nội dung đã mở; không ghi tỷ lệ Bài 1 là tỷ lệ hoàn thành 20 bài. Mở trang bài học không đồng nghĩa đã nắm vững bài.

Ôn tập theo toàn bộ từ, từ chưa thuộc, từ từng trả lời sai. Xuất/nhập bản sao lưu HSK 4 có kiểm tra cấu trúc; yêu cầu xác nhận trước khi thay thế dữ liệu hiện có. Đặt lại HSK 4 không xóa tiến độ cấp khác. Lịch sử giữ tối đa 500 lượt; màn hình hiển thị 50 lượt mới nhất. Dữ liệu vẫn nằm trên trình duyệt, không có đồng bộ tài khoản.

Điều hướng dùng hash, có nút quay về bài học/ôn tập, hỗ trợ nút Back của trình duyệt. Tải lại trang viết giữ đúng màn hình và nháp; tải lại lượt chơi đang làm trở về danh sách chế độ, không khôi phục lượt chơi dở.

## File và triển khai

- `index.html`: khung trang; `styles.css`: giao diện HSK 4; `app.js`: điều hướng, học, trò chơi, tiến độ; `speech.js`: phát âm.
- `data/lesson-01.json`: nội dung nguồn Bài 1.
- `data/practice-01.json`: ngân hàng luyện tập và bài đọc bổ sung.
- `data/dictionary.json`, `data/dictionary-overrides.json`: tra cứu bổ trợ.
- `data/source-manifest.json`: SHA-256 tài liệu gốc và nội dung từ vựng, bản đối chiếu ngữ pháp.
- `../tests/hsk4-content.cjs`, `../tests/hsk4-smoke.cjs`: kiểm tra dữ liệu và trình duyệt.
- `../index.html`: chỉ thay thẻ HSK 4 thành liên kết vào khóa học, ghi đúng 1 bài đã mở / 40 từ / 4 cấu trúc.

Có thể chạy bằng bất kỳ máy chủ file tĩnh nào, ví dụ `python -m http.server 8000` ở gốc repository, rồi mở `/HSK4/index.html`. Hoạt động trên GitHub Pages với đường dẫn `/HSK-version-3.0/HSK4/index.html`; không cần backend/build. Mở trực tiếp bằng `file://` không hỗ trợ tải JSON qua fetch.

## Kiểm tra

```sh
node --check HSK4/app.js
node --check HSK4/speech.js
node tests/hsk4-content.cjs
node tests/hsk4-smoke.cjs
node tests/hsk3-smoke.cjs
```

Cần Playwright và Chromium; có thể đặt `CHROMIUM_PATH`. Đặt `HSK4_SCREENSHOTS` thành một thư mục đã có để lưu ảnh máy tính/điện thoại.

Kiểm tra nội dung đối chiếu hash toàn bộ bảy trường nguồn và đầy đủ ngữ pháp, cấu trúc đáp án, sắp xếp câu, câu điền từ và khả năng tra mọi từ trong bài đọc. Kiểm thử trình duyệt dùng máy chủ tĩnh có tiền tố repository giống GitHub Pages, màn hình 1440px/390px, các chế độ, hoàn thành bài đọc, phản hồi đúng/sai, bộ lọc, flashcard, bản nháp, sao lưu, từ sai, khóa lưu trữ tách biệt và điều hướng.

Phát âm thực tế cần giọng tiếng Trung trên thiết bị; nhận diện cần trình duyệt hỗ trợ, kết nối dịch vụ và quyền micro. Kiểm thử tự động xác minh lời gọi phát âm, không xác nhận âm thanh nghe thực tế hay chất lượng nhận diện. Chưa xuất bản lên GitHub Pages.
