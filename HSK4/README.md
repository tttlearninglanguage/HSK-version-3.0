# HSK 4 — Bài 1 để duyệt

## Phạm vi và khảo sát hệ thống

Đã kiểm tra cấu trúc repository: trang chủ `index.html`, ba trang học `HSK1/index.html`, `HSK2/index.html`, `HSK3/index.html`, ba tài nguyên giao diện/điều hướng dùng chung, bộ phát âm và năm bộ kiểm thử hiện có. Các cấp 1–3 là HTML độc lập, phần lớn CSS, JavaScript và dữ liệu được nhúng trong HTML; không có backend hay bước build. HSK 3 có 18 bài, 36 chủ đề, các tab từ vựng/ngữ pháp/flashcard/trò chơi, bài đọc có tra từ tại vị trí bấm, ôn tập, lịch sử và sao lưu localStorage. Trang chủ trước đây hiển thị HSK 4 là sắp ra mắt.

HSK 4 theo cùng bố cục, luồng học và các dạng luyện tập đang có ở HSK 3. Dữ liệu và engine mới tách file để mở rộng nhiều bài mà không sao chép trò chơi từng bài. Dùng trực tiếp `../shared/css/hsk-header.css` và `../shared/css/flashcard-compact.css`, cùng `hsk3-theme.css` được trích nguyên CSS của HSK 3 theo đúng thứ tự cascade. `speech.js` kế thừa bộ phát âm `shared/js/hsk-speech.js`, chỉ đổi khóa giọng đọc thành `hsk4-voice` để không dùng chung tùy chọn các cấp trước. Không sửa HTML, CSS, JavaScript hoặc dữ liệu của HSK 1–3. Bộ kiểm thử HSK 3 được sửa bước về trang chủ tổng: bấm đúng liên kết logo và chờ URL đích, thay cho nút về trang chủ nội bộ HSK 3. Không sửa hành vi điều hướng của trang học.

Chỉ mở **Bài 1 — 我们来中国学习了**, quyển Thượng. Bài 2–10 chưa mở theo yêu cầu chờ duyệt. Quyển Hạ gồm Bài 11–20 hiển thị **Sắp ra mắt**, chưa có nguồn, không tạo từ vựng/ngữ pháp cho quyển này. Không đánh số lại Bài 11 thành Bài 1.

## Giao diện đồng bộ HSK 3

Bản sửa giao diện dùng CSS thực tế của HSK 3, không tiếp tục bộ giao diện thẻ màu xanh riêng. Chạy `python scripts/sync-hsk3-theme.py` từ gốc repository khi cần cập nhật bản CSS dẫn xuất. Script chỉ đọc `HSK3/index.html`, không sửa các cấp trước.

- Trang chủ: banner minh họa sách, lối tắt tiến độ/ôn tập và thẻ bài học pastel `qh-*` như HSK 3; giữ riêng hai mục Thượng/Hạ.
- Trong bài: `unit-title-banner`, tab và màu nhận diện của Bài 1 theo mẫu HSK 3.
- Từ vựng: bảng STT / Hán tự / Pinyin / Nghĩa / Ví dụ và dịch / Học; giữ hiển thị loại từ để đáp ứng tài liệu HSK 4. Bảng cuộn trong khung trên màn hình nhỏ.
- Flashcard: dùng trực tiếp CSS compact chung, bộ lọc Tất cả / Đã thuộc / Chưa thuộc, thanh tiến độ, nút Nghe / Trước / Đánh dấu / Trộn thẻ / Tiếp. Trộn thẻ không thay đổi thứ tự dữ liệu nguồn.
- Ngữ pháp: các khung `h2-ref-*` như HSK 3, gồm công thức vàng, giải thích, lưu ý và ví dụ.
- Trò chơi: nhóm từ vựng, nghe/viết, câu/ngữ pháp, đọc đoạn và vận dụng; dùng lại khung câu hỏi, lựa chọn đáp án và chọn giọng đọc.
- Đọc hiểu: bố cục `h2-reading-layout` hai cột trên máy tính, xếp dọc trên điện thoại; tra từ gần vị trí bấm.
- Viết đoạn, ôn tập, thống kê: khung hướng dẫn `answer-area` và các thành phần `dash-*` của HSK 3.

`tests/hsk4-ui-parity.cjs` so sánh trực tiếp kiểu hiển thị được trình duyệt tính toán cho các thành phần của HSK 3 và HSK 4 tại 1440px/390px; đồng thời xác minh file CSS dẫn xuất khớp toàn bộ cascade nguồn. Kiểm tra gồm font, màu, border, bo góc, padding, bóng, cách hiển thị, không tràn ngang, tìm bài, bộ lọc flashcard và thứ tự dữ liệu khi trộn thẻ.

## Nội dung

- Nguồn: tài liệu người dùng gửi `HSK 4 - Thượng.docx`. Bài 1 trong tài liệu đã có tiếng Việt.
- 40 từ theo đúng thứ tự, gồm Hán tự, pinyin, loại từ, nghĩa Việt, câu ví dụ, pinyin câu và bản dịch. Loại từ được diễn giải sang tiếng Việt; ký hiệu gốc lưu riêng để đối chiếu.
- 4 cấu trúc: 任何; 要是; 随着; 一方面……，另一方面……. Giữ công thức, giải thích và 4 ví dụ gốc.
- Tiêu đề tiếng Việt, pinyin tiêu đề, cách dùng và lưu ý ngữ pháp được bổ sung.
- 40 câu điền từ với bốn đáp án được chọn riêng; 40 câu sắp xếp từ dùng ví dụ nguồn. Các chế độ từ vựng, nghe, dịch và luyện nói dùng đủ 40 mục từ.
- 4 câu trắc nghiệm ngữ pháp; 4 câu sắp xếp và 4 câu viết ngữ pháp dùng bốn ví dụ nguồn, không quảng cáo thành một ngân hàng câu hỏi độc lập lớn hơn thực tế.
- 5 bài đọc bổ sung dài lần lượt 184, 185, 175, 202, 200 ký tự, gồm dấu câu; mỗi bài 5 câu hỏi, tổng 25 câu hỏi nội dung, ý chính, suy luận. Câu hỏi/đáp án bằng tiếng Trung, có pinyin đoạn đọc, bản dịch và giải thích Việt.
- Một đề viết đoạn văn và đoạn mẫu có pinyin, bản dịch; tự lưu nháp khi gõ và khôi phục khi tải lại trang.
- Bài tập/bài đọc/lưu ý bổ sung được ghi rõ, không trình bày như trích nguyên văn giáo trình.
- Từ điển tra cứu kế thừa 2.505 mục từ của HSK 3, bổ sung cách đọc theo ngữ cảnh cho 还, 只, 得 và các mục tra cứu phục vụ đáp án tiếng Trung trong file riêng. Không đưa các mục tra cứu này vào danh sách 40 từ mới.
- Bấm từ trong bài đọc để mở nghĩa và pinyin gần vị trí bấm; hỗ trợ bàn phím và đóng bằng Escape.

Pinyin và các khoảng trắng trong ví dụ nguồn được giữ nguyên, bao gồm các chỗ nguồn viết dính âm tiết và dùng ký tự `ɡ`. Không tự sửa nguồn âm thầm. Đây là bản triển khai theo tài liệu cung cấp, chưa phải bản hiệu đính độc lập toàn bộ pinyin của giáo trình.

## Chế độ học

Hán tự → nghĩa; nghĩa → Hán tự; chọn pinyin; nghe chọn chữ; nghe câu chọn câu tiếng Trung tương ứng; gõ Hán tự; nghe chép chính tả; điền từ; sắp xếp từ; dịch câu; đọc hiểu câu; luyện nói; trắc nghiệm ngữ pháp; sắp xếp câu ngữ pháp; viết câu ngữ pháp; đọc hiểu theo đoạn; viết đoạn văn; ôn tập tổng hợp.

Câu hỏi có đáp án cố định được chấm theo đáp án, bỏ khác biệt dấu câu và khoảng trắng. Dịch câu, đọc hiểu câu tự viết, luyện nói, viết câu ngữ pháp và viết đoạn dùng tự đối chiếu; không chấm đúng theo từ khóa hoặc tuyên bố có AI chấm ngữ nghĩa. Kết quả tự đối chiếu tách khỏi điểm câu chấm tự động.

## Điều chỉnh bài tập theo phản hồi

- Nghe hiểu câu: nghe câu ví dụ và chọn câu tiếng Trung tương ứng, thay cho chọn bản dịch tiếng Việt.
- Đọc hiểu đoạn: cả bốn phương án của mỗi câu hỏi đều bằng tiếng Trung; toàn bộ câu hỏi cũng bằng tiếng Trung, còn giải thích giữ tiếng Việt. Bản dịch phương án cũ được giữ trong dữ liệu để đối chiếu.
- Các lựa chọn tiếng Trung có nút tra từ độc lập và nút “Chọn đáp án”; không lồng các nút, không tự nộp khi tra từ. Tra từ vẫn dùng được sau khi chấm.
- Đồng bộ toàn bộ 18 chế độ Bài 1 theo cỡ chữ thực tế của Trắc nghiệm ngữ pháp: đề 32px (line-height 1.9), đáp án 23px (line-height 1.7), nét thường 400; áp dụng cả ô nhập, từ sắp xếp, đáp án câu nghe/đọc, đáp án phản hồi và các câu ôn tổng hợp. Pinyin, chú thích, nút điều khiển giữ cỡ chữ riêng. Văn bản đoạn đọc/đoạn mẫu dùng cỡ nội dung 23px để dễ đọc đoạn dài.
- Luyện nói: kết quả nhận diện được điền vào ô trả lời, có thể sửa trước khi tự đối chiếu. Không tự nộp; bỏ qua kết quả đến muộn khi đổi câu, đổi màn hình, đã nộp hoặc đã bật lượt micro mới.

Kiểm thử `tests/hsk4-exercise-updates.cjs` đạt 116 kiểm tra tại 1440px/390px, gồm trọn bộ 40 câu nghe và bài đọc đầu tiên với 5 câu hỏi, dữ liệu tra từ, cỡ chữ, sửa kết quả micro và các tình huống kết quả đến muộn. Micro trong bộ kiểm thử được giả lập; nhận diện âm thanh thực tế vẫn phụ thuộc thiết bị và dịch vụ trình duyệt.

Kiểm thử `tests/hsk4-game-typography.cjs` đạt 171 kiểm tra, đối chiếu trực tiếp mọi chế độ và từng câu của lượt ôn tổng hợp với cỡ chữ được trình duyệt tính cho Trắc nghiệm ngữ pháp tại 1440px, 390px và 360px. Hai biến CSS `--hsk4-game-prompt-size` / `--hsk4-game-answer-size` là cấu hình chung, chỉ nằm trong giao diện HSK 4.

Phần đọc hiểu được thu gọn riêng: giãn dòng câu hỏi/đáp án 1.35, đoạn đọc 1.5, khoảng cách lựa chọn 8px, giảm đệm và đặt nút “Chọn” cạnh nội dung đáp án. Giữ nguyên cỡ chữ đề 32px và đáp án 23px. Cả 25 câu hỏi đã chuyển sang tiếng Trung, giữ bản Việt trong `questionVietnamese` để đối chiếu; bổ sung tra từ cho 项 và 符合.

`tests/hsk4-reading-layout.cjs` đạt 100 kiểm tra: cả 25 câu ở 1440×900, 1280×800, 390×844 và 360×640; xác minh cụm câu hỏi/bốn lựa chọn vừa chiều cao màn hình, không tràn ngang, tra từ không nộp và hoàn thành đúng 5/5 cho từng bài. Trên điện thoại đoạn đọc và câu hỏi vẫn xếp dọc, nên toàn trang có thể cần cuộn giữa hai phần.

## Bài đọc độc lập theo unit

Unit 1 có 5 bài đọc, mỗi bài 5 câu hỏi. Màn hình “Chọn bài đọc” hiển thị từng bài riêng, cho phép chọn bài 5 trước mà không cần làm bài 1–4. Mỗi lượt chỉ có câu hỏi của một bài; hoàn thành hiển thị kết quả của bài đó, có nút làm lại và trở về danh sách, không tự chuyển bài tiếp theo.

Các bài đọc có trường `lesson`, được lọc theo unit; hiện chỉ Unit 1 được mở. ID bài đọc nằm trong URL nên tải lại trang hoặc mở trực tiếp vẫn vào đúng bài đã chọn (bắt đầu lại từ câu 1). Kết quả lưu kèm `readingId`, hiển thị riêng trên từng thẻ bài đọc. Lịch sử cũ được giữ nguyên; những lượt đọc tổng hợp cũ không bị gán nhầm vào một bài riêng.

`tests/hsk4-independent-readings.cjs` đạt 106 kiểm tra, gồm chọn tự do, số câu đúng từng bài, hoàn thành/dừng đúng bài, làm lại, tải lại, URL trực tiếp, lưu kết quả riêng và không bắt buộc làm tuần tự. Các đoạn đọc/bài tập là nội dung bổ sung, không thay đổi 40 từ mới hay 4 cấu trúc nguồn của Unit 1.

## Tiến độ và điều hướng

Khóa riêng: `hsk4-quest-v1`, `hsk4-guided-v1-L01`, `hsk4-voice`. Lưu từ đã/chưa thuộc, từ từng sai, lượt luyện tập hoàn thành, tab đã mở, bài đã mở học và bản nháp. Thống kê Thượng/Hạ/tổng chỉ tính nội dung đã mở; không ghi tỷ lệ Bài 1 là tỷ lệ hoàn thành 20 bài. Mở trang bài học không đồng nghĩa đã nắm vững bài.

Ôn tập theo toàn bộ từ, từ chưa thuộc, từ từng trả lời sai. Xuất/nhập bản sao lưu HSK 4 có kiểm tra cấu trúc; yêu cầu xác nhận trước khi thay thế dữ liệu hiện có. Đặt lại HSK 4 không xóa tiến độ cấp khác. Lịch sử giữ tối đa 500 lượt; màn hình hiển thị 50 lượt mới nhất. Dữ liệu vẫn nằm trên trình duyệt, không có đồng bộ tài khoản.

Điều hướng dùng hash, có nút quay về bài học/ôn tập, hỗ trợ nút Back của trình duyệt. Tải lại trang viết giữ đúng màn hình và nháp; tải lại lượt chơi đang làm trở về danh sách chế độ, không khôi phục lượt chơi dở.

## File và triển khai

- `index.html`: khung trang; `hsk3-theme.css`: CSS dẫn xuất nguyên bản từ HSK 3; `styles.css`: phần bổ sung riêng HSK 4; `assets/`: ba minh họa SVG kế thừa từ giao diện HSK 3; `app.js`: điều hướng, học, trò chơi, tiến độ; `speech.js`: phát âm.
- `data/lesson-01.json`: nội dung nguồn Bài 1.
- `data/practice-01.json`: ngân hàng luyện tập và bài đọc bổ sung.
- `data/dictionary.json`, `data/dictionary-overrides.json`: tra cứu bổ trợ.
- `data/source-manifest.json`: SHA-256 tài liệu gốc và nội dung từ vựng, bản đối chiếu ngữ pháp.
- `../tests/hsk4-content.cjs`, `../tests/hsk4-smoke.cjs`, `../tests/hsk4-ui-parity.cjs`: kiểm tra dữ liệu, chức năng và đối chiếu giao diện thực tế với HSK 3.
- `../scripts/sync-hsk3-theme.py`: đồng bộ CSS dẫn xuất từ HSK 3.
- `../index.html`: chỉ thay thẻ HSK 4 thành liên kết vào khóa học, ghi đúng 1 bài đã mở / 40 từ / 4 cấu trúc.

Có thể chạy bằng bất kỳ máy chủ file tĩnh nào, ví dụ `python -m http.server 8000` ở gốc repository, rồi mở `/HSK4/index.html`. Hoạt động trên GitHub Pages với đường dẫn `/HSK-version-3.0/HSK4/index.html`; không cần backend/build. Mở trực tiếp bằng `file://` không hỗ trợ tải JSON qua fetch.

## Kiểm tra

```sh
node --check HSK4/app.js
node --check HSK4/speech.js
node tests/hsk4-content.cjs
node tests/hsk4-smoke.cjs
node tests/hsk4-ui-parity.cjs
node tests/hsk4-exercise-updates.cjs
node tests/hsk4-game-typography.cjs
node tests/hsk4-reading-layout.cjs
node tests/hsk4-independent-readings.cjs
node tests/hsk3-smoke.cjs
```

Cần Playwright và Chromium; có thể đặt `CHROMIUM_PATH`. Đặt `HSK4_SCREENSHOTS` thành một thư mục đã có để lưu ảnh máy tính/điện thoại.

Kiểm tra nội dung đối chiếu hash toàn bộ bảy trường nguồn và đầy đủ ngữ pháp, cấu trúc đáp án, sắp xếp câu, câu điền từ và khả năng tra mọi từ trong bài đọc. Kiểm thử trình duyệt dùng máy chủ tĩnh có tiền tố repository giống GitHub Pages, màn hình 1440px/390px, các chế độ, hoàn thành bài đọc, phản hồi đúng/sai, bộ lọc, flashcard, bản nháp, sao lưu, từ sai, khóa lưu trữ tách biệt và điều hướng.

Các thành phần giao diện chung đạt 142 kiểm tra đối chiếu thực tế với HSK 3 và tương tác trên 1440px/390px; thẻ lựa chọn tiếng Trung được kiểm tra riêng theo yêu cầu mới.

Kết quả Bài 1: kiểm tra nội dung và hash đạt; bộ trình duyệt đạt 270 kiểm tra trên 1440px/390px, không có lỗi JavaScript, không tràn ngang trong các chế độ, đủ dữ liệu tra cứu cho năm bài đọc. Kiểm thử hồi quy HSK 3 đạt 1.190 kiểm tra trên 1440px/390px, bao gồm mở HSK 1/2, không có lỗi JavaScript chưa xử lý.

Phát âm thực tế cần giọng tiếng Trung trên thiết bị; nhận diện cần trình duyệt hỗ trợ, kết nối dịch vụ và quyền micro. Kiểm thử tự động xác minh lời gọi phát âm, không xác nhận âm thanh nghe thực tế hay chất lượng nhận diện. Việc xuất bản GitHub Pages phụ thuộc nhánh được cấu hình trong repository; bản sửa được gửi qua PR để duyệt trước khi merge.

## Làm mới tài nguyên khi phát hành

Trang HSK 4 gắn tham số phiên bản cho `app.js` và `styles.css`; JSON dùng cùng phiên bản của script và `cache: no-cache` để trình duyệt kiểm tra lại dữ liệu, tránh tiếp tục hiển thị câu hỏi cũ sau khi triển khai. Khi phát hành thay đổi giao diện/logic, cập nhật phiên bản trong `HSK4/index.html`. Không xóa hoặc thay đổi khóa tiến độ localStorage.
